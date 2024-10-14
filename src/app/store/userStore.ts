import { WalletContextState } from "@solana/wallet-adapter-react";
import { create } from "zustand";
import bs58 from "bs58";
import { getEncodedLoginMessage } from "@/lib/helpers";
import { useSDKStore } from "./sdkStore";
import * as sdk from "@/lib/sdk";
import {
  CreateResearcherProfile,
  ResearcherProfileMetadata,
  ResearchTokenAccountWithResearchePaper,
} from "@/lib/types";
import { ProfileFormData } from "@/lib/validation";
import { ResearcherProfileType, ResearchPaperType } from "../api/types";

interface UserState {
  isAuthenticated: boolean;
  walletSignature: string | null;
  researcherProfile: ResearcherProfileType | null;
  researchTokenAccounts: ResearchTokenAccountWithResearchePaper[];
  wallet: string | null;
  isLoading: boolean;
  lastChecked: number;
  error: string | null;
  checkAuth: (walletPubkey: string) => Promise<void>;
  checkAuthAndTryLogin: (wallet: WalletContextState) => Promise<void>;
  logout: (walletPubkey: string) => Promise<void>;
  createResearcherProfile: (
    data: ProfileFormData,
  ) => Promise<{ success: boolean; error?: string }>;
  requestToAssignRepuation: () => Promise<void>;
  setError: (error: string | null) => void;
  fetchAndStoreResearcherProfile: () => Promise<void>;
  fetchAndStoreResearchTokenAccounts: () => Promise<void>;
  pushToResearchTokenAccounts: (
    researchTokenAccount: ResearchTokenAccountWithResearchePaper,
  ) => void;
}

export type UserStore = UserState;

const AUTH_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 1 day

export const useUserStore = create<UserState>((set, get) => ({
  isAuthenticated: false,
  walletSignature: null,
  wallet: null,
  isLoading: false,
  lastChecked: 0,
  researcherProfile: null,
  researchTokenAccounts: [],
  error: null,
  checkAuthAndTryLogin: async (wallet: WalletContextState) => {
    if (!wallet.connected || !wallet.publicKey) {
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
      const { isAuthenticated, walletSignature } = checkAuthResponseData;
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
        wallet.publicKey.toBase58(),
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

  createResearcherProfile: async (
    data: ProfileFormData,
  ): Promise<{ success: boolean; error?: string }> => {
    const { sdk: sdkInstance } = useSDKStore.getState();

    if (!sdkInstance) {
      return { success: false, error: "SDK not initialized" };
    }

    set({ isLoading: true });

    try {
      // on-chain part
      const filesToUpload: File[] = [];
      const tags = [];

      if (data.profileImage) {
        filesToUpload.push(data.profileImage as File);
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
          tags,
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
        backgroundImageURI: "",
        externalResearchProfiles: data.externalResearchProfiles,
        interestedDomains: data.interestedDomains,
        topPublications: data.topPublications,

        // The reason we use this is that when setting an array for form validation,
        // it always shows "expected array, but got string" no matter what the user passes.
        // So, we accept a string in form validation and convert it to an array here.
        socialLinks: Array.isArray(data.socialLinks)
          ? [...data.socialLinks]
          : [data.socialLinks],
      };

      const metadataMerkleRoot =
        await sdk.SDK.compressObjectAndGenerateMerkleRoot(
          researcherProfileMetadata,
        );

      const createResearcherProfileInput: Omit<
        sdk.CreateResearcherProfile,
        "pdaBump"
      > = {
        name: data.name,
        metaDataMerkleRoot: metadataMerkleRoot,
      };

      const researcherProfile = await sdkInstance.createResearcherProfile(
        createResearcherProfileInput,
      );

      // off-chain part

      const researcherProfileDbData: CreateResearcherProfile = {
        address: researcherProfile.address.toBase58(),
        researcherPubkey: researcherProfile.researcherPubkey.toBase58(),
        name: data.name,
        metaDataMerkleRoot: metadataMerkleRoot,
        bump: researcherProfile.bump,
        metadata: researcherProfileMetadata,
      };

      // Save the researcher profile to the database

      const response = await fetch("/api/researcher-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(researcherProfileDbData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create researcher profile: ${response.statusText}`,
        );
      }

      const newResearcherProfile: ResearcherProfileType = await response.json();

      set({
        researcherProfile: newResearcherProfile,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = `Failed to create researcher profile: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },
  async fetchAndStoreResearcherProfile() {
    const { sdk } = useSDKStore.getState();
    if (!sdk) {
      return;
    }
    set({ isLoading: true });
    try {
      const researcherProfile: ResearcherProfileType =
        await fetchResearcherProfile(sdk.pubkey.toBase58());
      console.log("ResearcherProfile", researcherProfile);
      set({ researcherProfile, isLoading: false });
    } catch (error) {
      set({
        error: `Failed to fetch researcher profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  },

  async fetchAndStoreResearchTokenAccounts() {
    const { sdk } = useSDKStore.getState();
    if (!sdk) {
      return;
    }
    set({ isLoading: true });
    try {
      const researchTokenAccounts = await fetchResearchTokenAccounts(
        sdk.pubkey.toBase58(),
      );

      console.log("researchTokenAccounts", researchTokenAccounts);
      set({ researchTokenAccounts, isLoading: false });
    } catch (error) {
      set({
        error: `Failed to fetch research mint collection: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  },

  async requestToAssignRepuation() {},

  pushToResearchTokenAccounts(researchTokenAccount) {
    set((state) => ({
      researchTokenAccounts: [
        ...state.researchTokenAccounts,
        researchTokenAccount,
      ],
    }));
  },
  setError: (error) => set({ error }),
}));

async function fetchResearcherProfile(researcherPubkey: string) {
  const urlSearchParams = new URLSearchParams({ researcherPubkey });

  const response = await fetch(
    `/api/researcher-profile?${urlSearchParams.toString()}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch researcher profile: ${response.statusText}`,
    );
  }
  return await response.json();
}

async function fetchResearchTokenAccounts(researcherPubkey: string) {
  const urlSearchParams = new URLSearchParams({ researcherPubkey });
  const response = await fetch(`/api/mint?${urlSearchParams.toString()}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch research mint collection: ${response.statusText}`,
    );
  }
  return await response.json();
}
