"use client";

import { useState, useLayoutEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const DynamicEditor = dynamic(() => import("./DynamicEditor"), { ssr: false });

export default function PeerReviewEditor({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isTransitioned, setIsTransitioned] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = (data: { title: string; content: string }) => {
    console.log(data);
  };

  return (
    <div
      ref={editorRef}
      className={`fixed inset-x-0 bottom-0 md:top-0 md:right-0 md:left-auto h-[60vh] md:h-full w-full md:w-1/3 shadow-lg md:shadow-none transition-transform duration-300 ease-out will-change-transform z-50 ${
        isTransitioned
          ? "translate-y-0 md:translate-x-0"
          : "translate-y-full md:translate-y-0 md:translate-x-full"
      }`}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="bg-zinc-100 rounded-lg shadow-md p-4 mb-4 flex-grow overflow-hidden">
          <div className="flex items-center justify-end">
            <Button size="icon" onClick={handleClose} variant="ghost">
              <X className="h-5 w-5 font-black text-zinc-10" />
            </Button>
          </div>
          {isTransitioned && (
            <DynamicEditor onClose={handleClose} onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}
