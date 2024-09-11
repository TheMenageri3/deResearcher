"use client";
import H1 from "@/components/H1";
import P from "@/components/P";
import { PeerReviewPapers } from "@/components/PeerReview/PeerReviewPapers";
import { minimizePubkey } from "@/lib/utils/helpers";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useWallet } from "@solana/wallet-adapter-react";

const PeerReview = () => {
  const { publicKey } = useWallet();
  return (
    <div className="flex flex-col mx-auto my-10  gap-[10px] max-w-5xl space-y-10 px-3 gap-[20px]">
      <div className="w-full justify-between flex flex-row">
        <H1>Peer Review</H1>

        <Tooltip>
          <TooltipTrigger>
            <P className="font-bold">
              Reviewer : {publicKey ? minimizePubkey(publicKey.toBase58()) : ""}
            </P>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 text-white p-3 rounded-md">
            {publicKey ? publicKey.toBase58() : ""}
          </TooltipContent>
        </Tooltip>
      </div>
      <PeerReviewPapers />
    </div>
  );
};

export default PeerReview;
