import mongoose, { Schema, Document } from "mongoose";
import * as sdk from "@/lib/sdk";
import { isLimitedByteArray } from "@/lib/helpers";
import { getMongoDbUri } from "@/lib/env";

mongoose.connect(getMongoDbUri());

mongoose.Promise = global.Promise;

type PaperStateDB =
  | "AwaitingPeerReview"
  | "InPeerReview"
  | "ApprovedToPublish"
  | "RequiresRevision"
  | "Published"
  | "Minted";

// Define interface for ResearchPaperArgs
export interface ResearchPaper extends Document {
  address: string; // Storing the PublicKey as a String
  creatorPubkey: string; // Storing the PublicKey as a String
  state: PaperStateDB; // Using string to represent PaperState
  accessFee: number;
  version: number;
  paperContentHash: number[]; // Array of size 64
  totalApprovals: number;
  totalCitations: number; // Changed from bignum to number
  totalMints: number; // Changed from bignum to number
  metaDataMerkleRoot: number[]; // Array of size 64
  metadata: {
    title: string;
    abstract: string;
    authors: string[];
    datePublished: string;
    domain: string;
    tags: string[];
    references: string[];
    decentralizedStorageURI: string;
  };
  bump: number;
}

// Define the ResearchPaper schema
const ResearchPaperSchema: Schema = new Schema<ResearchPaper>({
  address: {
    type: String, // Storing the PublicKey as a String
    required: true,
  },
  creatorPubkey: {
    type: String, // Storing the PublicKey as a String
    required: true,
  },
  state: {
    type: String, // Using string to represent PaperState
    enum: Object.values(sdk.PaperState), // Ensuring only valid states can be stored
    required: true,
  },
  accessFee: {
    type: Number,
    required: true,
  },
  version: {
    type: Number,
    required: true,
  },
  paperContentHash: {
    type: [Number], // Array of size 64
    validate: [
      isLimitedByteArray,
      "PaperContentHash array must have exactly 64 elements (bytes)",
    ],
    required: true,
  },
  totalApprovals: {
    type: Number,
    required: true,
  },
  totalCitations: {
    type: Number, // Changed to number
    required: true,
  },
  totalMints: {
    type: Number, // Changed to number
    required: true,
  },
  metaDataMerkleRoot: {
    type: [Number], // Array of size 64
    validate: [
      isLimitedByteArray,
      "MetadataMerkleRoot array must have exactly 64 elements (bytes)",
    ],
    required: true,
  },
  metadata: {
    type: {
      title: String,
      abstract: String,
      authors: [String],
      datePublished: String,
      domain: String,
      tags: [String],
      references: [String],
      decentralizedStorageURI: String,
    },
  },
  bump: {
    type: Number,
    required: true,
  },
});

export default mongoose.models.ResearchPaper ||
  mongoose.model<ResearchPaper>("ResearchPaper", ResearchPaperSchema);
