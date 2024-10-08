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
  metaDataMerkleRoot: string;
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
    interests: z.array(z.string()).optional(),
    topPublications: z.array(z.string()).optional(),
    socialLinks: z.array(z.string()).optional(),
  }),
});

export type PeerReviewType = Omit<PeerReview, keyof Document>;

export type PeerReviewMetadata = {
  title: string;
  reviewComments: string;
};

export type AddPeerReview = {
  address: string;
  reviewerPubkey: string;
  paperPubkey: string;
  qualityOfResearch: number;
  potentialForRealWorldUseCase: number;
  domainKnowledge: number;
  practicalityOfResultObtained: number;
  metaDataMerkleRoot: string;
  metadata: PeerReviewMetadata;
  bump: number;
};

export const AddPeerReviewSchema = z.object({
  address: z.string(),
  reviewerPubkey: z.string(),
  paperPubkey: z.string(),
  qualityOfResearch: z.number(),
  potentialForRealWorldUseCase: z.number(),
  domainKnowledge: z.number(),
  practicalityOfResultObtained: z.number(),
  metaDataMerkleRoot: z.string(),
  metadata: z.object({
    title: z.string(),
    reviewComments: z.string(),
  }),
  bump: z.number(),
});

export type AddPeerReviewComments = {
  address: string;
  reviewerPubkey: string;
  paperPubkey: string;
  title: string;
  reviewComments: string;
  metaDataMerkleRoot: string;
  bump: number;
};

export const AddPeerReviewCommentsSchema = z.object({
  address: z.string(),
  reviewerPubkey: z.string(),
  paperPubkey: z.string(),
  title: z.string(),
  reviewComments: z.string(),
  bump: z.number(),
  metaDataMerkleRoot: z.string(),
});

export type PushToResearchMintCollection = {
  address: string;
  readerPubkey: string;
  bump: number;
  newMintedResearchPaperPubkey: string;
  metaDataMerkleRoot: string;
};

export const PushToResearchMintCollectionSchema = z.object({
  address: z.string(),
  readerPubkey: z.string(),
  bump: z.number(),
  newMintedResearchPaperPubkey: z.string(),
  metaDataMerkleRoot: z.string(),
});
