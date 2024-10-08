import React from "react";
import H4 from "../H4";
import P from "../P";
import { AvatarWithName } from "../Avatar";
import { getScoreColorClass } from "@/lib/helpers";
import { PeerReviewSchema } from "@/lib/validation";

interface PeerReviewProps {
  review: PeerReviewSchema & { time: string };
  isExpanded: boolean;
  onToggle: () => void;
}

interface ReviewScores {
  qualityOfResearch: number;
  potentialForRealWorldUseCase: number;
  domainKnowledge: number;
  practicalityOfResultObtained: number;
}

export default function PeerReviewComponent({
  review,
  isExpanded,
  onToggle,
}: PeerReviewProps) {
  const calculatedScore = calculateScore({
    qualityOfResearch: review.qualityOfResearch,
    potentialForRealWorldUseCase: review.potentialForRealWorldUseCase,
    domainKnowledge: review.domainKnowledge,
    practicalityOfResultObtained: review.practicalityOfResultObtained,
  });

  const scoreColorClass = getScoreColorClass(calculatedScore);

  return (
    <div className="border-b py-4 border-zinc-200">
      <div className="cursor-pointer" onClick={onToggle}>
        <div className="grid grid-cols-[auto,1fr,auto] gap-2 items-center mb-2">
          <AvatarWithName name={review.reviewerId.name} />
          <div className="flex items-center gap-2">
            <P className="font-medium text-xs">{review.reviewerId.name}</P>
            <P className="text-xs text-zinc-500">{review.time}</P>
          </div>
          <div
            className={`flex items-center justify-center ${scoreColorClass} text-white font-arbutus font-medium w-10 h-10 rounded-md text-xs`}
          >
            {calculatedScore}
          </div>
        </div>
        <H4 className="font-extralight text-pretty leading-6 text-zinc-900">
          {review.metadata.title}
        </H4>
      </div>
      {isExpanded && (
        <div className="mt-4">
          <P className="text-pretty text-sm text-zinc-600">
            {review.metadata.reviewComments}
          </P>
        </div>
      )}
    </div>
  );
}

function calculateScore(reviewScores: ReviewScores): number {
  const {
    qualityOfResearch,
    potentialForRealWorldUseCase,
    domainKnowledge,
    practicalityOfResultObtained,
  } = reviewScores;

  // Calculate the average score (1-10 scale)
  const totalScore =
    (qualityOfResearch +
      potentialForRealWorldUseCase +
      domainKnowledge +
      practicalityOfResultObtained) /
    4;

  // Convert the average score from 1-10 to 1-5 scale
  return +(totalScore / 2).toFixed(1);
}
