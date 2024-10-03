import { Metadata } from "next";
import ResearchLayout from "@/components/ResearchPaper/ResearchPaperLayout";
import { PAPER_STATUS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Peer Review",
};

export default async function PeerReviewPage() {
  return (
    <ResearchLayout
      title="Peer-Reviewing Research"
      state={PAPER_STATUS.AWAITING_PEER_REVIEW || PAPER_STATUS.IN_PEER_REVIEW}
    />
  );
}
