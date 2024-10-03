import MainLayout from "@/app/main-layout";
import PaperContentComponent from "@/components/Paper/PaperContent";
import { notFound } from "next/navigation";
import { Paper, PaperSchema } from "@/lib/validation";

export default async function PaperContentPage({
  params,
}: {
  params: { paper_id: string; status: string };
}) {
  const { paper_id, status } = params;

  // Fetch paper data from the API route
  const res = await fetch(
    `http://localhost:3000/api/research/${status}/${paper_id}`,
  );

  if (!res.ok) {
    notFound(); // Return 404 if paper not found
  }

  const paperData = await res.json();

  // Validate the data using PaperSchema
  let paper: Paper;

  try {
    paper = PaperSchema.parse(paperData);
    console.log(paper);
  } catch (error) {
    console.error("Invalid paper data:", error);
    notFound(); // If validation fails, return 404
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 pb-20">
        <PaperContentComponent paper={paper} />
      </div>
    </MainLayout>
  );
}
