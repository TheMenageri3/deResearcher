import React from "react";
import { researchPapers } from "./dummyData";
import { ResearchPaperCard } from "./ResearchPaperCard";

export const ResearchPapers = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {researchPapers.map((paper) => {
        return <ResearchPaperCard key={paper.title} {...paper} />;
      })}
    </div>
  );
};
