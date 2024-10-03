import { WalletContextState } from "@solana/wallet-adapter-react";
import { create } from "zustand";
import bs58 from "bs58";
import { getEncodedLoginMessage } from "@/lib/helpers";
import { useSDKStore } from "./sdkStore";
import * as sdk from "@/lib/sdk";
import {
  ResearcherProfileMetadata,
  ResearcherProfileType,
} from "../models/ResearcherProfile.model";

type CreateResearcherProfileInputs = {
  name: string;
  email: string;
  organization?: string;
  bio?: string;
  profileImage?: File;
  backgroundImage?: File;
  externalResearchProfiles?: string[];
  interestedDomains?: string[];
  topPublications?: string[];
  socialLinks?: string[];
};

interface UserState {
  isAuthenticated: boolean;
  walletSignature: string | null;
  wallet: string | null;
  isLoading: boolean;
  lastChecked: number;
  error: string | null;
  checkAuth: (walletPubkey: string) => Promise<void>;
  checkAuthAndTryLogin: (wallet: WalletContextState) => Promise<void>;
  logout: (walletPubkey: string) => Promise<void>;
  createResearcherProfile: (
    data: CreateResearcherProfileInputs
  ) => Promise<void>;
  requestToAssignRepuation: () => Promise<void>;
  setError: (error: string | null) => void;
}

export type UserStore = UserState;

const AUTH_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 1 day

export const useUserStore = create<UserState>((set, get) => ({
  isAuthenticated: false,
  walletSignature: null,
  wallet: null,
  isLoading: false,
  lastChecked: 0,
  error: null,
  checkAuthAndTryLogin: async (wallet: WalletContextState) => {
    if (!wallet.publicKey) {
      return;
    }
    const { isLoading, lastChecked } = get();
    const now = Date.now();
    if (isLoading || now - lastChecked < AUTH_CHECK_INTERVAL) return;

    set({ isLoading: true });
    try {
      const checkAuthResponse = await fetch("/api/auth/check", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ walletPubkey: wallet.publicKey.toString() }),
      });
      const checkAuthResponseData = await checkAuthResponse.json();
      console.log("Auth check response:", checkAuthResponseData.data);
      const data = checkAuthResponseData.data;
      const { isAuthenticated, walletSignature } = data;
      set({
        isAuthenticated,
        walletSignature,
        wallet: wallet.publicKey.toString(),
        lastChecked: now,
      });

      if (isAuthenticated) return;

      if (!wallet.signMessage) {
        return;
      }

      const encodedMessage = getEncodedLoginMessage(
        wallet.publicKey.toBase58()
      );
      const signature = await wallet.signMessage(encodedMessage);

      const encodedSignature = bs58.encode(signature);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletSignature: encodedSignature,
          walletPubkey: wallet.publicKey.toString(),
        }),
        credentials: "include",
      });
      if (response.ok) {
        set({
          isAuthenticated: true,
          walletSignature: encodedSignature,
          wallet: wallet.publicKey.toString(),
          lastChecked: Date.now(),
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ isAuthenticated: false, lastChecked: now });
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async (walletPubkey: string) => {
    const { isLoading, lastChecked } = get();
    const now = Date.now();
    if (isLoading || now - lastChecked < AUTH_CHECK_INTERVAL) return;

    set({ isLoading: true });
    try {
      const response = await fetch("/api/auth/check", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ walletPubkey }),
      });
      const responseData = await response.json();
      console.log("Auth check response:", responseData.data);
      const data = responseData.data;
      const { isAuthenticated } = data;
      set({
        isAuthenticated,
        lastChecked: now,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ isAuthenticated: false, lastChecked: now });
    }
  },

  logout: async (walletPubkey: string) => {
    set({ isLoading: true });
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ walletPubkey }),
      });
      set({
        isAuthenticated: false,
        walletSignature: null,
        wallet: null,
        lastChecked: Date.now(),
      });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  async createResearcherProfile(data: CreateResearcherProfileInputs) {
    const { sdk: sdkInstance } = useSDKStore.getState();

    if (!sdkInstance) {
      set({ error: "SDK not initialized" });
      return;
    }

    set({ isLoading: true });

    try {
      // on-chain part

      // arweave part

      const filesToUpload: File[] = [];
      const tags = [];
      if (data.profileImage) {
        filesToUpload.push(data.profileImage);
        tags.push([
          {
            name: "Content-Type",
            value: "image/png",
          },
        ]);
      }
      if (data.backgroundImage) {
        filesToUpload.push(data.backgroundImage);
        tags.push([
          {
            name: "Content-Type",
            value: "image/png",
          },
        ]);
      }

      let arweaveUploadedIds: string[] | undefined[] = [];
      if (filesToUpload.length > 0) {
        arweaveUploadedIds = await sdkInstance.arweaveUploadFiles(
          filesToUpload,
          tags
        );
      }

      if (arweaveUploadedIds.length !== 2) {
        arweaveUploadedIds = [undefined, undefined];
      }

      const researcherProfileMetadata: ResearcherProfileMetadata = {
        email: data.email,
        organization: data.organization,
        bio: data.bio,
        profileImageURI: arweaveUploadedIds[0],
        backgroundImageURI: arweaveUploadedIds[1],
        externalResearchProfiles: data.externalResearchProfiles,
        interestedDomains: data.interestedDomains,
        topPublications: data.topPublications,
        socialLinks: data.socialLinks,
      };

      const metadataMerkleRoot =
        await sdk.SDK.compressObjectAndGenerateMerkleRoot(
          researcherProfileMetadata
        );

      const createResearcherProfileInput: Omit<
        sdk.CreateResearcherProfile,
        "pdaBump"
      > = {
        name: data.name,
        metaDataMerkleRoot: metadataMerkleRoot,
      };
      const {
        researcherProfilePdaBump,
        researcherProfilePda,
        researcherPubkey,
      } = await sdkInstance.createResearcherProfile(
        createResearcherProfileInput
      );

      // off-chain part

      const researcherProfileDbData: ResearcherProfileType = {
        address: researcherProfilePda,
        researcherPubkey,
        name: data.name,
        state: "AwaitingApproval",
        totalPapersPublished: 0,
        totalCitations: 0,
        totalReviews: 0,
        reputation: 0,
        metaDataMerkleRoot: Array.from(Buffer.from(metadataMerkleRoot)),
        bump: researcherProfilePdaBump,
        metadata: researcherProfileMetadata,
        papers: [],
        peerReviewsAsReviewer: [],
      };

      // Save the researcher profile to the database

      await fetch("/api/researcher-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(researcherProfileDbData),
      });
    } catch (error) {
      set({
        error: `Failed to create researcher profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  },
  async requestToAssignRepuation() {},
  setError: (error) => set({ error }),
}));
