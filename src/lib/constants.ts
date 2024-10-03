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

export const PROFILE_COLUMNS: ColumnDefinition[] = [
  { key: "title", header: "Paper Title" },
  { key: "authors", header: "Authors" },
  { key: "domains", header: "Domains", sortable: true },
];
export const RESEARCH_PAPER_PDA_SEED: string = "deres_research_paper";
export const PEER_REVIEW_PDA_SEED: string = "deres_peer_review";
export const RESEARCH_MINT_COLLECTION_PDA_SEED: string =
  "deres_mint_collection";
export const RESEARCHER_PROFILE_PDA_SEED: string = "deres_researcher_profile";

export const MAX_PDF_UPLOD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const LOGIN_MESSAGE = "Login to deresearcher";
