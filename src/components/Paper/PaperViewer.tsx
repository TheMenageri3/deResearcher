"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { Lock } from "lucide-react";
import P from "../P";
import { PAPER_STATUS } from "@/lib/constants";
import { pdfjs } from "react-pdf";

const PDFViewComponent = dynamic(() => import("../PDFView"), { ssr: false });

type PaperViewerProps = {
  paperState: string;
  pdfUrl: string;
  isCreator: boolean;
  hasAccessRights: boolean;
  wallet?: string | null;
};

// TODO: NEED TO CHECK USER ROLE, SO ONLY VERIFIED RESEARCHERS CAN VIEW THE PDF TO REVIEW
const PaperViewer = React.memo(
  ({
    paperState,
    pdfUrl,
    isCreator,
    hasAccessRights,
    wallet,
  }: PaperViewerProps) => {
    useEffect(() => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
    }, []);

    // TODO: the pdf is loaded on the client, need to improve whether using encrypted pdfs or checking on the server
    const renderPDF = () => (
      <div className="mt-6 bg-zinc-700 p-4 flex items-center justify-center">
        <PDFViewComponent url={pdfUrl} />
      </div>
    );

    const renderLockedMessage = (message: string) => (
      <div className="mt-6 bg-zinc-100 p-4 flex items-center">
        <Lock className="w-4 h-4 mr-2" />
        <P className="text-pretty text-sm text-zinc-900">{message}</P>
      </div>
    );

    switch (paperState) {
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
  },
);

PaperViewer.displayName = "PaperViewer";
export default PaperViewer;
