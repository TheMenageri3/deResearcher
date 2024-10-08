import mongoose, { Schema, Document } from "mongoose";
import * as sdk from "@/lib/sdk";
import { isLimitedByteArray } from "@/lib/helpers";

mongoose.Promise = global.Promise;

export type PaperStateDB =
  | "AwaitingPeerReview"
  | "InPeerReview"
  | "ApprovedToPublish"
  | "RequiresRevision"
  | "Published"
  | "Minted";

// Define interface for ResearchPaperArgs
export interface ResearchPaper extends Document {
  address: string; // Storing the PublicKey as a String
  creatorPubkey: string; // PublicKey remains as a string
  state: PaperStateDB;
  accessFee: number;
  version: number;
  paperContentHash: string;
  totalApprovals: number;
  totalCitations: number;
  totalMints: number;
  metaDataMerkleRoot: string;
  metadata: {
    title: string;
    abstract: string;
    authors: string[];
    datePublished: string;
    domain: string;
    tags: string[];
    references?: string[];
    paperImageURI?: string;
    decentralizedStorageURI: string;
  };
  bump: number;
}

// Define the ResearchPaper schema
const ResearchPaperSchema: Schema = new Schema<ResearchPaper>(
  {
    address: {
      type: String,
      required: true,
    },
    creatorPubkey: {
      type: String, // Keep storing the PublicKey as a String
      required: true,
    },
    state: {
      type: String,
      enum: Object.values(sdk.PaperState),
      required: true,
      index: true,
    },
    accessFee: {
      type: Number,
      required: true,
    },
    version: {
      type: Number,
      default: 0,
      required: true,
    },
    paperContentHash: {
      type: String, // Storing the PaperContentHash as a String
      validate: [
        isLimitedByteArray,
        "PaperContentHash string must be 64 characters long",
      ],
      required: true,
    },
    totalApprovals: {
      type: Number,
      default: 0,
      required: true,
    },
    totalCitations: {
      type: Number,
      default: 0,
      required: true,
    },
    totalMints: {
      type: Number,
      default: 0,
      required: true,
    },
    metaDataMerkleRoot: {
      type: String, // Storing the MetadataMerkleRoot as a String
      validate: [
        isLimitedByteArray,
        "MetadataMerkleRoot string must be 64 characters long",
      ],
      required: true,
    },
    metadata: {
      title: { type: String, required: true },
      abstract: { type: String, required: true },
      authors: { type: [String], required: true },
      datePublished: { type: String, required: true },
      domain: { type: String, required: true },
      tags: { type: [String], required: true },
      references: { type: [String], required: false },
      paperImageURI: { type: String, required: false },
      decentralizedStorageURI: { type: String, required: true },
    },
    bump: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.ResearchPaper ||
  mongoose.model<ResearchPaper>("ResearchPaper", ResearchPaperSchema);
