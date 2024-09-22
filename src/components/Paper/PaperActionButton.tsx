import { PAPER_STATUS } from "@/lib/utils/constants";
import { SolanaLogo } from "@/components/SolanaLogo";
import { Button } from "@/components/ui/button";
import { Paper } from "@/lib/validation";

interface PaperActionButtonProps {
  paper: Paper;
  onWriteReview?: () => void; // TODO: Implement later
  onUpdatePaper?: () => void; // TODO: Implement later
  onPublishPaper?: () => void; // TODO: Implement later
  onBuyPaper?: () => void; // TODO: Implement later
}

const PaperActionButton: React.FC<PaperActionButtonProps> = ({
  paper,
  onWriteReview,
  onUpdatePaper,
  onPublishPaper,
  onBuyPaper,
}) => {
  const getButtonContent = () => {
    switch (paper.status) {
      case PAPER_STATUS.PEER_REVIEWING:
        return {
          text: "Write Review",
          action: onWriteReview,
          icon: null,
        };
      case PAPER_STATUS.REQUEST_REVISION:
        return {
          text: "Update Paper",
          action: onUpdatePaper,
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
          icon: <SolanaLogo className="w-3 h-3 mr-2" />,
        };
      default:
        return {
          text: "Buy Paper",
          action: onBuyPaper,
          icon: null,
        };
    }
  };

  const { text, action, icon } = getButtonContent();

  return (
    <Button
      className="w-full md:w-[240px] text-sm flex items-center justify-center bg-primary hover:bg-primary/90"
      onClick={action}
    >
      {icon}
      {text}
    </Button>
  );
};

export default PaperActionButton;
