import React from "react";
import { Loader2 } from "lucide-react";
import { PeerReviewWithResearcherProfile } from "@/lib/types";
import PeerReviewComponent from "../PeerReview";
import P from "../P";

type PaperReviewSectionProps = {
  isLoading: boolean;
  reviews: PeerReviewWithResearcherProfile[];
  expandedReviews: Record<string, boolean>;
  onToggleReview: (reviewId: string) => void;
};

const PaperReviewSection = React.memo(
  ({
    isLoading,
    reviews,
    expandedReviews,
    onToggleReview,
  }: PaperReviewSectionProps) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </div>
      );
    }

    if (!reviews || reviews.length === 0) {
      return (
        <div className="text-left py-8">
          <P className="text-zinc-500 mb-4">No peer reviews found yet.</P>
        </div>
      );
    }

    return (
      <>
        {reviews.map((review) => (
          <PeerReviewComponent
            key={review.peerReview.address}
            review={review}
            isExpanded={!!expandedReviews[review.peerReview.address]}
            onToggle={() => onToggleReview(review.peerReview.address)}
          />
        ))}
      </>
    );
  },
);

PaperReviewSection.displayName = "PaperReviewSection";
export default PaperReviewSection;
