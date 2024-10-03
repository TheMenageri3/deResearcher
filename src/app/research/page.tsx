import { Metadata } from "next";
import ResearchLayout from "@/components/ResearchPaper/ResearchPaperLayout";

export const metadata: Metadata = {
  title: "Research",
};

export default async function ResearchPage() {
  return <ResearchLayout title="Published Research" />;
}
