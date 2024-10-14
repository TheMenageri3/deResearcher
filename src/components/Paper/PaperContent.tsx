"use client";

import React, { useState, useEffect, useCallback } from "react";
import H4 from "../H4";
import P from "../P";
import H2 from "../H2";
import PeerReviewComponent from "../PeerReview";
import { AvatarImageOrName } from "../Avatar";
import { Loader2, Lock } from "lucide-react";
import { formatTimeAgo } from "@/lib/helpers";
import { PAPER_STATUS } from "@/lib/constants";
import dynamic from "next/dynamic";
import { pdfjs } from "react-pdf";
import PeerReviewEditor from "../PeerReview/PeerReviewEditor";
import PaperActionButton from "./PaperActionButton";
import useScreen from "@/hooks/useScreen";
import { Button } from "../ui/button";
import { useUserStore } from "@/app/store/userStore";
import { usePaperStore } from "@/app/store/paperStore";
import {
  PeerReviewType,
  PeerReviewWithResearcherProfile,
  ResearchPaperType,
} from "@/lib/types";

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
  const [expandedReviews, setExpandedReviews] = useState<
    Record<string, boolean>
  >({});
  const { fetchPeerReviewsByPaperPubkey, mintResearchPaper, isLoading } =
    usePaperStore();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [peerReviews, setPeerReviews] = useState<
    PeerReviewWithResearcherProfile[]
  >([]);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }, []);

  const fetchPeerReviews = useCallback(async () => {
    const peerReviewData = await fetchPeerReviewsByPaperPubkey(paper.address);
    if (peerReviewData)
      setPeerReviews(
        peerReviewData as unknown as PeerReviewWithResearcherProfile[],
      );
  }, [fetchPeerReviewsByPaperPubkey, paper.address]);

  useEffect(() => {
    if (paper) {
      fetchPeerReviews();
    }
  }, [paper, fetchPeerReviews]);

  const handleReviewSubmitted = () => {
    fetchPeerReviews();
    setIsEditorOpen(false);
  };

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
    if (isLoading) {
      console.log("Showing spinner");
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </div>
      );
    }

    if (
      (!isLoading && !peerReviews) ||
      (!isLoading && peerReviews.length === 0)
    ) {
      return (
        <div className="text-left py-8">
          <P className="text-zinc-500 mb-4">No peer reviews found yet.</P>
        </div>
      );
    }

    return peerReviews.map((review) => (
      <PeerReviewComponent
        key={review.peerReview.address}
        review={review}
        isExpanded={!!expandedReviews[review.peerReview.address]}
        onToggle={() => toggleReview(review.peerReview.address)}
      />
    ));
  };

  const handleToggleReview = () => {
    setIsEditorOpen(true);
  };

  const handleUpdateNewPaper = async () => {
    setIsActionLoading(true);
    // TODO: update logic here
    setIsActionLoading(false);
  };

  const handlePublishPaper = async () => {
    setIsActionLoading(true);
    // TODO: publish logic here
    setIsActionLoading(false);
  };

  // const handleBuyPaper = useCallback(() => {
  //   const { wallet } = useUserStore.getState();
  //   if (!wallet) {
  //     console.error("Wallet not connected");
  //     return;
  //   }
  //   try {
  //     console.log("Attempting to mint paper:", paper);
  //     mintResearchPaper(paper as ResearchPaperType);
  //     console.log("Paper minting initiated");
  //   } catch (error) {
  //     console.error("Error minting paper:", error);
  //   }
  // }, [paper, mintResearchPaper]);

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
              <AvatarImageOrName key={index} name={author} />
            ))}
            <span className="text-sm text-zinc-500">
              {paper.metadata.authors.join(", ")} •{" "}
              {formatTimeAgo(paper.createdAt?.toString() ?? "")}
            </span>
          </div>

          {/* Write a review button for mobile and tablet */}
          {(screenSize === "sm" || screenSize === "md") && (
            <>
              <div className="mt-16 mb-5 flex justify-center">
                <PaperActionButton
                  paper={paper}
                  onToggleReview={handleToggleReview}
                  onUpdateNewPaper={handleUpdateNewPaper}
                  onPublishPaper={handlePublishPaper}
                  // onBuyPaper={handleBuyPaper}
                  isLoading={isActionLoading}
                />
              </div>
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
                onToggleReview={handleToggleReview}
                onUpdateNewPaper={handleUpdateNewPaper}
                onPublishPaper={handlePublishPaper}
                // onBuyPaper={handleBuyPaper}
                isLoading={isActionLoading}
              />
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
        paper={paper}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
