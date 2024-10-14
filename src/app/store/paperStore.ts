import { create } from "zustand";
import {
  AddPeerReview,
  CreateResearchPaper,
  PeerReviewType,
  ResearchPaperMetadata,
  ResearchPaperType,
  ResearchTokenAccountWithResearchePaper,
  MintResearchPaper,
} from "@/lib/types";
import { PaperFormData, PeerReviewFormData } from "@/lib/validation";
import { useSDKStore } from "./sdkStore";
import * as sdk from "@/lib/sdk";
import { toPaperDbState } from "@/lib/helpers";
import { useUserStore } from "./userStore";
import { ResearchPaperWithResearcherProfile } from "../api/types";

interface PaperStore {
  papers: ResearchPaperWithResearcherProfile[];
  peerReviews: PeerReviewType[];
  isLoading: boolean;
  error: string | null;
  fetchAndStorePapers: () => Promise<void>;
  fetchPapersByState: (
    state: string,
  ) => Promise<ResearchPaperWithResearcherProfile[] | null>;
  fetchPaperByPubkey: (
    paperPubkey: string,
  ) => Promise<ResearchPaperWithResearcherProfile | null>;
  fetchAllPapersByResearcherPubkey: (
    researcherPubkey: string,
  ) => Promise<ResearchPaperWithResearcherProfile[] | null>;
  fetchAndStorePeerReviewsByReviewerPubkey: (
    reviewerPubkey: string,
  ) => Promise<void>;

  fetchPeerReviewsByPaperPubkey: (
    paperPubkey: string,
  ) => Promise<PeerReviewType[] | null>;

  createResearchPaper: (
    paper: PaperFormData,
  ) => Promise<{ success: boolean; error?: string }>;
  publishResearchPaper: (paper: ResearchPaperType) => Promise<void>;
  addPeerReview: (
    paper: ResearchPaperType,
    data: PeerReviewFormData,
  ) => Promise<{ success: boolean; error?: string }>;
  mintResearchPaper: (paper: ResearchPaperType) => Promise<void>;
  setError: (error: string | null) => void;
  pushToPapersStore: (paper: ResearchPaperWithResearcherProfile) => void;
  pushToPeerReviewsStore: (peerReview: PeerReviewType) => void;
  updatePeerReviewInStore: (peerReview: PeerReviewType) => void;
  updatePaperInStore: (paper: ResearchPaperWithResearcherProfile) => void;
}

