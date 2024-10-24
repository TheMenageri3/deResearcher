import React, { Suspense, lazy } from "react";
import { PROFILE_COLUMNS } from "@/lib/constants";
import Spinner from "../Spinner";

const LazyTable = lazy(() => import("@/components/Dashboard/Table"));

interface TableContentProps {
  isLoading: boolean;
  error: Error | null;
  data: any[];
}

const TableContent: React.FC<TableContentProps> = React.memo(
  ({ isLoading, error, data }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center h-64 text-red-500">
          Error loading data: {error.message}
        </div>
      );
    }
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      );
    }
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full bg-white bg-opacity-80">
            Loading table...
          </div>
        }
      >
        <LazyTable columns={PROFILE_COLUMNS} data={data} />
      </Suspense>
    );
  },
);

TableContent.displayName = "TableContent";

export default TableContent;
