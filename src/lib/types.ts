import {
  PeerReview,
  ResearcherProfile,
  ResearchPaper,
  ResearchTokenAccount,
  Session,
} from "@/app/models";
import { Date, Document } from "mongoose";

export type SessionType = Omit<Session, keyof Document>;

export type ResearchPaperType = Omit<ResearchPaper, keyof Document> & {
  createdAt?: Date;
};

export interface ResearchPaperMetadata {
  title: string;
  abstract: string;
  authors: string[];
  datePublished: string;
  domain: string;
  tags: string[];
  references: string[];
  paperImageURI: string;
  decentralizedStorageURI: string;
}

export type CreateResearchPaper = {
  address: string;
  creatorPubkey: string;
  accessFee: number;
  paperContentHash: string;
  metaDataMerkleRoot: string;
  metadata: ResearchPaperMetadata;
  bump: number;
};

export type ResearchTokenAccountType = Omit<
  ResearchTokenAccount,
  keyof Document
>;

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
  bump: number;
  name: string;
  metadata: ResearcherProfileMetadata;
  metaDataMerkleRoot: string;
};

export type PeerReviewType = Omit<PeerReview, keyof Document> & {
  createdAt?: Date;
};

export type RatingSchema = {
  qualityOfResearch: number;
  potentialForRealWorldUseCase: number;
  domainKnowledge: number;
  practicalityOfResultObtained: number;
};

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

export type MintResearchPaper = {
  address: string;
  researcherPubkey: string;
  paperPubkey: string;
  bump: number;
};

export type PeerReviewWithResearcherProfile = {
  peerReview: PeerReviewType;
  researcherProfile: ResearcherProfileType;
};

export type ResearchPaperWithResearcherProfile = {
  researchPaper: ResearchPaperType;
  researcherProfile: ResearcherProfileType;
};

export type ResearchTokenAccountWithResearchePaper = {
  researchTokenAccount: ResearchTokenAccountType;
  researchPaper: ResearchPaperType;
};
