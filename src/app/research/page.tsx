import { Metadata } from "next";
import ResearchLayout from "@/components/ResearchPaper/ResearchPaperLayout";
import { PAPER_STATUS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Research",
};

export default async function ResearchPage() {
  return (
    <ResearchLayout title="Published Research" state={PAPER_STATUS.PUBLISHED} />
  );
}
