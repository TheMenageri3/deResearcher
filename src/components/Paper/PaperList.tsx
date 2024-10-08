import React from "react";
import PaperCard from "./PaperCard";
import { PaperSchema } from "@/lib/validation";

interface PaperListProps {
  papers: PaperSchema[];
}

export default function PaperList({ papers }: PaperListProps) {
  return (
    <>
      {papers.map((paper) => (
        <PaperCard
          key={paper._id}
          title={paper.metadata.title}
          authors={paper.metadata.authors}
          domain={paper.metadata.domain}
          tags={paper.metadata.tags}
          minted={paper.totalMints}
          price={paper.accessFee ?? 0}
          status={paper.state}
          id={paper._id}
          reviewers={paper.peerReviews?.length}
        />
      ))}
    </>
  );
}
