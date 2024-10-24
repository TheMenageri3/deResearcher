// usePaperActions.tsx

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUserStore } from "@/app/store/userStore";
import { usePaperStore } from "@/app/store/paperStore";
import { ResearchPaperType } from "@/lib/types";

export function usePaperActions(
  paper: ResearchPaperType,
  setIsMinted: (minted: boolean) => void,
  setIsEditorOpen: (isOpen: boolean) => void,
) {
  const router = useRouter();
  const wallet = useUserStore((state) => state.wallet);
  const { publishResearchPaper, mintResearchPaper } = usePaperStore();
  const [isActionLoading, setIsActionLoading] = useState(false);

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
        setIsMinted(true);
        toast.success("Paper minted successfully!");
      } else {
        toast.error(result.error || "Failed to mint paper");
      }
    } catch (error) {
      console.error("Error minting paper:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsActionLoading(false);
    }
  }, [paper, mintResearchPaper, wallet, setIsMinted]);

  const handleToggleReview = useCallback(() => {
    setIsEditorOpen(true);
  }, [setIsEditorOpen]);

  return {
    handlePublishPaper,
    handleBuyPaper,
    handleToggleReview,
    isActionLoading,
  };
}
