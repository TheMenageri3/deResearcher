"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import P from "../P";
import H3 from "../H3";
import { formatNumber, getLinkIcon } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

interface ProfileInfoProps {
  name: string;
  walletAddress: string;
  bio: string;
  organization: string;
  fullWalletAddress: string;
  websiteUrl?: string;
  socialLink?: string;
  stats: {
    papers: number;
    reviewedPapers: number;
    reputation: number;
  };
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  name,
  walletAddress,
  bio,
  organization,
  fullWalletAddress,
  stats,
  websiteUrl,
  socialLink,
}) => {
  const [copied, setCopied] = useState(false);
  const WebsiteIcon = websiteUrl ? getLinkIcon(websiteUrl) : null;
  const SocialIcon = socialLink ? getLinkIcon(socialLink) : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="text-center mb-8">
      <H3 className="font-bold mb-1">{name}</H3>
      <P className="text-sm text-zinc-500 mb-4">{organization}</P>
      <div className="flex justify-center items-center mb-4 space-x-2">
        <span className="text-sm text-primary mr-2">{walletAddress}</span>
        <button
          onClick={handleCopy}
          className="focus:outline-none"
          aria-label={copied ? "Copied" : "Copy wallet address"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-secondary" />
          ) : (
            <Copy className="h-4 w-4 text-zinc-400 hover:text-zinc-600" />
          )}
        </button>

        {WebsiteIcon && websiteUrl && (
          <Tooltip>
            <Button
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/80 w-6 h-6"
              onClick={(e) => {
                e.preventDefault();
                window.open(websiteUrl, "_blank", "noopener,noreferrer");
              }}
              aria-label="Visit website"
              title={websiteUrl}
            >
              <WebsiteIcon className="h-4 w-4 text-white" />
            </Button>
          </Tooltip>
        )}

        {SocialIcon && socialLink && (
          <Tooltip>
            <Button
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/80 w-6 h-6"
              onClick={(e) => {
                e.preventDefault();
                window.open(socialLink, "_blank", "noopener,noreferrer");
              }}
              aria-label="Visit social profile"
              title={socialLink}
            >
              <SocialIcon className="h-4 w-4 text-white" />
            </Button>
          </Tooltip>
        )}
      </div>
      <P className="text-sm text-zinc-500 text-pretty max-w-full sm:max-w-xl md:max-w-3xl mx-auto mb-6">
        {bio}
      </P>

      <div className="flex justify-center space-x-12 mb-6">
        <div className="text-center">
          <P className="text-2xl font-bold">{formatNumber(stats.papers)}</P>
          <P className="text-sm text-zinc-500">
            {stats.papers === 1 ? "Paper" : "Papers"}
          </P>
        </div>
        <div className="text-center">
          <P className="text-2xl font-bold">
            {formatNumber(stats.reviewedPapers)}
          </P>
          <P className="text-sm text-zinc-500">Reviewed Papers</P>
        </div>
        <div className="text-center">
          <P className="text-2xl font-bold">{formatNumber(stats.reputation)}</P>
          <P className="text-sm text-zinc-500">Reputation</P>
        </div>
      </div>
    </div>
  );
};
