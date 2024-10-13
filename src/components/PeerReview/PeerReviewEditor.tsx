"use client";

import { useState, useLayoutEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { RatingSchema, ResearchPaperType } from "@/lib/types";
import { useUserStore } from "@/app/store/userStore";
import toast from "react-hot-toast";

const DynamicEditor = dynamic(() => import("./DynamicEditor"), { ssr: false });

export default function PeerReviewEditor({
  isOpen,
  onClose,
  paper,
}: {
  isOpen: boolean;
  onClose: () => void;
  paper: ResearchPaperType;
}) {
  const [isTransitioned, setIsTransitioned] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { wallet } = useUserStore();

  useLayoutEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setIsTransitioned(true);
      });
    } else {
      setIsTransitioned(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsTransitioned(false);
    setTimeout(onClose, 300); // Match the transition duration
  };

  // TODO: Add peer review, pass paper and content
  const handleSubmit = async (data: {
    title: string;
    content: string;
    rating: RatingSchema;
  }) => {
    try {
      if (!wallet) {
        toast.error("Please connect your wallet to submit a peer review");
        return;
      }

      // Convert ratings from 0-10 scale to 0-100 scale
      const convertedRating: RatingSchema = Object.fromEntries(
        Object.entries(data.rating).map(([key, value]) => [
          key,
          Math.round((value as number) * 10),
        ]),
      ) as RatingSchema;

      console.log("Submitting peer review for paper:", paper.address, {
        ...data,
        rating: convertedRating,
      });

      // await addPeerReviewRating(paper, {
      //   ...convertedRating,
      //   title: data.title,
      //   reviewComments: data.content,
      // });

      toast.success("Peer review submitted successfully");
      onClose();
    } catch (error) {
      toast.error("Error submitting peer review");
      console.error("Error submitting peer review:", error);
      setError("Failed to submit peer review. Please try again.");
    }
  };

  return (
    <div
      ref={editorRef}
      className={`fixed inset-x-0 bottom-0 lg:top-0 lg:right-0 lg:left-auto h-[85svh] lg:h-full w-full lg:w-1/3 shadow-lg lg:shadow-none transition-transform duration-300 ease-out will-change-transform z-50 ${
        isTransitioned
          ? "translate-y-0 lg:translate-x-0"
          : "translate-y-full lg:translate-y-0 lg:translate-x-full"
      }`}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="bg-zinc-700 rounded-lg shadow-md p-4 mb-4 flex-grow overflow-hidden">
          <div className="flex items-center justify-end">
            <Button size="icon" onClick={handleClose} variant="ghost">
              <X className="h-5 w-5 font-black text-zinc-10" />
            </Button>
          </div>
          {isTransitioned && (
            <DynamicEditor
              onClose={handleClose}
              onSubmit={handleSubmit}
              paper={paper}
            />
          )}
        </div>
      </div>
    </div>
  );
}
