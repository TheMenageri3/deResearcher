"use client";

import { useState, useEffect } from "react";
import H4 from "../H4";
import P from "../P";
import { Button } from "../ui/button";
import H2 from "../H2";
import PeerReviewComponent from "../PeerReview";
import { AvatarWithName } from "../Avatar";
import { Lock } from "lucide-react";
import { Paper, Review } from "@/lib/validation";
import { formatTimeAgo } from "@/lib/utils/helpers";
import { PAPER_STATUS } from "@/lib/utils/constants";
import dynamic from "next/dynamic";
import { pdfjs } from "react-pdf";

const PDFViewComponent = dynamic(() => import("../PDFView"), { ssr: false });

export default function PaperContentComponent({ paper }: { paper: Paper }) {
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }, []);

  const [expandedReviews, setExpandedReviews] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (paper.peer_reviews.length > 0) {
      setExpandedReviews((prev) => ({
        ...prev,
        [paper.peer_reviews[0].id]: true,
      }));
    }
  }, [paper.peer_reviews]);

  const toggleReview = (reviewId: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const renderReviews = () => {
    if (paper.peer_reviews.length === 0) {
      return <P className="text-zinc-500">No reviews yet.</P>;
    }

    return paper.peer_reviews.map((review: Review) => (
      <PeerReviewComponent
        key={review.id}
        review={{
          ...review,
          time: formatTimeAgo(review.created_at),
        }}
        isExpanded={!!expandedReviews[review.id]}
        onToggle={() => toggleReview(review.id)}
      />
    ));
  };

  return (
    <div className="mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="mb-4 flex flex-wrap gap-2">
            {paper.domains.map((domain, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {domain}
              </span>
            ))}
          </div>
          <H2 className="mb-4 text-pretty font-semibold text-zinc-700">
            {paper.title}
          </H2>
          <P className="mb-4 text-pretty font-light">{paper.description}</P>
          <div className="flex items-center space-x-1 mb-4">
            {paper.authors.map((author, index) => (
              <AvatarWithName key={index} name={author} />
            ))}
            <span className="text-sm text-zinc-500">
              {paper.authors.join(", ")} • {formatTimeAgo(paper.created_at)}
            </span>
          </div>
          {/* TODO: NEED TO CHECK PAPER STATUS + USER ROLE + MINTED ID TO SHOW PDF*/}
          {paper.status === PAPER_STATUS.PUBLISHED && (
            <div className="mt-6 bg-zinc-100 p-4 flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              <P className="text-pretty text-sm text-zinc-900">
                Support research to show the paper
              </P>
            </div>
          )}
          {paper.status === PAPER_STATUS.PEER_REVIEWING && (
            <div className="mt-6 bg-zinc-700 p-4 flex items-center justify-center">
              <PDFViewComponent url="/test.pdf" />
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-4 mt-10 md:mt-0">
          <Button
            className="w-full md:w-1/2 md:self-end hidden"
            variant="outline"
          >
            Write a review
          </Button>
          <div className="md:hidden mt-10">
            <H4 className="font-semibold font-atkinson mb-4">Peer-Reviews</H4>
            {renderReviews()}
          </div>
          <div className="hidden md:block">
            <H4 className="font-semibold pt-24 font-atkinson">Peer-Reviews</H4>
            {renderReviews()}
          </div>
        </div>
      </div>
    </div>
  );
}
