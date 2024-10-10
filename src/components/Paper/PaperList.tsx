import React from "react";
import PaperCard from "./PaperCard";

import { ResearchPaperWithResearcherProfile } from "@/lib/types";

interface PaperListProps {
  papers: ResearchPaperWithResearcherProfile[];
}

export default function PaperList({ papers }: PaperListProps) {
  return (
    <>
      {papers.map((paper) => (
        <PaperCard
          key={paper.researchPaper.creatorPubkey}
          title={paper.researchPaper.metadata.title}
          authors={paper.researchPaper.metadata.authors}
          domain={paper.researchPaper.metadata.domain}
          tags={paper.researchPaper.metadata.tags}
          minted={paper.researchPaper.totalMints}
          price={paper.researchPaper.accessFee ?? 0}
          status={paper.researchPaper.state}
          paperPubkey={paper.researchPaper.address}
          // reviewers={paper.peerReviews?.length}
        />
      ))}
    </>
  );
}
