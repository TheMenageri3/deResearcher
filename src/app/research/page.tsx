import { Metadata } from "next";
import { PAPER_STATUS } from "@/lib/constants";
import ResearchLayout from "@/components/ResearchPaper/ResearchPaperLayout";
import { getPapers } from "@/dummyData/dummyAPIcall";

export const metadata: Metadata = {
  title: "Research",
};

export default async function ResearchPage() {
  const papers = await getPapers(PAPER_STATUS.PUBLISHED);

  return <ResearchLayout title="Published Research" papers={papers} />;
}
