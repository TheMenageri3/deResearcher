import { create } from "zustand";
import {
  AddPeerReview,
  CreateResearchPaper,
  PeerReviewType,
  ResearchPaperMetadata,
  ResearchPaperType,
} from "@/lib/types";
import {
  PaperFormData,
  PeerReviewCommentsFormData,
  PeerReviewRatingFormData,
} from "@/lib/validation";
import { useSDKStore } from "./sdkStore";
import * as sdk from "@/lib/sdk";
import { toPaperDbState } from "@/lib/helpers";
import { useUserStore } from "./userStore";
import {
  AddPeerReviewComments,
  PushToResearchMintCollection,
} from "@/lib/types";

interface PaperStore {
  papers: ResearchPaperType[];
  peerReviews: PeerReviewType[];
  isLoading: boolean;
  error: string | null;
  fetchAndStorePapers: () => Promise<void>;
  fetchPapersByState: (state: string) => Promise<ResearchPaperType[] | null>;
  fetchPaperByPubkey: (
    state: string,
    paperPubkey: string
  ) => Promise<ResearchPaperType[] | null>;
  fetchAllPapersByResearcherPubkey: (
    researcherPubkey: string
  ) => Promise<ResearchPaperType[] | null>;
  fetchAndStorePeerReviewsByReviewerPubkey: (
    reviewerPubkey: string
  ) => Promise<void>;

  fetchPeerReviewsByPaperPubkey: (
    paperPubkey: string
  ) => Promise<PeerReviewType[] | null>;

