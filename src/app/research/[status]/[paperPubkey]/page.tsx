import MainLayout from "@/app/main-layout";
import PaperContentComponent from "@/components/Paper/PaperContent";
import { notFound } from "next/navigation";
import { PaperSchema } from "@/lib/validation";
import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { usePaperStore } from "@/app/store/paperStore";

async function fetchPaperByPubkeyFromDB(status: string, paperPubkey: string) {
  const response = await fetch(
    `${process.env.BASE_URL}/api/research/${status}/${paperPubkey}`,
    {
      cache: "no-store",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch paper");
  }
  return await response.json();
}

async function PaperContent({
  status,
  paperPubkey,
}: {
  status: string;
  paperPubkey: string;
}) {
  const paper = await fetchPaperByPubkeyFromDB(status, paperPubkey);

  if (!paper) {
    return notFound();
  }

  return <PaperContentComponent paper={paper} />;
}

export default function PaperContentPage({
  params,
}: {
  params: { paperPubkey: string; status: string };
}) {
  const { paperPubkey, status } = params;

  return (
    <MainLayout>
      <Suspense fallback={<Spinner />}>
        <div className="container mx-auto px-4 py-8 pb-20">
          <PaperContent status={status} paperPubkey={paperPubkey} />
        </div>
      </Suspense>
    </MainLayout>
  );
}
