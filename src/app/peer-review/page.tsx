import { Metadata } from "next";
import ResearchLayout from "@/components/ResearchPaper/ResearchPaperLayout";
import { PAPER_STATUS } from "@/lib/constants";
import { getPapers } from "@/dummyData/dummyAPIcall";

export const metadata: Metadata = {
  title: "Peer Review",
};

export default async function PeerReviewPage() {
  const papers = await getPapers(PAPER_STATUS.PEER_REVIEWING);

  return <ResearchLayout title="Peer-Reviewing Research" papers={papers} />;
}
