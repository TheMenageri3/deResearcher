import {
  PeerReview,
  ResearcherProfile,
  ResearchMintCollection,
  ResearchPaper,
  Session,
} from "@/app/models";
import { Document } from "mongoose";

export type SessionType = Omit<Session, keyof Document>;

export type ResearchPaperType = Omit<ResearchPaper, keyof Document>;

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
  bump: number;
  name: string;
  metadata: ResearcherProfileMetadata;
  metaDataMerkleRoot: string;
};

export type PeerReviewType = Omit<PeerReview, keyof Document>;

export type PeerReviewMetadata = {
  title: string;
  reviewComments: string;
};

export type AddPeerReviewType = {
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

export type PushToResearchMintCollection = {
  address: string;
  readerPubkey: string;
  bump: number;
  newMintedResearchPaperPubkey: string;
  metaDataMerkleRoot: string;
};
