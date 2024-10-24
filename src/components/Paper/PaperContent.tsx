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
import { useUserStore } from "@/app/store/userStore";
import { usePaperStore } from "@/app/store/paperStore";
import {
  PeerReviewWithResearcherProfile,
  ResearchPaperType,
} from "@/lib/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const PDFViewComponent = dynamic(() => import("../PDFView"), { ssr: false });

export default function PaperContentComponent({
  paper,
}: {
  paper: ResearchPaperType;
}) {
  const router = useRouter();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const screenSize = useScreen();
  const isMobile = screenSize === "sm" || screenSize === "md";
  const { wallet, researchTokenAccounts } = useUserStore();
  const [isMinter, setIsMinter] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<
    Record<string, boolean>
  >({});
  const {
    fetchPeerReviewsByPaperPubkey,
    publishResearchPaper,
    mintResearchPaper,
  } = usePaperStore();

  // Split into two separate loading states
  const [isPeerReviewsLoading, setIsPeerReviewsLoading] = useState(false);
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

  const checkIsMinter = useCallback(() => {
    const tokenAccounts = researchTokenAccounts.filter(
      (account) => account.researchTokenAccount.paperPubkey === paper.address,
    );
    if (tokenAccounts.length > 0) {
      setIsMinter(true);
    }
  }, [researchTokenAccounts, paper.address]);

  useEffect(() => {
    checkIsMinter();
  }, [checkIsMinter]);

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

  const renderReviews = () => {
    if (isPeerReviewsLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </div>
      );
    }

    if (
      (!isPeerReviewsLoading && !peerReviews) ||
      (!isPeerReviewsLoading && peerReviews.length === 0)
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

  const handleToggleReview = useCallback(() => {
    setIsEditorOpen(true);
  }, []);

  // TODO: update paper version
  // const handleUpdateNewPaper = async () => {
  //   setIsActionLoading(true);
  //   setIsActionLoading(false);
  // };

  const handlePublishPaper = useCallback(async () => {
    if (!wallet) {
      toast.error("Please connect your wallet to publish a paper");
      return;
    }
    setIsActionLoading(true);
    try {
      const result = await publishResearchPaper(paper);
      if (result.success) {
        toast.success("Paper published successfully!");
        router.push(`/research/Published/${paper.address}`);
      } else {
        toast.error(result.error || "Failed to publish paper");
      }
    } catch (error) {
      console.error("Error publishing paper:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsActionLoading(false);
    }
  }, [paper, publishResearchPaper, router, wallet]);

  const handleBuyPaper = useCallback(async () => {
    if (!wallet) {
      toast.error(
        "Please connect your wallet to proceed with the purchase and access the paper.",
      );
      return;
    }

    setIsActionLoading(true);
    try {
      const result = await mintResearchPaper(paper);
      if (result.success) {
        console.log("Minting successful, about to show toast");
        setIsMinted(true);
        toast.success("Paper minted successfully!");
        console.log("Toast should be visible now");
      } else {
        toast.error(result.error || "Failed to mint paper");
      }
    } catch (error) {
      console.error("Error minting paper:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsActionLoading(false);
    }
  }, [paper, mintResearchPaper, wallet]);

  const renderPaperContent = () => {
    const isCreator = paper.creatorPubkey === wallet;
    const hasAccessRights = isCreator || isMinted || isMinter;

    console.log("Debug: ", {
      paperState: paper.state,
      isPublished: paper.state === PAPER_STATUS.PUBLISHED,
      isCreator,
      isMinted,
      isMinter,
    });

    // TODO: This is loaded in the client side for now, need to improve this whether using encrypted pdf or server side checking
    const renderPDF = () => (
      <div className="mt-6 bg-zinc-700 p-4 flex items-center justify-center">
        <PDFViewComponent url={paper.metadata.decentralizedStorageURI} />
      </div>
    );

    const renderLockedMessage = (message: string) => (
      <div className="mt-6 bg-zinc-100 p-4 flex items-center">
        <Lock className="w-4 h-4 mr-2" />
        <P className="text-pretty text-sm text-zinc-900">{message}</P>
      </div>
    );

    switch (paper.state) {
      case PAPER_STATUS.PUBLISHED:
        return hasAccessRights
          ? renderPDF()
          : renderLockedMessage("Support research to show the paper");

      case PAPER_STATUS.IN_PEER_REVIEW:
      case PAPER_STATUS.AWAITING_PEER_REVIEW:
      case PAPER_STATUS.REQUEST_REVISION:
        return isCreator || wallet
          ? renderPDF()
          : renderLockedMessage(
              "Create a researcher profile to review the paper",
            );

      case PAPER_STATUS.APPROVED:
        return renderPDF();

      default:
        return isCreator ? renderPDF() : null;
    }
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
              <AvatarImageOrName key={index} name={author} />
            ))}
            <span className="text-sm text-zinc-500">
              {paper.metadata.authors.join(", ")} •{" "}
              {formatTimeAgo(paper.createdAt?.toString() ?? "")}
            </span>
          </div>

          {/* action button for mobile and tablet */}
          {(screenSize === "sm" || screenSize === "md") && (
            <>
              <div className="mt-16 mb-5 flex justify-center">
                <PaperActionButton
                  paper={paper}
                  onToggleReview={handleToggleReview}
                  // onUpdateNewPaper={handleUpdateNewPaper}
                  onPublishPaper={handlePublishPaper}
                  onBuyPaper={handleBuyPaper}
                  isLoading={isActionLoading}
                />
              </div>
            </>
          )}

          {/* TODO: NEED TO IMPLETEMEN USER ROLE SO ONLY SHOW PDF WHEN USER IS RESEARCHER && PAPER IS PEER-REVIEWING */}
          {renderPaperContent()}
        </div>

        <div className="flex flex-col mt-20">
          {/* action button for desktop */}
          {(screenSize === "lg" || screenSize === "xl") && (
            <>
              <PaperActionButton
                paper={paper}
                onToggleReview={handleToggleReview}
                // onUpdateNewPaper={handleUpdateNewPaper}
                onPublishPaper={handlePublishPaper}
                onBuyPaper={handleBuyPaper}
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
