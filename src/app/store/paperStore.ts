import { create } from "zustand";
import {
  PaperMetadata,
  ResearchPaperType,
  type ResearchPaper,
} from "../models/ResearchPaper.model";
import { useSDKStore } from "./sdkStore";
import * as sdk from "@/lib/sdk";

type CreateResearchePaperInput = {
  title: string;
  abstract: string;
  authors: string[];
  domain: string;
  tags: string[];
  references: string[];
  accessFee: number;
  paperFile: File;
  paperImage: File;
};

interface PaperStore {
  papers: ResearchPaper[];
  isLoading: boolean;
  error: string | null;
  fetchPapers: () => Promise<void>;
  addPaper: (
    paper: CreateResearchePaperInput
  ) => Promise<{ success: boolean; error?: string }>;
  setError: (error: string | null) => void;
}

export const usePaperStore = create<PaperStore>((set, get) => ({
  papers: [],
  isLoading: false,
  error: null,
  fetchPapers: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/research-paper");
      if (!response.ok) {
        throw new Error("Failed to fetch papers");
      }
      const papers = await response.json();
      set({ papers, isLoading: false, error: null });
    } catch (error) {
      set({ error: "Failed to fetch papers", isLoading: false });
    }
  },
  addPaper: async (paper) => {
    set({ isLoading: true, error: null });

    const sdkInstance = useSDKStore.getState().sdk;

    if (!sdkInstance) {
      set({ error: "SDK not initialized", isLoading: false });
      return { success: false, error: "SDK not initialized" };
    }

    try {
      // On-chain part

      // Upload files to Arweave
      const [arweaveImageId, arweavePaperId] =
        await sdkInstance.arweaveUploadFiles(
          [paper.paperImage, paper.paperFile],
          [
            [
              {
                name: "paperImage",
                value: paper.title,
              },
            ],
            [
              {
                name: "paperFile",
                value: paper.title,
              },
            ],
          ]
        );

      // Generate merkle roots for paper content and metadata
      const [paperContentHash, metaDataMerkleRoot] = await Promise.all([
        await sdk.SDK.compressObjectAndGenerateMerkleRoot({
          data: paper.paperFile.toString(),
        }),
        await sdk.SDK.compressObjectAndGenerateMerkleRoot({
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          domain: paper.domain,
          tags: paper.tags,
          references: paper.references,
          paperImageURI: arweaveImageId,
          decentralizedStorageURI: arweavePaperId,
          datePublished: new Date().toISOString(),
        } as PaperMetadata),
      ]);

      // Create paper on Solana
      const createResearchPaperInput: Omit<
        sdk.CreateResearchePaper,
        "pdaBump"
      > = {
        accessFee: paper.accessFee,
        paperContentHash,
        metaDataMerkleRoot,
      };

      // Call the SDK to create the paper
      const result = await sdkInstance.createResearchPaper(
        createResearchPaperInput
      );

      // Off-chain part

      // Create the paper object to store in the database
      const paperDbData: ResearchPaperType = {
        address: result.paperPda,
        creatorPubkey: result.creatorPubkey,
        state: "AwaitingPeerReview",
        accessFee: paper.accessFee,
        version: 0,
        paperContentHash: Array.from(Buffer.from(paperContentHash)),
        totalApprovals: 0,
        totalCitations: 0,
        totalMints: 0,
        metaDataMerkleRoot: Array.from(Buffer.from(metaDataMerkleRoot)),
        metadata: {
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          domain: paper.domain,
          tags: paper.tags,
          references: paper.references,
          paperImageURI: arweaveImageId,
          decentralizedStorageURI: arweavePaperId,
          datePublished: new Date().toISOString(),
        },
        bump: result.paperPdaBump,
      };

      // Store the paper in the database
      const response = await fetch("/api/research-paper", {
        method: "POST",
        body: JSON.stringify(paperDbData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create paper");
      }

      // Add the paper to the store
      const newPaper = await response.json();
      set((state) => ({
        papers: [...state.papers, newPaper],
        isLoading: false,
      }));
      return { success: true };
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },
  setError: (error) => set({ error }),
}));
