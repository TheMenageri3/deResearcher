import { create } from "zustand";
import {
  AddPeerReviewType,
  CreateResearchPaper,
  ResearchPaperMetadata,
  ResearchPaperType,
} from "@/lib/types";
import { PaperFormData } from "@/lib/validation";
import { useSDKStore } from "./sdkStore";
import * as sdk from "@/lib/sdk";
import { PeerReviewFormData } from "@/lib/validation";
import { toPaperDbState } from "@/lib/helpers";

interface PaperStore {
  papers: ResearchPaperType[];
  isLoading: boolean;
  error: string | null;
  fetchPapers: () => Promise<void>;
  fetchPapersByState: (state: string) => Promise<void>;
  fetchPaperById: (state: string, paperId: string) => Promise<void>; // Fix here
  fetchFromApi: (url: string, singlePaper: boolean) => Promise<void>;
  createResearchPaper: (
    paper: PaperFormData
  ) => Promise<{ success: boolean; error?: string }>;
  publishResearchPaper: (paper: ResearchPaperType) => Promise<void>;
  addPeerReview: (
    paper: ResearchPaperType,
    data: PeerReviewFormData
  ) => Promise<void>;
  mintResearchPaper: (paper: ResearchPaperType) => Promise<void>;
  setError: (error: string | null) => void;
  pushToPapersStore: (paper: ResearchPaperType) => void;
  updatePaperInStore: (paper: ResearchPaperType) => void;
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

    const { pushToPapersStore } = get();

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
        } as ResearchPaperMetadata),
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
      const researchPaper = await sdkInstance.createResearchPaper(
        createResearchPaperInput
      );

      // Off-chain part

      // Create the paper object to store in the database
      const paperDbData: CreateResearchPaper = {
        address: researchPaper.address.toBase58(),
        creatorPubkey: sdkInstance.pubkey.toBase58(),
        accessFee: paper.accessFee,
        paperContentHash,
        metaDataMerkleRoot,
        metadata: {
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          domain: paper.domains[0], // NOTE: domain is the first one of the domains
          tags: paper.domains, // NOTE: tags are the domains array
          references: [],
          paperImageURI: arweaveImageId,
          decentralizedStorageURI: arweavePaperId,
          datePublished: new Date().toISOString(),
        },
        bump: researchPaper.bump,
      };

      // Store the paper in the database
      const response = await fetch("/api/research-paper/create", {
        method: "POST",
        body: JSON.stringify(paperDbData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create paper");
      }

      // Add the paper to the store
      const newPaper: ResearchPaperType = await response.json();

      pushToPapersStore(newPaper);

      set({
        isLoading: false,
      });

      return { success: true };
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },
  publishResearchPaper: async (paper) => {
    const { updatePaperInStore } = get();
    const { sdk: sdkInstance } = useSDKStore.getState();
    if (!sdkInstance) {
      set({ error: "SDK not initialized" });
      return;
    }
    set({ isLoading: true });
    try {
      // on-chain part
      const updatedPaper = await sdkInstance.publishResearchPaper(
        paper.address,
        paper.bump
      );

      // off-chain part

      const oldResearchPaperClone = { ...paper };

      oldResearchPaperClone.state = toPaperDbState(updatedPaper.state);

      const response = await fetch("/api/research-paper/update", {
        method: "PUT",
        body: JSON.stringify(oldResearchPaperClone),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create paper");
      }

      const updatedPaperDB: ResearchPaperType = await response.json();

      updatePaperInStore(updatedPaperDB);

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to publish paper", isLoading: false });
    }
  },
  addPeerReview: async (paper, data) => {
    const { sdk: sdkInstance } = useSDKStore.getState();
    if (!sdkInstance) {
      set({ error: "SDK not initialized" });
      return;
    }
    set({ isLoading: true });
    try {
      // on-chain part

      const metaDataMerkleRoot =
        await sdk.SDK.compressObjectAndGenerateMerkleRoot({
          ...data,
        });

      const addPeerReviewData: Omit<sdk.AddPeerReview, "pdaBump"> = {
        qualityOfResearch: data.qualityOfResearch,
        practicalityOfResultObtained: data.practicalityOfResultObtained,
        potentialForRealWorldUseCase: data.potentialForRealWorldUseCase,
        metaDataMerkleRoot: metaDataMerkleRoot,
        domainKnowledge: data.domainKnowledge,
      };

      const peerReview = await sdkInstance.addPeerReview(
        paper.address,
        addPeerReviewData
      );

      // off-chain part

      const addPeerReviewDbData: AddPeerReviewType = {
        reviewerPubkey: sdkInstance.pubkey.toBase58(),
        address: peerReview.address.toBase58(),
        paperPubkey: paper.address,
        qualityOfResearch: data.qualityOfResearch,
        practicalityOfResultObtained: data.practicalityOfResultObtained,
        potentialForRealWorldUseCase: data.potentialForRealWorldUseCase,
        metaDataMerkleRoot,
        domainKnowledge: data.domainKnowledge,
        metadata: {
          title: paper.metadata.title,
          reviewComments: data.reviewComments,
        },
        bump: peerReview.bump,
      };

      const response = await fetch("/api/peer-review", {
        method: "POST",
        body: JSON.stringify(addPeerReviewDbData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create paper");
      }

      // Add the peer review to the store

      const newPeerReview = await response.json();

      set((state) => ({
        papers: state.papers.map((p) =>
          p.address === paper.address
            ? { ...p, peerReviews: [...p.peerReviews, newPeerReview.id] }
            : p
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: "Failed to add peer review", isLoading: false });
    }
  },
  mintResearchPaper: async (paper) => {
    const { sdk: sdkInstance } = useSDKStore.getState();
    if (!sdkInstance) {
      set({ error: "SDK not initialized" });
      return;
    }
    set({ isLoading: true });
    try {
      // on-chain part
      await sdkInstance.mintResearchPaper(paper.address, {
        metaDataMerkleRoot: "",
      });

      // off-chain part

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to mint paper", isLoading: false });
    }
  },
  pushToPapersStore: (paper) => {
    set((state) => ({ papers: [...state.papers, paper] }));
  },
  updatePaperInStore: (paper) => {
    set((state) => ({
      papers: state.papers.map((p) =>
        p.address === paper.address ? paper : p
      ),
    }));
  },

  setError: (error) => set({ error }),
}));
