"use client";

import React, { useState, useEffect, useCallback } from "react";
import PeerReviewEditor from "../PeerReview/PeerReviewEditor";
import PaperActionButton from "./PaperActionButton";
import useScreen from "@/hooks/useScreen";
import { useUserStore } from "@/app/store/userStore";
import { usePaperStore } from "@/app/store/paperStore";
import { usePaperActions } from "@/hooks/usePaperActions";
import {
  PeerReviewWithResearcherProfile,
  ResearchPaperType,
} from "@/lib/types";

import PaperHeader from "./PaperHeader";
import PaperViewer from "./PaperViewer";
import PaperReviewSection from "./PaperReviewSection";
import H4 from "../H4";

export default function PaperContentComponent({
  paper,
}: {
  paper: ResearchPaperType;
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<
    Record<string, boolean>
  >({});
  const [isPeerReviewsLoading, setIsPeerReviewsLoading] = useState(false);
  const [peerReviews, setPeerReviews] = useState<
    PeerReviewWithResearcherProfile[]
  >([]);

  const screenSize = useScreen();
  const { fetchPeerReviewsByPaperPubkey } = usePaperStore();

  const wallet = useUserStore((state) => state.wallet);
  const researcherProfile = useUserStore((state) => state.researcherProfile);
  const isMinter = useUserStore((state) =>
    state.isMinterForPaper(paper.address),
  );

  const isCreator = wallet === paper.creatorPubkey;
  const isResearcher = !!researcherProfile;
  const hasUserReviewed = peerReviews.some(
    (review) => review.peerReview.reviewerPubkey === wallet,
  );
  const hasAccessRights = isCreator || isMinted || isMinter;

  const {
    handlePublishPaper,
    handleBuyPaper,
    handleToggleReview,
    isActionLoading,
  } = usePaperActions(paper, setIsMinted, setIsEditorOpen);

  const fetchPeerReviews = useCallback(async () => {
    try {
      setIsPeerReviewsLoading(true);
      const peerReviewData = await fetchPeerReviewsByPaperPubkey(paper.address);
      if (peerReviewData) {
        setPeerReviews(
          peerReviewData as unknown as PeerReviewWithResearcherProfile[],
        );
      }
    } catch (error) {
      console.error("Error fetching peer reviews:", error);
    } finally {
      setIsPeerReviewsLoading(false);
    }
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

  return (
    <div className="mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <PaperHeader
            title={paper.metadata.title}
            abstract={paper.metadata.abstract}
            authors={paper.metadata.authors}
            tags={paper.metadata.tags}
            version={paper.version}
            createdAt={paper.createdAt?.toString()}
          />

          {/* Action button for mobile and tablet */}
          {(screenSize === "sm" || screenSize === "md") && (
            <div className="mt-16 mb-5 flex justify-center">
              <PaperActionButton
                paper={paper}
                onToggleReview={handleToggleReview}
                onPublishPaper={handlePublishPaper}
                onBuyPaper={handleBuyPaper}
                isLoading={isActionLoading}
                isCreator={isCreator}
                isResearcher={isResearcher}
                hasUserReviewed={hasUserReviewed}
                // onUpdateNewPaper={}
              />
            </div>
          )}

          <PaperViewer
            paperState={paper.state}
            pdfUrl={paper.metadata.decentralizedStorageURI}
            isCreator={isCreator}
            hasAccessRights={hasAccessRights}
            wallet={wallet}
          />
        </div>

        <div className="flex flex-col mt-20">
          {/* Action button for desktop */}
          {(screenSize === "lg" || screenSize === "xl") && (
            <PaperActionButton
              paper={paper}
              onToggleReview={handleToggleReview}
              onPublishPaper={handlePublishPaper}
              onBuyPaper={handleBuyPaper}
              isLoading={isActionLoading}
              isCreator={isCreator}
              isResearcher={isResearcher}
              hasUserReviewed={hasUserReviewed}
              // onUpdateNewPaper={}
            />
          )}

          <div className="md:hidden">
            <H4 className="font-semibold font-atkinson mb-4">Peer-Reviews</H4>
            <PaperReviewSection
              isLoading={isPeerReviewsLoading}
              reviews={peerReviews}
              expandedReviews={expandedReviews}
              onToggleReview={toggleReview}
            />
          </div>
          <div className="hidden md:block">
            <H4 className="font-semibold pt-24 font-atkinson">Peer-Reviews</H4>
            <PaperReviewSection
              isLoading={isPeerReviewsLoading}
              reviews={peerReviews}
              expandedReviews={expandedReviews}
              onToggleReview={toggleReview}
            />
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
