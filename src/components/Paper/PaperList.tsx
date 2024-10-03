"use client";

import { usePaperStore } from "@/app/store/paperStore";
import { PAPER_STATUS } from "@/lib/constants";
import React from "react";
import PaperCard from "./PaperCard";

export default function PaperList() {
  const { fetchPapersByState, papers } = usePaperStore();

  React.useEffect(() => {
    fetchPapersByState(PAPER_STATUS.PUBLISHED);
  }, [fetchPapersByState]);

  return (
    <>
      {papers.map((paper) => {
        return (
          <PaperCard
            key={paper.id}
            title={paper.metadata.title}
            authors={paper.metadata.authors}
            domain={paper.metadata.domain}
            tags={paper.metadata.tags}
            minted={paper.totalMints}
            price={paper.accessFee ?? 0}
            status={paper.state}
            id={paper.id}
            reviewers={paper.peerReviews?.length}
          />
        );
      })}
    </>
  );
}
