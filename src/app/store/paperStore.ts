import { create } from "zustand";
import {
  PaperMetadata,
  ResearchPaperType,
} from "../models/ResearchPaper.model";
import { useSDKStore } from "./sdkStore";
import * as sdk from "@/lib/sdk";
import { Paper } from "@/lib/validation";

type CreateResearchePaperInput = {
  title: string;
  abstract: string;
  authors: string[];
  domains: string[];
  references: string[];
  accessFee: number;
  paperFile: File;
  paperImage: File;
};

interface PaperStore {
  papers: Paper[];
  isLoading: boolean;
  error: string | null;
  fetchPapers: () => Promise<void>;
  fetchPapersByState: (state: string) => Promise<void>;
  fetchPaperById: (state: string, paperId: string) => Promise<void>; // Fix here
  fetchFromApi: (url: string, singlePaper: boolean) => Promise<void>;
  createResearchPaper: (
    paper: CreateResearchePaperInput
  ) => Promise<{ success: boolean; error?: string }>;
  publishResearchPaper: () => Promise<void>;
  addPeerReview: () => Promise<void>;
  mintResearchPaper: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const usePaperStore = create<PaperStore>((set, get) => ({
  papers: [],
  isLoading: false,
  error: null,
  fetchPapers: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/research");
      if (!response.ok) {
        throw new Error("Failed to fetch papers");
      }
      const papers = await response.json();
      set({ papers, isLoading: false, error: null });
    } catch (error: any) {
      set({ error: "Failed to fetch papers", isLoading: false });
    }
  },
  fetchFromApi: async (url: string, singlePaper = false) => {
    set({ isLoading: true });
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
      }
      const data = await response.json();

      if (singlePaper) {
        set({ papers: [data], isLoading: false, error: null });
      } else {
        set({ papers: data, isLoading: false, error: null });
      }
    } catch (error: any) {
      set({
        error: `Error fetching data: ${error.message}`,
        isLoading: false,
      });
    }
  },
  fetchPapersByState: async (state: string) => {
    await get().fetchFromApi(`/api/research/${state}`, false);
  },
  fetchPaperById: async (state: string, paperId: string) => {
    await get().fetchFromApi(`/api/research/${state}/${paperId}`, true);
  },
  createResearchPaper: async (paper) => {
    set({ isLoading: true, error: null });

    const { sdk: sdkInstance } = useSDKStore.getState();

    if (!sdkInstance) {
      set({ error: "SDK not initialized", isLoading: false });
      return { success: false, error: "SDK not initialized" };
    }

    // Prepare form data to send files and other data
    const formData = new FormData();
    formData.append("paperFile", paper.paperFile);
    if (paper.paperImage) {
      formData.append("paperImage", paper.paperImage);
    }
    formData.append("paperData", JSON.stringify(paper));
    const paperFile = formData.get("paperFile") as File;
    const paperImage = formData.get("paperImage") as File;

    console.log(paperFile);
    console.log(paperImage);

    try {
      // On-chain part

      // Upload files to Arweave
      const [arweaveImageId, arweavePaperId] =
        await sdkInstance.arweaveUploadFiles(
          [paperImage, paperFile],
          [
            [
              {
                name: "Content-Type",
                value: "image/png",
              },
            ],
            [
              {
                name: "Content-Type",
                value: "application/pdf",
              },
            ],
          ]
        );

      // Generate merkle roots for paper content and metadata
      const [paperContentHash, metaDataMerkleRoot] = await Promise.all([
        sdk.SDK.compressObjectAndGenerateMerkleRoot({
          data: paper.paperFile.toString(),
        }),
        sdk.SDK.compressObjectAndGenerateMerkleRoot({
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          domain: paper.domains[0],
          tags: paper.domains,
          references: [],
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
        version: 1, // Default is 1
        paperContentHash: Array.from(Buffer.from(paperContentHash)),
        totalApprovals: 0,
        totalCitations: 0,
        totalMints: 0,
        metaDataMerkleRoot: Array.from(Buffer.from(metaDataMerkleRoot)),
        metadata: {
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          domain: paper.domains[0], // NOTE: domain is the first one of the domains
          tags: paper.domains, // NOTE: tags are the domains array
          references: [],
          paperImageURI: arweaveImageId,
          decentralizedStorageURI: arweavePaperId,
          datePublished: new Date(),
        },
        bump: result.paperPdaBump,
        peerReviews: [],
        // userId: new ObjectId //TODO: After finishing profile creation, this needs to be uncommented
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
  publishResearchPaper: async () => {},
  addPeerReview: async () => {},
  mintResearchPaper: async () => {},
  setError: (error) => set({ error }),
}));
