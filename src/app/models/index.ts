import connectToDatabase from "@/lib/mongoServer";
import ResearcherProfileModel from "./ResearcherProfile.model";
import PeerReviewModel from "./PeerReview.model";
import ResearchPaperModel from "./ResearchPaper.model";
import ResearchMintCollectionModel from "./ResearchMintCollection.model";
import SessionModel from "./Session.model";

// Import types
import type { PeerReview } from "./PeerReview.model";
import type { ResearchMintCollection } from "./ResearchMintCollection.model";
import type { ResearchPaper } from "./ResearchPaper.model";

// Ensure connection is established
const initializeModels = async () => {
  await connectToDatabase();
};

initializeModels().catch((error) => {
  console.error("Failed to connect to the database:", error);
});

// Export models for easier imports
export {
  ResearcherProfileModel,
  PeerReviewModel,
  ResearchPaperModel,
  ResearchMintCollectionModel,
  SessionModel,
};

// Re-export types
export type { PeerReview, ResearchMintCollection, ResearchPaper };