export const usePaperStore = create<PaperStore>((set, get) => ({
  papers: [],
  peerReviews: [],
  isLoading: false,
  error: null,
  fetchAndStorePapers: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/research");
      if (!response.ok) {
        throw new Error("Failed to fetch papers");
      }
      const papers: ResearchPaperWithResearcherProfile[] =
        await response.json();
      set({ papers, isLoading: false, error: null });
    } catch (error: any) {
      set({ error: "Failed to fetch papers", isLoading: false });
    }
  },

  fetchPapersByState: async (state: string) => {
    try {
      const papers: ResearchPaperWithResearcherProfile[] =
        await fetchPapersByStateFromDB(state);
      return papers;
    } catch (error: any) {
      console.error(error);
      return null;
    }
  },
  fetchPaperByPubkey: async (paperId: string) => {
    try {
      const paper: ResearchPaperWithResearcherProfile =
        await fetchPaperByPubkeyFromDB(paperId);
      return paper;
    } catch (error: any) {
      console.error(error);
      return null;
    }
  },
  fetchAllPapersByResearcherPubkey: async (researcherPubkey: string) => {
    try {
      const papers: ResearchPaperWithResearcherProfile[] =
        await fetchPapersByResearcherPubkeyFromDB(researcherPubkey);
      return papers;
    } catch (error: any) {
      console.error(error);
      return null;
    }
  },

  createResearchPaper: async (
    paper: PaperFormData,
  ): Promise<{ success: boolean; error?: string }> => {
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
    const paperImage = formData.get("paperImage") as File | undefined;

    try {
      // On-chain part

      // Upload files to Arweave
      let arweaveImageId = "";
      let arweavePaperId = "";

      if (paperImage) {
        // If paperImage exists, upload both files
        [arweaveImageId, arweavePaperId] = await sdkInstance.arweaveUploadFiles(
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
          ],
        );
      } else {
        // If paperImage doesn't exist, only upload paperFile
        [arweavePaperId] = await sdkInstance.arweaveUploadFiles(
          [paperFile],
          [
            [
              {
                name: "Content-Type",
                value: "application/pdf",
              },
            ],
          ],
        );
      }

      // Generate merkle roots for paper content and metadata

      const content = await paper.paperFile.text();

      const [paperContentHash, metaDataMerkleRoot] = await Promise.all([
        sdk.SDK.compressObjectAndGenerateMerkleRoot({
          data: content,
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
        createResearchPaperInput,
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
      const newPaper: ResearchPaperWithResearcherProfile = await storePaperOnDB(
        paperDbData,
      );

      // Add the paper to the store
      pushToPapersStore(newPaper);

      set({
        isLoading: false,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return { success: false, error: errorMessage };
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
        paper.bump,
      );

      // off-chain part
      const data = {
        state: toPaperDbState(updatedPaper.state),
      };

      const updatedPaperDB: ResearchPaperWithResearcherProfile =
        await updateResearchPaperDB(data);

      // Update the paper in the store

      updatePaperInStore(updatedPaperDB);

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to publish paper", isLoading: false });
    }
  },

  addPeerReview: async (
    paper,
    data,
  ): Promise<{ success: boolean; error?: string }> => {
    const { sdk: sdkInstance } = useSDKStore.getState();
    const { pushToPeerReviewsStore } = get();
    if (!sdkInstance) {
      set({ error: "SDK not initialized" });
      return { success: false, error: "SDK not initialized" };
    }
    set({ isLoading: true });
    console.log("data", data);
    console.log("paper", paper);

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
        addPeerReviewData,
      );

      if (!peerReview) {
        throw new Error("Peer review not found");
      }

      // off-chain part
      const addPeerReviewDbData: AddPeerReview = {
        reviewerPubkey: sdkInstance.pubkey.toBase58(),
        address: peerReview.address.toBase58(),
        paperPubkey: paper.address,
        qualityOfResearch: data.qualityOfResearch,
        practicalityOfResultObtained: data.practicalityOfResultObtained,
        potentialForRealWorldUseCase: data.potentialForRealWorldUseCase,
        metaDataMerkleRoot,
        domainKnowledge: data.domainKnowledge,
        metadata: {
          title: data.title,
          reviewComments: data.reviewComments,
        },
        bump: peerReview.bump,
      };

      // Add the peer review to the store

      const newPeerReview: PeerReviewType = await storePeerReviewOnDB(
        addPeerReviewDbData,
      );

      console.log("newPeerReview", newPeerReview);

      // Add the peer review to the store

      pushToPeerReviewsStore(newPeerReview);

      set({ isLoading: false });
      return { success: true };
    } catch (error: any) {
      set({ error: "Failed to add peer review", isLoading: false });
      return { success: false, error: "Failed to add peer review" };
    }
  },

  mintResearchPaper: async (paper) => {
    const { sdk: sdkInstance } = useSDKStore.getState();
    const { researchTokenAccounts, pushToResearchTokenAccounts } =
      useUserStore.getState();
    if (!sdkInstance) {
      set({ error: "SDK not initialized" });
      return;
    }
    set({ isLoading: true });
    try {
      // on-chain part

      const mintCollection = await sdkInstance.mintResearchPaper(paper.address);

      // off-chain part

      const researchTokenAccountDBData: MintResearchPaper = {
        address: mintCollection.address.toBase58(),
        researcherPubkey: sdkInstance.pubkey.toBase58(),
        paperPubkey: paper.address,
        bump: mintCollection.bump,
      };

      const researchTokenAccountWithPaper: ResearchTokenAccountWithResearchePaper =
        await mintResearchPaperDB(researchTokenAccountDBData);

      pushToResearchTokenAccounts(researchTokenAccountWithPaper);

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to mint paper", isLoading: false });
    }
  },

  fetchAndStorePeerReviewsByReviewerPubkey: async (reviewerPubkey) => {
    set({ isLoading: true });
    try {
      const peerReviews = await fetchPeerReviewsByReviewerPubkeyFromDB(
        reviewerPubkey,
      );
      set({ peerReviews, isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to fetch peer reviews", isLoading: false });
    }
  },

  fetchPeerReviewsByPaperPubkey: async (paperPubkey) => {
    set({ isLoading: true });

    try {
      const peerReviews = await fetchPeerReviewsByPaperPubkeyFromDB(
        paperPubkey,
      );
      set({ isLoading: false });

      return peerReviews;
    } catch (error: any) {
      console.error(error);
      set({ isLoading: false, error: "Failed to fetch peer reviews" });
      return null;
    }
  },

  pushToPapersStore: (paper: ResearchPaperWithResearcherProfile) => {
    set((state) => ({
      papers: [...state.papers, paper],
    }));
  },

  updatePaperInStore: (paper) => {
    set((state) => ({
      papers: state.papers.map((p) =>
        p.researchPaper.address === paper.researchPaper.address
          ? { ...p, ...paper }
          : p,
      ),
    }));
  },

  pushToPeerReviewsStore: (peerReview) => {
    set((state) => ({ peerReviews: [...state.peerReviews, peerReview] }));
  },

  updatePeerReviewInStore: (peerReview) => {
    set((state) => ({
      peerReviews: state.peerReviews.map((p) =>
        p.address === peerReview.address ? peerReview : p,
      ),
    }));
  },

  setError: (error) => set({ error }),
}));

async function storePaperOnDB(paper: CreateResearchPaper) {
  const response = await fetch("/api/research/create", {
    method: "POST",
    body: JSON.stringify(paper),
  });

  if (!response.ok) {
    throw new Error("Failed to store paper on DB");
  }

  return await response.json();
}

async function storePeerReviewOnDB(peerReview: AddPeerReview) {
  const response = await fetch("/api/peer-review", {
    method: "POST",
    body: JSON.stringify(peerReview),
  });

  if (!response.ok) {
    throw new Error("Failed to store peer review on DB");
  }

  return await response.json();
}

async function fetchAllPapersFromDB() {
  const response = await fetch("/api/research");
  if (!response.ok) {
    throw new Error("Failed to fetch papers");
  }
  return await response.json();
}

async function fetchPaperByPubkeyFromDB(paperPubkey: string) {
  const urlSearchParams = new URLSearchParams({ paperPubkey });

  const response = await fetch(`/api/research?${urlSearchParams}`);
  if (!response.ok) {
    throw new Error("Failed to fetch paper");
  }
  return await response.json();
}

async function fetchPapersByResearcherPubkeyFromDB(researcherPubkey: string) {
  const urlSearchParams = new URLSearchParams({ researcherPubkey });

  const response = await fetch(`/api/research?${urlSearchParams}`);
  if (!response.ok) {
    throw new Error("Failed to fetch paper");
  }
  return await response.json();
}

async function fetchPapersByStateFromDB(state: string) {
  const urlSearchParams = new URLSearchParams({ researchPaperstate: state });

  const response = await fetch(`/api/research?${urlSearchParams}`);
  if (!response.ok) {
    throw new Error("Failed to fetch papers");
  }
  return await response.json();
}

async function fetchPeerReviewsByPaperPubkeyFromDB(paperPubkey: string) {
  const urlSearchParams = new URLSearchParams({ paperPubkey });

  const response = await fetch(`/api/peer-review?${urlSearchParams}`);
  if (!response.ok) {
    throw new Error("Failed to fetch peer review");
  }
  return await response.json();
}

async function fetchPeerReviewsByReviewerPubkeyFromDB(reviewerPubkey: string) {
  const urlSearchParams = new URLSearchParams({ reviewerPubkey });

  const response = await fetch(`/api/peer-review?${urlSearchParams}`);
  if (!response.ok) {
    throw new Error("Failed to fetch peer review");
  }
  return await response.json();
}

async function mintResearchPaperDB(data: MintResearchPaper) {
  const response = await fetch("/api/mint", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to mint research paper");
  }

  return await response.json();
}

async function updateResearchPaperDB(data: {}) {
  const response = await fetch("/api/research/update", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update research paper");
  }

  return await response.json();
}