  createResearchPaper: (
    paper: PaperFormData
  ) => Promise<{ success: boolean; error?: string }>;
  publishResearchPaper: (paper: ResearchPaperType) => Promise<void>;
  addPeerReviewRating: (
    paper: ResearchPaperType,
    data: PeerReviewRatingFormData
  ) => Promise<void>;
  addPeerReviewComments: (
    paper: PeerReviewType,
    data: PeerReviewCommentsFormData
  ) => Promise<void>;
  mintResearchPaper: (paper: ResearchPaperType) => Promise<void>;
  setError: (error: string | null) => void;
  pushToPapersStore: (paper: ResearchPaperType) => void;
  pushToPeerReviewsStore: (peerReview: PeerReviewType) => void;
  updatePeerReviewInStore: (peerReview: PeerReviewType) => void;
  updatePaperInStore: (paper: ResearchPaperType) => void;
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
      const papers: ResearchPaperType[] = await response.json();
      console.log("papers", papers);
      set({ papers, isLoading: false, error: null });
    } catch (error: any) {
      set({ error: "Failed to fetch papers", isLoading: false });
    }
  },

  fetchPapersByState: async (state: string) => {
    try {
      const papers: ResearchPaperType[] = await fetchPapersByStateFromDB(state);
      return papers;
    } catch (error: any) {
      console.error(error);
      return null;
    }
  },
  fetchPaperByPubkey: async (state: string, paperId: string) => {
    try {
      const papers: ResearchPaperType[] = await fetchPaperByPubkeyFromDB(
        paperId
      );
      return papers;
    } catch (error: any) {
      console.error(error);
      return null;
    }
  },
  fetchAllPapersByResearcherPubkey: async (researcherPubkey: string) => {
    try {
      const papers: ResearchPaperType[] =
        await fetchPapersByResearcherPubkeyFromDB(researcherPubkey);
      return papers;
    } catch (error: any) {
      console.error(error);
      return null;
    }
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

      //Upload files to Arweave
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

      const content = await paper.paperFile.text();
      console.log("content", content);

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
      const newPaper: ResearchPaperType = await storePaperOnDB(paperDbData);

      // Add the paper to the store
      pushToPapersStore(newPaper);

      set({
        isLoading: false,
      });

      return { success: true };
    } catch (error: any) {
      console.error(error);
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
      const data = {
        state: toPaperDbState(updatedPaper.state),
      };

      const updatedPaperDB: ResearchPaperType = await updateResearchPaperDB(
        data
      );

      // Update the paper in the store

      updatePaperInStore(updatedPaperDB);

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to publish paper", isLoading: false });
    }
  },
  addPeerReviewRating: async (paper, data) => {
    const { sdk: sdkInstance } = useSDKStore.getState();
    const { pushToPeerReviewsStore } = get();
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
          title: "...",
          reviewComments: "...",
        },
        bump: peerReview.bump,
      };

      // Add the peer review to the store

      const newPeerReview: PeerReviewType = await storePeerReviewOnDB(
        addPeerReviewDbData
      );

      // Add the peer review to the store

      pushToPeerReviewsStore(newPeerReview);

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to add peer review", isLoading: false });
    }
  },

  addPeerReviewComments: async (peerReview, data) => {
    const { sdk: sdkInstance } = useSDKStore.getState();

    const { updatePeerReviewInStore } = get();

    if (!sdkInstance) {
      set({ error: "SDK not initialized" });
      return;
    }
    set({ isLoading: true });
    try {
      // off-chain part

      const addPeerReviewCommentsDbData: AddPeerReviewComments = {
        address: peerReview.address,
        title: data.title,
        reviewComments: data.reviewComments,
      };

      const updatedPeerReview: PeerReviewType = await addCommentsPeerReviewDB(
        addPeerReviewCommentsDbData
      );

      // Add the peer review to the store

      updatePeerReviewInStore(updatedPeerReview);

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to add peer review comments", isLoading: false });
    }
  },
  mintResearchPaper: async (paper) => {
    const { sdk: sdkInstance } = useSDKStore.getState();
    const { researchMintCollection, updateResearchMintCollection } =
      useUserStore.getState();
    if (!sdkInstance) {
      set({ error: "SDK not initialized" });
      return;
    }
    set({ isLoading: true });
    try {
      // on-chain part
      let data: string[] = [];

      if (researchMintCollection) {
        data = [...researchMintCollection.metadata.mintedResearchPaperPubkeys];
      }

      data.push(paper.address);

      const metaDataMerkleRoot =
        await sdk.SDK.compressObjectAndGenerateMerkleRoot({
          data,
        });
      const mintCollection = await sdkInstance.mintResearchPaper(
        paper.address,
        {
          metaDataMerkleRoot,
        }
      );

      // off-chain part

      const mintCollectionDBData: PushToResearchMintCollection = {
        address: mintCollection.address.toBase58(),
        readerPubkey: sdkInstance.pubkey.toBase58(),
        bump: mintCollection.bump,
        newMintedResearchPaperPubkey: paper.address,
        metaDataMerkleRoot,
      };

      const updatedMiningCollection = await mintResearchPaperDB(
        mintCollectionDBData
      );

      // Update the mint collection in the store

      updateResearchMintCollection(updatedMiningCollection);

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to mint paper", isLoading: false });
    }
  },

  fetchAndStorePeerReviewsByReviewerPubkey: async (reviewerPubkey) => {
    set({ isLoading: true });
    try {
      const peerReviews = await fetchPeerReviewsByReviewerPubkeyFromDB(
        reviewerPubkey
      );
      set({ peerReviews, isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to fetch peer reviews", isLoading: false });
    }
  },

  fetchPeerReviewsByPaperPubkey: async (paperPubkey) => {
    try {
      const peerReviews = await fetchPeerReviewsByPaperPubkeyFromDB(
        paperPubkey
      );
      return peerReviews;
    } catch (error: any) {
      console.error(error);
      return null;
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

  pushToPeerReviewsStore: (peerReview) => {
    set((state) => ({ peerReviews: [...state.peerReviews, peerReview] }));
  },

  updatePeerReviewInStore: (peerReview) => {
    set((state) => ({
      peerReviews: state.peerReviews.map((p) =>
        p.address === peerReview.address ? peerReview : p
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

async function mintResearchPaperDB(data: PushToResearchMintCollection) {
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

async function addCommentsPeerReviewDB(data: AddPeerReviewComments) {
  const response = await fetch("/api/peer-review/add-comments", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update peer review");
  }

  return await response.json();
}
