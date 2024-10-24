"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar } from "../Avatar";
import { SolanaLogo } from "../SolanaLogo";
import H4 from "../H4";
import P from "../P";
import { PAPER_STATUS } from "@/lib/constants";
import { getGradientForPaper } from "@/lib/helpers";
import React from "react";

interface PaperCardProps {
  paperPubkey: string;
  title: string;
  authors: string[];
  domain: string;
  tags: string[];
  minted?: number; // Optional - only for published papers
  price: number;
  status: string;
  reviewers?: number; // Optional - only for peer reviewing papers
}

export default function PaperCard({
  paperPubkey,
  title,
  tags,
  authors,
  domain,
  minted,
  price,
  status,
  reviewers,
}: PaperCardProps) {
  const router = useRouter();
  const handleClick = () => router.push(`/research/${status}/${paperPubkey}`);
  const gradient = getGradientForPaper(paperPubkey);

  return (
    <div
      className={`rounded-lg overflow-hidden shadow-lg h-full flex flex-col ${
        status === PAPER_STATUS.PUBLISHED ? "cursor-pointer" : ""
      }`}
    >
      <CardHeader
        title={title}
        domain={domain}
        status={status}
        handleClick={handleClick}
        gradient={gradient}
      />
      <div className="flex flex-col flex-grow bg-white justify-between">
        {/* Increased top padding to pt-6 */}
        <div className="px-6 pt-6">
          <AuthorsList authors={authors} />
        </div>
        {/* Increased the margin-top to mt-12 or adjust as needed */}
        <div className="px-6 pb-6 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              {status === PAPER_STATUS.PUBLISHED && (
                <MintedInfo count={minted ?? 0} />
              )}
              {status === PAPER_STATUS.IN_PEER_REVIEW ||
                (status === PAPER_STATUS.AWAITING_PEER_REVIEW && (
                  <ReviewersInfo count={reviewers ?? 0} />
                ))}
            </div>
            <ActionButton
              status={status}
              price={price}
              handleClick={handleClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// helper components for the card
const CardHeader = ({
  title,
  domain,
  status,
  handleClick,
  gradient,
}: {
  title: string;
  domain: string;
  status: string;
  handleClick: () => void;
  gradient: string;
}) => (
  <div
    className="relative h-[12rem] p-6 md:h-[14rem] group"
    style={{ background: gradient }}
  >
    {status === PAPER_STATUS.PUBLISHED && (
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    )}
    <div className="h-full flex flex-col">
      <div className="flex">
        <span className="bg-zinc-800 bg-opacity-50 rounded-full px-3 py-1 text-xs font-semibold text-white mb-2">
          {domain}
        </span>
      </div>
      <H4 className="text-white font-semibold mb-2 text-balance line-clamp-4">
        {title}
      </H4>
    </div>
    {status === PAPER_STATUS.PUBLISHED && (
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="secondary"
          className="bg-white text-zinc-800 hover:bg-zinc-100"
          onClick={handleClick}
        >
          Read More
        </Button>
      </div>
    )}
  </div>
);

const AuthorsList = ({ authors }: { authors: string[] }) => (
  <P className="text-zinc-900 text-sm font-semibold mb-2">
    {authors.length === 1 ? authors[0] : authors.join(", ")}
  </P>
);

const MintedInfo = ({ count }: { count: number }) => (
  <>
    <div className="flex -space-x-2 mr-2">
      {count > 0 &&
        Array.from({ length: Math.min(count, 3) }).map((_, index) => (
          <Avatar
            key={index}
            className="w-6 h-6 border-2 border-white rounded-full shadow-md"
          />
        ))}
    </div>
    <span className="text-zinc-600 text-xs -ml-2">{count} minted</span>
  </>
);

const ReviewersInfo = ({ count }: { count: number }) => (
  <div className="flex items-center">
    {count > 0 ? (
      <>
        <div className="flex -space-x-2 mr-2">
          {count <= 3 &&
            Array.from({ length: count }).map((_, index) => (
              <Avatar
                key={index}
                className="w-6 h-6 border-2 border-white rounded-full shadow-md"
              />
            ))}
        </div>
        <span className="text-zinc-600 text-xs">
          {`${count} review${count !== 1 ? "s" : ""}`}
        </span>
      </>
    ) : (
      <span className="text-zinc-600 text-xs">No reviews yet</span>
    )}
  </div>
);

const ActionButton = ({
  status,
  price,
  handleClick,
}: {
  status: string;
  price: number;
  handleClick: () => void;
}) => {
  if (status === PAPER_STATUS.PUBLISHED) {
    return (
      <Button className="w-full sm:w-[120px] text-xs flex items-center justify-center bg-zinc-800 hover:bg-zinc-700">
        <SolanaLogo className="w-3 h-3 mr-2" />
        {price} SOL
      </Button>
    );
  }
  if (
    status === PAPER_STATUS.AWAITING_PEER_REVIEW ||
    status === PAPER_STATUS.IN_PEER_REVIEW
  ) {
    return (
      <Button
        className="w-full sm:w-auto text-xs font-semibold flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 relative overflow-hidden group"
        onClick={handleClick}
      >
        <span className="relative z-10 py-2 px-4">Write Review</span>
        <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-violet-400 via-pink-500 to-red-500 opacity-0 group-hover:opacity-75 transition-opacity duration-300 ease-out"></span>
      </Button>
    );
  }
  return null;
};
