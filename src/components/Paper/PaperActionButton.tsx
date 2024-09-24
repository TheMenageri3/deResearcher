import { PAPER_STATUS } from "@/lib/utils/constants";
import { SolanaLogo } from "@/components/SolanaLogo";
import { Button } from "@/components/ui/button";
import { Paper } from "@/lib/validation";

interface PaperActionButtonProps {
  paper: Paper;
  size?: string;
  onToggleReview?: () => void;
  onUpdateNewPaper?: () => void; // TODO: Implement later
  onPublishPaper?: () => void; // TODO: Implement later
  onBuyPaper?: () => void; // TODO: Implement later
}

const PaperActionButton: React.FC<PaperActionButtonProps> = ({
  paper,
  onToggleReview,
  onUpdateNewPaper,
  onPublishPaper,
  onBuyPaper,
  size = "lg",
}) => {
  const getButtonContent = () => {
    switch (paper.status) {
      case PAPER_STATUS.PEER_REVIEWING:
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
      case PAPER_STATUS.APPROVED:
        return {
          text: "Publish Paper",
          action: onPublishPaper,
          icon: null,
        };
      case PAPER_STATUS.PUBLISHED:
      case PAPER_STATUS.MINTED:
        return {
          text: paper.price !== null ? `${paper.price} SOL` : "Price not set",
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
    >
      {<span className="mr-2">{buy}</span>}
      {icon}
      {text}
    </Button>
  );
};

export default PaperActionButton;
