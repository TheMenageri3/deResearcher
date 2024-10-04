import MainLayout from "@/app/main-layout";
import PaperContentComponent from "@/components/Paper/PaperContent";
import { notFound } from "next/navigation";
import { PaperSchema } from "@/lib/validation";
import { Suspense } from "react";
import Spinner from "@/components/Spinner";

async function fetchPaperData(status: string, paper_id: string) {
  console.log("Starting to fetch paper data...");

  const res = await fetch(
    `http://localhost:3000/api/research/${status}/${paper_id}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    console.error(`API response not OK: ${res.status} ${res.statusText}`);
    notFound();
  }

  const paperData = await res.json();
  console.log("Received paper data:", JSON.stringify(paperData, null, 2));

  try {
    return PaperSchema.parse(paperData);
  } catch (error) {
    console.error("Invalid paper data:", error);
    notFound();
  }
}

async function PaperContent({
  status,
  paper_id,
}: {
  status: string;
  paper_id: string;
}) {
  const paper = await fetchPaperData(status, paper_id);

  return <PaperContentComponent paper={paper} />;
}

export default function PaperContentPage({
  params,
}: {
  params: { paper_id: string; status: string };
}) {
  const { paper_id, status } = params;

  return (
    <MainLayout>
      <Suspense fallback={<Spinner />}>
        <div className="container mx-auto px-4 py-8 pb-20">
          <PaperContent status={status} paper_id={paper_id} />
        </div>
      </Suspense>
    </MainLayout>
  );
}
