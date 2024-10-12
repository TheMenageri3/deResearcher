import connectToDatabase from "@/lib/mongoServer";
import ResearcherProfileModel from "./ResearcherProfile.model";
import PeerReviewModel from "./PeerReview.model";
import ResearchPaperModel from "./ResearchPaper.model";
import ResearchTokenAccountModel from "./ResearchTokenAccount.model";
import SessionModel from "./Session.model";

// Import types
import type { PeerReview } from "./PeerReview.model";
import type { ResearchTokenAccount } from "./ResearchTokenAccount.model";
import type { ResearchPaper } from "./ResearchPaper.model";
import type { ResearcherProfile } from "./ResearcherProfile.model";
import type { Session } from "./Session.model";

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
  ResearchTokenAccountModel,
  SessionModel,
};

// Re-export types
export type {
  PeerReview,
  ResearchTokenAccount,
  ResearchPaper,
  ResearcherProfile,
  Session,
};
