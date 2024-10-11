import { RatingSchema } from "./validation";

interface ColumnDefinition {
  key: string;
  header: string;
  sortable?: boolean;
}

export const PAPER_STATUS = {
  AWAITING_PEER_REVIEW: "AwaitingPeerReview", // initial paper state
  IN_PEER_REVIEW: "InPeerReview", // paper has a first review
  APPROVED: "ApprovedToPublish", // paper is approved to publish
  PUBLISHED: "Published",
  REQUEST_REVISION: "RequiresRevision",
  MINTED: "Minted",
};

export const COLUMNS: ColumnDefinition[] = [
  { key: "title", header: "Paper Title" },
  { key: "authors", header: "Authors" },
  { key: "createdDate", header: "Created", sortable: true },
  { key: "domains", header: "Domains" },
  { key: "status", header: "Status", sortable: true },
];

export const PROFILE_COLUMNS = [
  { key: "title", header: "Paper Title" },
  { key: "authors", header: "Authors" },
  { key: "domains", header: "Domains" },
  { key: "status", header: "Status", sortable: true },
];
export const RESEARCH_PAPER_PDA_SEED: string = "deres_research_paper";
export const PEER_REVIEW_PDA_SEED: string = "deres_peer_review";
export const RESEARCH_MINT_COLLECTION_PDA_SEED: string =
  "deres_mint_collection";
export const RESEARCHER_PROFILE_PDA_SEED: string = "deres_researcher_profile";

export const MAX_PDF_UPLOD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const LOGIN_MESSAGE = "Login to deresearcher";

export const PLACEHOLDER = `Providing a Quality Peer Review:
  
- Overview: Summarize the paper's main goals and contributions.
- Introduction: Check if the research question is clear and well-supported.
- Methods: Assess if the methods are appropriate and well-explained.
- Results: Evaluate if the results are clear and well-supported by data.
- Discussion: Review if the findings are interpreted well and their significance is clear.
`;

export const RATINGCATEGORIES: (keyof RatingSchema)[] = [
  "qualityOfResearch",
  "potentialForRealWorldUseCase",
  "domainKnowledge",
  "practicalityOfResultObtained",
];

export const RATINGCATEGORYLABELS: Record<keyof RatingSchema, string> = {
  qualityOfResearch: "Quality of Research",
  potentialForRealWorldUseCase: "Potential for Real-World Use Case",
  domainKnowledge: "Domain Knowledge",
  practicalityOfResultObtained: "Practicality of Results Obtained",
};

export const INITIALRATING: RatingSchema = {
  qualityOfResearch: undefined,
  potentialForRealWorldUseCase: undefined,
  domainKnowledge: undefined,
  practicalityOfResultObtained: undefined,
};
