import React from "react";
import H4 from "../H4";
import P from "../P";
import { AvatarWithName } from "../Avatar";

interface Review {
  id: number;
  name: string;
  time: string;
  score: number;
  title: string;
  content: string;
}

interface PeerReviewProps {
  review: Review;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function PeerReviewComponent({
  review,
  isExpanded,
  onToggle,
}: PeerReviewProps) {
  return (
    <div className="border-b py-4 border-zinc-200">
      <div className="cursor-pointer" onClick={onToggle}>
        <div className="grid grid-cols-[auto,1fr,auto] gap-2 items-center mb-2">
          <AvatarWithName name={review.name} />
          <div className="flex items-center gap-2">
            <P className="font-medium text-xs">{review.name}</P>
            <P className="text-xs text-zinc-500">{review.time}</P>
          </div>
          <div className="flex items-center justify-center bg-primary text-white font-kalnia font-medium w-10 h-10 rounded">
            {review.score.toFixed(1)}
          </div>
        </div>
        <H4 className="font-extralight text-pretty leading-6 text-zinc-900">
          {review.title}
        </H4>
      </div>
      {isExpanded && (
        <div className="mt-4">
          <P className="text-pretty text-sm text-zinc-600">{review.content}</P>
        </div>
      )}
    </div>
  );
}
