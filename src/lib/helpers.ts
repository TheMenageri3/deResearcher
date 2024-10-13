import { Cluster, Connection, PublicKey } from "@solana/web3.js";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Globe, Twitter, Github, Linkedin, Facebook } from "lucide-react";
import { PaperSchema } from "./validation";
import * as sdk from "./sdk";
import solanaCrypto from "tweetnacl";
import { LOGIN_MESSAGE } from "./constants";
import bs58 from "bs58";
import { PaperStateDB } from "@/app/models/ResearchPaper.model";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const minimizePubkey = (pubkey: string) => {
  return pubkey.slice(0, 4) + "..." + pubkey.slice(-4);
};

export enum Role {
  Researcher = "Researcher",
  Reader = "Reader",
}

// Generate random gradient
const gradients = [
  "linear-gradient(to bottom, #4318FF, #9574E2)",
  "linear-gradient(to bottom, #FFAD08, #9574E2)",
  "linear-gradient(to bottom, #00B69B, #9574E2)",
  "linear-gradient(to bottom, #DC6262, #9574E2)",
  "linear-gradient(to bottom, #919393, #9574E2)",
  "linear-gradient(to bottom, #FF1875, #9574E2)",
  "linear-gradient(to bottom, #51A637, #9574E2)",
  "linear-gradient(to bottom, #6226EF, #9574E2)",
];

export const getGradientForPaper = (pubkey: string): string => {
  const hash = crypto.createHash("sha1");
  hash.update(pubkey);
  const index = parseInt(hash.digest("hex").slice(-1), 16) % gradients.length;
  return gradients[index];
};

// Format large numbers with 'k' for thousands
export const formatNumber = (num: number): string => {
  return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
};

// Format time ago
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const absoluteDiffInSeconds = Math.abs(diffInSeconds);

  const timeUnits = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  for (const { unit, seconds } of timeUnits) {
    const interval = Math.floor(absoluteDiffInSeconds / seconds);
    if (interval >= 1) {
      const suffix = interval === 1 ? "" : "s";
      return diffInSeconds < 0
        ? `in ${interval} ${unit}${suffix}`
        : `${interval} ${unit}${suffix} ago`;
    }
  }

  return "just now";
};

// Format paper
export const formatPaper = (paper: PaperSchema) => ({
  id: paper._id,
  title: paper.metadata.title,
  authors: paper.metadata.authors,
  createdDate: new Date(paper.createdAt).toISOString().split("T")[0],
  domains: paper.metadata.tags,
  status: paper.state,
});

// Get score color
export const getScoreColorClass = (score: number): string => {
  if (score >= 4) return "bg-primary";
  if (score >= 3) return "bg-yellow-500";
  return "bg-rose-500/80";
};

// Get link icon
export const getLinkIcon = (url: string) => {
  if (!url) return null;

  const domain = new URL(url).hostname.toLowerCase();

  if (domain.includes("twitter.com") || domain.includes("x.com")) {
    return Twitter;
  } else if (domain.includes("github.com")) {
    return Github;
  } else if (domain.includes("linkedin.com")) {
    return Linkedin;
  } else if (domain.includes("facebook.com")) {
    return Facebook;
  } else {
    return Globe;
  }
};

// Format date
export const formatDate = (dateInput: any): string => {
  if (!dateInput) return "N/A";
  if (dateInput.$date) {
    return new Date(dateInput.$date).toISOString().split("T")[0];
  }
  if (typeof dateInput === "string") {
    return dateInput.split("T")[0];
  }
  if (typeof dateInput === "number") {
    return new Date(dateInput).toISOString().split("T")[0];
  }
  return "N/A";
};

export function isLimitedByteArray(data: string) {
  return data.length === 64;
}

export function verifySignature(signature: string, pubkey: PublicKey) {
  return solanaCrypto.sign.detached.verify(
    getEncodedLoginMessage(pubkey.toBase58()),
    bs58.decode(signature),
    bs58.decode(pubkey.toBase58())
  );
}

export function getEncodedLoginMessage(pubkey: string) {
  return new Uint8Array(
    JSON.stringify({
      auth: LOGIN_MESSAGE,
      pubkey: minimizePubkey(pubkey),
    })
      .split("")
      .map((c) => c.charCodeAt(0))
  );
}

export const toPaperDbState = (state: sdk.PaperState): PaperStateDB => {
  switch (state) {
    case sdk.PaperState.AwaitingPeerReview:
      return "AwaitingPeerReview";
    case sdk.PaperState.InPeerReview:
      return "InPeerReview";
    case sdk.PaperState.ApprovedToPublish:
      return "ApprovedToPublish";

    case sdk.PaperState.RequiresRevision:
      return "RequiresRevision";

    case sdk.PaperState.Published:
      return "Published";

    case sdk.PaperState.Minted:
      return "Minted";
  }
};

export const getConnection = (cluster: Cluster) => {
  return new Connection(getRPCUrlFromCluster(cluster), {
    commitment: "confirmed",
  });
};

export const getRPCUrlFromCluster = (cluster: Cluster) => {
  switch (cluster) {
    case "devnet":
      return "https://devnet.helius-rpc.com/?api-key=0289f1b5-ef00-4e39-8da9-d5e373ad4820";
    case "mainnet-beta":
      return "https://mainnet.helius-rpc.com/?api-key=0289f1b5-ef00-4e39-8da9-d5e373ad4820";
    default:
      return "https://devnet.helius-rpc.com/?api-key=0289f1b5-ef00-4e39-8da9-d5e373ad4820";
  }
};

export const getPaperContentHashForSeeds = (hash: string) => {
  return hash.slice(0, 32);
};
