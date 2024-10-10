"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { PAPER_STATUS } from "@/lib/constants";
import { useRouter } from "next/navigation";

type ColumnDefinition = {
  key: string;
  header: string;
  sortable?: boolean;
};

type TableProps = {
  columns: ColumnDefinition[];
  data: any[];
  marginTop?: string;
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null;

const getColumnVisibility = (columnKey: string) => {
  switch (columnKey) {
    case "title":
    case "minted": // Make "minted" always visible
      return "";
    case "status":
      return "table-cell";
    case "createdDate":
      return "hidden md:table-cell";
    default:
      return "hidden lg:table-cell";
  }
};

const TableHeader: React.FC<{
  columns: ColumnDefinition[];
  onSort: (key: string) => void;
  sortConfig: SortConfig;
}> = ({ columns, onSort, sortConfig }) => (
  <thead className="bg-gradient-to-r from-zinc-100/50 to-violet-200/50">
    <tr>
      {columns.map((column) => (
        <th
          key={column.key}
          scope="col"
          className={`px-6 py-3 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider ${getColumnVisibility(
            column.key,
          )} ${column.sortable ? "cursor-pointer select-none" : ""}`}
          onClick={() => column.sortable && onSort(column.key)}
        >
          <div className="flex items-center">
            {column.header}
            {column.sortable && (
              <span className="ml-2">
                {sortConfig?.key === column.key ? (
                  sortConfig.direction === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </span>
            )}
          </div>
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow: React.FC<{
  item: any;
  columns: ColumnDefinition[];
  onRowClick: (item: any) => void;
}> = ({ item, columns, onRowClick }) => (
  <tr
    className="hover:bg-zinc-50 cursor-pointer"
    onClick={() => onRowClick(item)}
  >
    {columns.map((column) => (
      <td
        key={column.key}
        className={`px-6 py-4 whitespace-nowrap ${getColumnVisibility(
          column.key,
        )}`}
      >
        {column.key === "status" ? (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              item.status === PAPER_STATUS.APPROVED
                ? "bg-secondary-foreground text-secondary"
                : item.status === PAPER_STATUS.IN_PEER_REVIEW ||
                  item.status === PAPER_STATUS.AWAITING_PEER_REVIEW
                ? "bg-primary-foreground text-primary"
                : item.status === PAPER_STATUS.PUBLISHED
                ? "bg-accent text-accent-foreground"
                : "bg-destructive-foreground text-destructive"
            }`}
          >
            {item.status}
          </span>
        ) : (
          <span className="text-zinc-600 text-sm break-words whitespace-normal text-pretty">
            {item[column.key]}
          </span>
        )}
      </td>
    ))}
  </tr>
);

export default function Table({
  columns,
  data,
  marginTop = "mt-8",
}: TableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdDate",
    direction: "desc",
  });
  const router = useRouter();

  const sortedData = useMemo(() => {
    if (!Array.isArray(data)) {
      console.error("Data provided to Table is not an array");
      return [];
    }

    const formattedData = data.map((item) => ({
      ...item,
      createdDate: item.createdDate || "N/A",
    }));

    if (sortConfig !== null) {
      return formattedData.sort((a, b) => {
        if (sortConfig.key === "createdDate") {
          // Parse dates, defaulting to the earliest possible date if invalid
          const dateA =
            a.createdDate !== "N/A" ? new Date(a.createdDate) : new Date(0);
          const dateB =
            b.createdDate !== "N/A" ? new Date(b.createdDate) : new Date(0);

          return sortConfig.direction === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }

        const valueA = a[sortConfig.key] ?? "";
        const valueB = b[sortConfig.key] ?? "";

        if (valueA < valueB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return formattedData;
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig((currentConfig) => {
      if (currentConfig?.key === key) {
        return {
          key,
          direction: currentConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "desc" };
    });
  };

  // NOTE: id changes to pubkey
  const handleRowClick = (item: { address: string; status: string }) =>
    router.push(`/research/${item.status}/${item.address}`);

  if (!Array.isArray(data) || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className={`flex flex-col ${marginTop}`}>
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-zinc-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-zinc-200">
              <TableHeader
                columns={columns}
                onSort={requestSort}
                sortConfig={sortConfig}
              />
              <tbody className="bg-white divide-y divide-zinc-200 text-pretty">
                {sortedData.map((item, index) => (
                  <TableRow
                    key={item.address || index}
                    item={item}
                    columns={columns}
                    onRowClick={handleRowClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
