"use client";

import React, { useState, useEffect, useCallback } from "react";
import H4 from "../H4";
import P from "../P";
import H2 from "../H2";
import PeerReviewComponent from "../PeerReview";
import { AvatarWithName } from "../Avatar";
import { Lock } from "lucide-react";
import { PaperSchema, PeerReviewSchema, RatingSchema } from "@/lib/validation";
import { formatTimeAgo } from "@/lib/helpers";
import { PAPER_STATUS } from "@/lib/constants";
import dynamic from "next/dynamic";
import { pdfjs } from "react-pdf";
import PeerReviewEditor from "../PeerReview/PeerReviewEditor";
import PaperActionButton from "./PaperActionButton";
import useScreen from "@/hooks/useScreen";
import { Button } from "../ui/button";
import RatingModal from "../Rating";
import { useUserStore } from "@/app/store/userStore";
import { usePaperStore } from "@/app/store/paperStore";
import { PeerReviewType, ResearchPaperType } from "@/lib/types";

const PDFViewComponent = dynamic(() => import("../PDFView"), { ssr: false });

export default function PaperContentComponent({
  paper,
}: {
  paper: ResearchPaperType;
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const screenSize = useScreen();
  const isMobile = screenSize === "sm" || screenSize === "md";
  const { wallet } = useUserStore();
  const [isMinter, setIsMinter] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [submittedRating, setSubmittedRating] = useState<RatingSchema | null>(
    null
  );
  const [expandedReviews, setExpandedReviews] = useState<
    Record<string, boolean>
  >({});
  const {
    addPeerReviewRating,
    fetchPeerReviewsByPaperPubkey,
    mintResearchPaper,
    isLoading,
  } = usePaperStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }, []);

  const [peerReviews, setPeerReviews] = useState<PeerReviewType[]>([]);

  useEffect(() => {
    const fetchPeerReviews = async () => {
      const peerReviews = await fetchPeerReviewsByPaperPubkey(paper.address);
      if (peerReviews) setPeerReviews(peerReviews);
    };

    if (paper) {
      fetchPeerReviews();
    }
  }, [fetchPeerReviewsByPaperPubkey, paper]);

  const toggleReview = (reviewId: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  useEffect(() => {
    if (wallet && paper.creatorPubkey) {
      const isOwner = wallet.toString() === paper.creatorPubkey.toString();
      setIsOwner(isOwner);
    }
  }, [wallet, paper.creatorPubkey]);

  const renderReviews = () => {
    if (!peerReviews || peerReviews.length === 0) {
      return (
        <div className="text-left py-8">
          <P className="text-zinc-500 mb-4">No peer reviews found yet.</P>
        </div>
      );
    }

    return peerReviews.map((review: PeerReviewType) => (
      <PeerReviewComponent
        key={review.address}
        review={{
          ...review,
        }}
        isExpanded={!!expandedReviews[review.address]}
        onToggle={() => toggleReview(review.address)}
      />
    ));
  };

  const handleBuyPaper = useCallback(() => {
    console.log("handleBuyPaper called");
    const { wallet } = useUserStore.getState();
    if (!wallet) {
      console.error("Wallet not connected");
      // You might want to show a message to the user here
      return;
    }
    try {
      console.log("Attempting to mint paper:", paper);
      mintResearchPaper(paper as ResearchPaperType);
      console.log("Paper minting initiated");
    } catch (error) {
      console.error("Error minting paper:", error);
    }
  }, [paper, mintResearchPaper]);

  const handleRateButtonClick = () => {
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmit = async (rating: RatingSchema) => {
    console.log("Parent component received rating:", rating);
    const { wallet } = useUserStore.getState();
    if (!wallet) {
      console.error("Wallet not connected");
      setError("Please connect your wallet before submitting a rating.");
      return;
    }
    try {
      setError(null);
      console.log("Initiating blockchain transaction...");
      await addPeerReviewRating(paper as unknown as ResearchPaperType, rating);
      console.log("Rating submitted successfully");
    } catch (error) {
      console.error("Error submitting rating:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred while submitting the rating");
      }
      return;
    }
    setIsRatingModalOpen(false);
  };

  return (
    <div className="mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {paper.metadata.tags.map((domain: string, index: number) => (
                <span
                  key={index}
                  className="bg-violet-100 text-violet-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {domain}
                </span>
              ))}
            </div>
            <span className="bg-violet-100 text-violet-800 text-xs font-medium px-2.5 py-0.5 rounded">
              v{paper.version}
            </span>
          </div>
          <H2 className="mb-4 text-pretty font-semibold text-zinc-700">
            {paper.metadata.title}
          </H2>
          <P className="mb-4 text-pretty font-light">
            {paper.metadata.abstract}
          </P>
          <div className="flex items-center space-x-1 mb-4">
            {paper.metadata.authors.map((author: string, index: number) => (
              <AvatarWithName key={index} name={author} />
            ))}
            <span className="text-sm text-zinc-500">
              {paper.metadata.authors.join(", ")} •{" "}
              {/* {formatTimeAgo(paper.createdAt)} */}
            </span>
          </div>

          {/* Write a review button for mobile and tablet */}
          {(screenSize === "sm" || screenSize === "md") && (
            <>
              <div className="mt-16 mb-5 flex justify-center">
                <PaperActionButton
                  paper={paper}
                  onToggleReview={() => setIsEditorOpen(true)}
                  onUpdateNewPaper={() => {}}
                  onPublishPaper={() => {}}
                  onBuyPaper={() => handleBuyPaper()} // Change this line
                  isLoading={isLoading} // Pass isLoading here
                  isOwner={isOwner}
                />
              </div>
              {/** TEMPORARY APPROACH TO SHOW RATE PAPER BUTTON*/}
              {!isOwner &&
                (paper.state === PAPER_STATUS.AWAITING_PEER_REVIEW ||
                  paper.state === PAPER_STATUS.IN_PEER_REVIEW) && (
                  <Button
                    className="w-full mb-16 md:w-[240px] text-sm flex items-center justify-center"
                    size="lg"
                    variant="outline"
                    onClick={handleRateButtonClick}
                  >
                    ⭐ Rate this Paper
                  </Button>
                )}
            </>
          )}

          {/* TODO: NEED TO CHECK PAPER STATUS + USER ROLE + MINTED ID TO SHOW PDF*/}
          {paper.state === PAPER_STATUS.PUBLISHED &&
            paper.creatorPubkey !== wallet &&
            !isMinter && (
              <div className="mt-6 bg-zinc-100 p-4 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                <P className="text-pretty text-sm text-zinc-900">
                  Support research to show the paper
                </P>
              </div>
            )}
          {(paper.state === PAPER_STATUS.IN_PEER_REVIEW ||
            paper.state === PAPER_STATUS.AWAITING_PEER_REVIEW ||
            paper.state === PAPER_STATUS.REQUEST_REVISION ||
            paper.state === PAPER_STATUS.APPROVED ||
            isMinter) && (
            <div className="mt-6 bg-zinc-700 p-4 flex items-center justify-center">
              <PDFViewComponent url={paper.metadata.decentralizedStorageURI} />
            </div>
          )}
        </div>

        <div className="flex flex-col mt-20">
          {/* Write a review button for desktop */}
          {(screenSize === "lg" || screenSize === "xl") && (
            <>
              <PaperActionButton
                paper={paper}
                onToggleReview={() => setIsEditorOpen(true)}
                onUpdateNewPaper={() => {}}
                onPublishPaper={() => {}}
                onBuyPaper={() => handleBuyPaper()} // Change this line
                isLoading={isLoading} // Pass isLoading here
                isOwner={isOwner}
              />
              {/** TEMPORARY APPROACH TO SHOW RATE PAPER BUTTON*/}
              {!isOwner &&
                // paper?.peerReviews &&
                // paper?.peerReviews.length < 1 &&
                (paper.state === PAPER_STATUS.AWAITING_PEER_REVIEW ||
                  paper.state === PAPER_STATUS.IN_PEER_REVIEW) && (
                  <Button
                    className="mt-5 w-full md:w-[240px] text-sm flex items-center justify-center"
                    size="lg"
                    variant="outline"
                    onClick={handleRateButtonClick}
                  >
                    ⭐ Rate this Paper
                  </Button>
                )}
            </>
          )}
          <div className="md:hidden">
            <H4 className="font-semibold font-atkinson mb-4">Peer-Reviews</H4>
            {renderReviews()}
          </div>
          <div className="hidden md:block">
            <H4 className="font-semibold pt-24 font-atkinson">Peer-Reviews</H4>
            {renderReviews()}
          </div>
        </div>
      </div>
      <PeerReviewEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        paper={paper}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
}
