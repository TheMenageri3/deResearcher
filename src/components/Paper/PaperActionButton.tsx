import { PAPER_STATUS } from "@/lib/constants";
import { SolanaLogo } from "@/components/SolanaLogo";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ResearchPaperType } from "@/lib/types";
import { memo, useMemo } from "react";

interface PaperActionButtonProps {
  paper: ResearchPaperType;
  size?: "sm" | "lg";
  onToggleReview: () => void;
  onUpdateNewPaper?: () => void;
  onPublishPaper: () => void;
  onBuyPaper: () => void;
  isLoading: boolean;
  isCreator: boolean;
  isResearcher: boolean;
  hasUserReviewed: boolean;
}

const PaperActionButton = memo(
  ({
    paper,
    size = "lg",
    onToggleReview,
    onUpdateNewPaper,
    onPublishPaper,
    onBuyPaper,
    isLoading,
    isCreator,
    isResearcher,
    hasUserReviewed,
  }: PaperActionButtonProps) => {
    const buttonConfig = useMemo(() => {
      // If user is the paper owner
      if (isCreator) {
        switch (paper.state) {
          case PAPER_STATUS.REQUEST_REVISION:
            return {
              text: "Update Paper",
              action: onUpdateNewPaper,
              show: true,
            };
          case PAPER_STATUS.PUBLISHED:
            return {
              show: false,
            };
          default:
            return {
              text: "Publish Paper",
              action: onPublishPaper,
              show: true,
            };
        }
      }

      // If user is a researcher but not the owner
      if (isResearcher && !isCreator) {
        switch (paper.state) {
          case PAPER_STATUS.AWAITING_PEER_REVIEW:
          case PAPER_STATUS.IN_PEER_REVIEW:
            return {
              text: "Write Review",
              action: onToggleReview,
              show: !hasUserReviewed,
            };
          case PAPER_STATUS.PUBLISHED:
          case PAPER_STATUS.APPROVED:
            return {
              text: `BUY ${paper.accessFee} SOL`,
              action: onBuyPaper,
              icon: <SolanaLogo className="mr-2 w-5 h-5 md:w-3 md:h-3" />,
              show: true,
            };
          default:
            return { show: false };
        }
      }

      // If user is not logged in or is not a researcher
      if (
        paper.state === PAPER_STATUS.PUBLISHED ||
        paper.state === PAPER_STATUS.APPROVED
      ) {
        return {
          text: `BUY ${paper.accessFee} SOL`,
          action: onBuyPaper,
          icon: <SolanaLogo className="mr-2 w-5 h-5 md:w-3 md:h-3" />,
          show: true,
        };
      }

      return { show: false };
    }, [
      isCreator,
      isResearcher,
      hasUserReviewed,
      paper.state,
      paper.accessFee,
      onUpdateNewPaper,
      onPublishPaper,
      onToggleReview,
      onBuyPaper,
    ]);

    if (!buttonConfig.show) {
      return null;
    }

    return (
      <Button
        className="w-full md:w-[240px] text-sm flex items-center justify-center bg-primary hover:bg-primary/90"
        onClick={buttonConfig.action}
        size={size}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {buttonConfig.icon}
            {buttonConfig.text}
          </>
        )}
      </Button>
    );
  },
);

PaperActionButton.displayName = "PaperActionButton";
export default PaperActionButton;
