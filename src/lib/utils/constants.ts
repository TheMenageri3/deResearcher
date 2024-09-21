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
  { key: "createdDate", header: "Created Date", sortable: true },
  { key: "domain", header: "Domain" },
  { key: "status", header: "Status", sortable: true },
];
