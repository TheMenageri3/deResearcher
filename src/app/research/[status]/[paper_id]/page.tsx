import MainLayout from "@/app/main-layout";
import PaperContentComponent from "@/components/Paper/PaperContent";
import { notFound } from "next/navigation";
import PaperActionButton from "@/components/Paper/PaperActionButton";
import { Paper, PaperSchema } from "@/lib/validation";

import papers from "../../../../dummyData/dummyPapers.json";

export default async function PaperContentPage({
  params,
}: {
  params: { paper_id: string };
}) {
  const paperId = params.paper_id;
  const paperData = papers.find((paper) => paper.id === paperId);

  if (!paperData) {
    notFound();
  }

  let paper: Paper;

  try {
    paper = PaperSchema.parse(paperData);
  } catch (error) {
    console.error("Invalid paper data:", error);
    notFound();
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 pb-20">
        <PaperContentComponent paper={paper} />
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-100/50 backdrop-blur-md border-t border-zinc-200/20 p-4 flex justify-end items-center px-20">
        <PaperActionButton paper={paper} />
      </div>
    </MainLayout>
  );
}