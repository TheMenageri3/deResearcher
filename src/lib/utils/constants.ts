interface ColumnDefinition {
  key: string;
  header: string;
  sortable?: boolean;
}

export const PAPER_STATUS = {
  PEER_REVIEWING: "peer_reviewing",
  APPROVED: "approved",
  PUBLISHED: "published",
  REQUEST_REVISION: "request_revision",
  MINTED: "minted",
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
