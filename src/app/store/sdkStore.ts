import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Cluster, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { SDK } from "@/lib/sdk";
import * as sdk from "@/lib/sdk/src";

interface SDKState {
  sdk: SDK | null;
  researcherProfile: sdk.ResearcherProfile | null;
  researchPapers: sdk.ResearchPaper[];
  peerReviews: sdk.PeerReview[];
  mintCollections: sdk.ResearchMintCollection[];
  isLoading: boolean;
  error: string | null;
}

interface SDKActions {
  initializeSDK: (wallet: WalletContextState, cluster: Cluster) => void;
  createResearcherProfile: (data: sdk.CreateResearcherProfile) => Promise<void>;
  createResearchPaper: (data: sdk.CreateResearchePaper) => Promise<void>;
  addPeerReview: (
    paperPda: PublicKey,
    data: sdk.AddPeerReview,
  ) => Promise<void>;
  mintResearchPaper: (
    paperPda: PublicKey,
    data: sdk.MintResearchPaper,
  ) => Promise<void>;
  fetchResearcherProfile: () => Promise<void>;
  fetchAllResearchPapers: () => Promise<void>;
  fetchAllPeerReviews: () => Promise<void>;
  fetchMintCollections: () => Promise<void>;
  clearError: () => void;
  isSDKInitialized: () => boolean;
  reset: () => void;
}

type SDKStore = SDKState & SDKActions;

// Define initial state
const initialState: SDKState = {
  sdk: null,
  researcherProfile: null,
  researchPapers: [],
  peerReviews: [],
  mintCollections: [],
  isLoading: false,
  error: null,
};

export const useSDKStore = create<SDKStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        initializeSDK: (wallet: WalletContextState, cluster: Cluster) => {
          try {
            const endpoint = clusterApiUrl(cluster);
            const sdk = new SDK(wallet, endpoint as Cluster);
            set({ sdk, error: null });
          } catch (error) {
            set({
              error: `Failed to initialize SDK: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            });
          }
        },

        createResearcherProfile: async (data: sdk.CreateResearcherProfile) => {
          const { sdk } = get();
          if (!sdk) {
            set({ error: "SDK not initialized" });
            return;
          }
          set({ isLoading: true, error: null });
          try {
            await sdk.createResearcherProfile(data);
            await get().fetchResearcherProfile();
          } catch (error) {
            set({
              error: `Failed to create researcher profile: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        createResearchPaper: async (data: sdk.CreateResearchePaper) => {
          const { sdk } = get();
          if (!sdk) {
            set({ error: "SDK not initialized" });
            return;
          }
          set({ isLoading: true, error: null });
          try {
            await sdk.createResearchPaper(data);
            await get().fetchAllResearchPapers();
          } catch (error) {
            set({
              error: `Failed to create research paper: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        addPeerReview: async (paperPda: PublicKey, data: sdk.AddPeerReview) => {
          const { sdk } = get();
          if (!sdk) {
            set({ error: "SDK not initialized" });
            return;
          }
          set({ isLoading: true, error: null });
          try {
            await sdk.addPeerReview(paperPda, data);
            await get().fetchAllPeerReviews();
          } catch (error) {
            set({
              error: `Failed to add peer review: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        mintResearchPaper: async (
          paperPda: PublicKey,
          data: sdk.MintResearchPaper,
        ) => {
          const { sdk } = get();
          if (!sdk) {
            set({ error: "SDK not initialized" });
            return;
          }
          set({ isLoading: true, error: null });
          try {
            await sdk.mintResearchPaper(paperPda, data);
            await get().fetchMintCollections();
          } catch (error) {
            set({
              error: `Failed to mint research paper: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        fetchResearcherProfile: async () => {
          const { sdk } = get();
          if (!sdk) {
            set({ error: "SDK not initialized" });
            return;
          }
          set({ isLoading: true, error: null });
          try {
            const profile = await sdk.fetchResearcherProfileByPubkey(
              sdk.pubkey,
            );
            set({ researcherProfile: profile || null });
          } catch (error) {
            set({
              error: `Failed to fetch researcher profile: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        fetchAllResearchPapers: async () => {
          const { sdk } = get();
          if (!sdk) {
            set({ error: "SDK not initialized" });
            return;
          }
          set({ isLoading: true, error: null });
          try {
            const papers = await sdk.fetchAllResearchPapers();
            set({ researchPapers: papers });
          } catch (error) {
            set({
              error: `Failed to fetch research papers: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        fetchAllPeerReviews: async () => {
          const { sdk } = get();
          if (!sdk) {
            set({ error: "SDK not initialized" });
            return;
          }
          set({ isLoading: true, error: null });
          try {
            const reviews = await sdk.fetchAllPeerReviews();
            set({ peerReviews: reviews });
          } catch (error) {
            set({
              error: `Failed to fetch peer reviews: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        fetchMintCollections: async () => {
          const { sdk } = get();
          if (!sdk) {
            set({ error: "SDK not initialized" });
            return;
          }
          set({ isLoading: true, error: null });
          try {
            const collections =
              await sdk.fetchResearchMintCollectionByResearcherPubkey(
                sdk.pubkey,
              );
            set({ mintCollections: collections });
          } catch (error) {
            set({
              error: `Failed to fetch mint collections: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            });
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
      }),
      {
        name: "sdk-storage",
        partialize: (state) => ({ researcherProfile: state.researcherProfile }),
      },
    ),
  ),
);
