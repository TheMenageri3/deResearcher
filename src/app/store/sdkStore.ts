import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Cluster, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { SDK } from "@/lib/sdk";
import * as sdk from "@/lib/sdk/src";
import { getRPCUrlFromCluster } from "@/lib/helpers";

interface SDKState {
  sdk: SDK | null;
  isLoading: boolean;
  error: string | null;
}

interface SDKActions {
  initializeSDK: (wallet: WalletContextState, cluster: Cluster) => boolean;
  createResearcherProfile: (
    data: sdk.CreateResearcherProfile
  ) => Promise<sdk.ResearcherProfile | null>;
  createResearchPaper: (
    data: sdk.CreateResearchePaper
  ) => Promise<sdk.ResearchPaper | null>;
  addPeerReview: (
    paperPda: string,
    data: sdk.AddPeerReview
  ) => Promise<sdk.PeerReview | null>;
  mintResearchPaper: (
    paperPda: string,
    data: sdk.MintResearchPaper
  ) => Promise<sdk.ResearchTokenAccount | null>;
  clearError: () => void;
  isSDKInitialized: () => boolean;
  reset: () => void;
}

export type SDKStore = SDKState & SDKActions;

// Define initial state
const initialState: SDKState = {
  sdk: null,
  isLoading: false,
  error: null,
};

export const useSDKStore = create<SDKStore>()((set, get) => ({
  ...initialState,

  initializeSDK: (wallet: WalletContextState, cluster: Cluster): boolean => {
    try {
      const sdk = new SDK(wallet, cluster);
      set({ sdk, error: null });
      return true;
    } catch (error) {
      set({
        error: `Failed to initialize SDK: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      return false;
    }
  },

  createResearcherProfile: async (data: sdk.CreateResearcherProfile) => {
    const { sdk } = get();
    if (!sdk) {
      set({ error: "SDK not initialized" });
      return null;
    }
    set({ isLoading: true, error: null });
    try {
      const researcherProfile = await sdk.createResearcherProfile(data);

      return researcherProfile;
    } catch (error) {
      set({
        error: `Failed to create researcher profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      return null;
    } finally {
      set({ isLoading: false });
      return null;
    }
  },

  createResearchPaper: async (data: sdk.CreateResearchePaper) => {
    const { sdk } = get();
    if (!sdk) {
      set({ error: "SDK not initialized" });
      return null;
    }
    set({ isLoading: true, error: null });
    try {
      const researchPaper = await sdk.createResearchPaper(data);

      return researchPaper;
    } catch (error) {
      set({
        error: `Failed to create research paper: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  addPeerReview: async (paperPda: string, data: sdk.AddPeerReview) => {
    const { sdk } = get();
    if (!sdk) {
      set({ error: "SDK not initialized" });
      return null;
    }
    set({ isLoading: true, error: null });
    try {
      const peerReview = await sdk.addPeerReview(paperPda, data);
      return peerReview;
    } catch (error) {
      set({
        error: `Failed to add peer review: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  mintResearchPaper: async (paperPda: string, data: sdk.MintResearchPaper) => {
    const { sdk } = get();
    if (!sdk) {
      set({ error: "SDK not initialized" });
      return null;
    }
    set({ isLoading: true, error: null });
    try {
      const researchTokenAccount = await sdk.mintResearchPaper(paperPda);

      return researchTokenAccount;
    } catch (error) {
      set({
        error: `Failed to mint research paper: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  isSDKInitialized: () => {
    return get().sdk !== null;
  },

  reset: () => {
    set(initialState);
  },
}));
