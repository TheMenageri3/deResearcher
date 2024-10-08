import { PAPER_STATUS } from "@/lib/constants";
import { SolanaLogo } from "@/components/SolanaLogo";
import { Button } from "@/components/ui/button";
import { PaperSchema } from "@/lib/validation";
import { Loader2 } from "lucide-react";
import React from "react";
import { ResearchPaperType } from "@/lib/types";
PaperSchema;

interface PaperActionButtonProps {
  paper: ResearchPaperType;
  size?: string;
  onToggleReview?: () => void;
  onUpdateNewPaper?: () => void; // TODO: Implement later
  onPublishPaper?: () => void; // TODO: Implement later
  onBuyPaper?: () => void;
  isLoading?: boolean;
  isOwner?: boolean;
}

const PaperActionButton: React.FC<PaperActionButtonProps> = ({
  paper,
  onToggleReview,
  onUpdateNewPaper,
  onPublishPaper,
  onBuyPaper,
  size = "lg",
  isLoading,
  isOwner,
}) => {
  const getButtonContent = () => {
    if (isOwner) {
      return {
        text: "Publish Paper",
        action: onPublishPaper,
        icon: null,
      };
    }

    switch (paper.state) {
      case PAPER_STATUS.AWAITING_PEER_REVIEW:
      case PAPER_STATUS.IN_PEER_REVIEW:
        return {
          text: "Write Review",
          action: onToggleReview,
          icon: null,
        };
      case PAPER_STATUS.REQUEST_REVISION:
        return {
          text: "Update New Paper",
          action: onUpdateNewPaper,
          icon: null,
        };
      // case PAPER_STATUS.APPROVED:
      //   return {
      //     text: "Publish Paper",
      //     action: onPublishPaper,
      //     icon: null,
      //   };
      case PAPER_STATUS.PUBLISHED:
      case PAPER_STATUS.MINTED:
        return {
          text:
            paper.accessFee !== null
              ? `${paper.accessFee} SOL`
              : "Price not set",
          action: onBuyPaper,
          icon: <SolanaLogo className="mr-2 w-5 h-5 md:w-3 md:h-3" />,
          buy: "BUY",
        };
      default:
        return {
          text: "Buy Paper",
          action: onBuyPaper,
          icon: null,
        };
    }
  };

  const { text, action, icon, buy } = getButtonContent();

  return (
    <Button
      className="w-full md:w-[240px] text-sm flex items-center justify-center bg-primary hover:bg-primary/90"
      onClick={action}
      size={size === "lg" ? "lg" : "sm"}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {buy && <span className="mr-2">{buy}</span>}
          {icon}
          {text}
        </>
      )}
    </Button>
  );
};

export default PaperActionButton;
