import React from "react";
import PaperCard from "./PaperCard";

import { ResearchPaperType } from "@/lib/types";

interface PaperListProps {
  papers: ResearchPaperType[];
}

export default function PaperList({ papers }: PaperListProps) {
  return (
    <>
      {papers.map((paper) => (
        <PaperCard
          key={paper.address}
          title={paper.metadata.title}
          authors={paper.metadata.authors}
          domain={paper.metadata.domain}
          tags={paper.metadata.tags}
          minted={paper.totalMints}
          price={paper.accessFee ?? 0}
          status={paper.state}
          paperPubkey={paper.address}
          // reviewers={paper.peerReviews?.length}
        />
      ))}
    </>
  );
}
