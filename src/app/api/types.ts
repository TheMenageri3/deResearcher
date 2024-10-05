import {
  PeerReview,
  ResearcherProfile,
  ResearchMintCollection,
  ResearchPaper,
  Session,
} from "@/app/models";
import { Document } from "mongoose";
import { z } from "zod";

export type SessionType = Omit<Session, keyof Document>;

export type ResearchPaperType = Omit<ResearchPaper, keyof Document>;

export type ResearchPaperMetadata = {
  title: string;
  abstract: string;
  authors: string[];
  datePublished: string;
  domain: string;
  tags: string[];
  references: string[];
  paperImageURI: string;
  decentralizedStorageURI: string;
};

export type CreateResearchPaper = {
  address: string;
  creatorPubkey: string;
  accessFee: number;
  paperContentHash: number[];
  metaDataMerkleRoot: number[];
  metadata: ResearchPaperMetadata;
  bump: number;
};

export const CreateResearchPaperSchema = z.object({
  address: z.string(),
  creatorPubkey: z.string(),
  paperContentHash: z.string(),
  accessFee: z.number(),
  metaDataMerkleRoot: z.string(),
  metadata: z.object({
    title: z.string(),
    abstract: z.string(),
    authors: z.array(z.string()),
    datePublished: z.string(),
    domain: z.string(),
    tags: z.array(z.string()),
    references: z.array(z.string()),
    paperImageURI: z.string(),
    decentralizedStorageURI: z.string(),
  }),
  bump: z.number(),
});

export type ResearchMintCollectionType = Omit<
  ResearchMintCollection,
  keyof Document
>;

export type ResearchMintCollectionMetadata = {
  mintedResearchPaperIds: string[];
};

export type ResearcherProfileType = Omit<ResearcherProfile, keyof Document>;

export type ResearcherProfileMetadata = {
  email: string;
  organization?: string;
  bio?: string;
  profileImageURI?: string;
  backgroundImageURI?: string;
  externalResearchProfiles?: string[];
  interestedDomains?: string[];
  topPublications?: string[];
  socialLinks?: string[];
};

export type CreateResearcherProfile = {
  address: string;
  researcherPubkey: string;
  name: string;
  metadata: ResearcherProfileMetadata;
  metaDataMerkleRoot: number[];
  bump: number;
};

export const CreateResearcherProfileSchema = z.object({
  address: z.string(),
  researcherPubkey: z.string(),
  bump: z.number(),
  name: z.string(),
  metaDataMerkleRoot: z.string(),
  metadata: z.object({
    email: z.string(),
    organization: z.string().optional(),
    bio: z.string().optional(),
    profileImageURI: z.string().optional(),
    backgroundImageURI: z.string().optional(),
    affiliation: z.string(),
    interests: z.array(z.string()),
    topPublications: z.array(z.string()),
    socialLinks: z.array(z.string()),
  }),
});

export type PeerReviewType = Omit<PeerReview, keyof Document>;

export type PeerReviewMetadata = {
  title: string;
  reviewComments: string;
};

export type AddPeerReview = {
  reviewerId: string;
  paperId: string;
  address: string;
  reviewerPubkey: string;
  paperPubkey: string;
  qualityOfResearch: number;
  potentialForRealWorldUseCase: number;
  domainKnowledge: number;
  practicalityOfResultObtained: number;
  metaDataMerkleRoot: number[];
  metadata: PeerReviewMetadata;
  bump: number;
};
