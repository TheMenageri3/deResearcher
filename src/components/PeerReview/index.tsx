import React, { useMemo } from "react";
import H4 from "../H4";
import P from "../P";
import { AvatarImageOrName } from "../Avatar";
import { formatTimeAgo, getScoreColorClass } from "@/lib/helpers";
import { PeerReviewWithResearcherProfile } from "@/lib/types";

interface PeerReviewProps {
  review: PeerReviewWithResearcherProfile;
  isExpanded: boolean;
  onToggle: () => void;
}

const calculateScore = (reviewScores: ReviewScores): number => {
  const {
    qualityOfResearch,
    potentialForRealWorldUseCase,
    domainKnowledge,
    practicalityOfResultObtained,
  } = reviewScores;

  return (
    (qualityOfResearch +
      potentialForRealWorldUseCase +
      domainKnowledge +
      practicalityOfResultObtained) /
    80
  );
};

const PeerReviewComponent: React.FC<PeerReviewProps> = React.memo(
  ({ review, isExpanded, onToggle }) => {
    const calculatedScore = useMemo(
      () =>
        calculateScore({
          qualityOfResearch: review.peerReview.qualityOfResearch,
          potentialForRealWorldUseCase:
            review.peerReview.potentialForRealWorldUseCase,
          domainKnowledge: review.peerReview.domainKnowledge,
          practicalityOfResultObtained:
            review.peerReview.practicalityOfResultObtained,
        }),
      [review.peerReview]
    );

    const scoreColorClass = useMemo(
      () => getScoreColorClass(calculatedScore),
      [calculatedScore]
    );

    const createdAtString = useMemo(() => {
      const date =
        review.peerReview.createdAt instanceof Date
          ? review.peerReview.createdAt
          : new Date(review.peerReview.createdAt as string);
      return formatTimeAgo(date.toISOString());
    }, [review.peerReview.createdAt]);

    return (
      <div className="border-b py-4 border-zinc-200">
        <div className="cursor-pointer" onClick={onToggle}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <AvatarImageOrName
                imageUrl={review.researcherProfile.metadata.profileImageURI}
                name={review.researcherProfile.name}
                size={8}
              />
              <div>
                <P className="text-sm text-zinc-800 font-semibold">
                  {review.researcherProfile.name}
                </P>
                <P className="text-xs text-zinc-500">{createdAtString}</P>
              </div>
            </div>
            <div
              className={`flex items-center justify-center ${scoreColorClass} text-white font-arbutus font-medium w-10 h-10 rounded-md text-xs`}
            >
              {calculatedScore.toFixed(1)}
            </div>
          </div>
          <H4 className="font-extralight text-pretty leading-6 text-zinc-900">
            {review.peerReview.metadata.title}
          </H4>
        </div>
        {isExpanded && (
          <div className="mt-4">
            <P className="text-pretty text-sm text-zinc-600">
              {review.peerReview.metadata.reviewComments}
            </P>
          </div>
        )}
      </div>
    );
  }
);

PeerReviewComponent.displayName = "PeerReviewComponent";

export default PeerReviewComponent;
