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

  let paperData;
  let paper: Paper;

  try {
    // Fetch paper data from the API route
    const res = await fetch(
      `http://localhost:3000/api/research/${status}/${paper_id}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      console.error(`API response not OK: ${res.status} ${res.statusText}`);
      notFound();
    }

    paperData = await res.json();
    console.log("Received paper data:", JSON.stringify(paperData, null, 2));
  } catch (error) {
    console.error("Error fetching or parsing paper data:", error);
    notFound();
  }

  try {
    // Validate the data using PaperSchema
    paper = PaperSchema.parse(paperData);
  } catch (error) {
    console.error("Invalid paper data:", error);
    console.error("Received data:", JSON.stringify(paperData, null, 2));
    console.error("PaperSchema:", PaperSchema);
    notFound();
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 pb-20">
        <PaperContentComponent paper={paper} />
      </div>
    </MainLayout>
  );
}
