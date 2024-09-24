import mongoose, { Schema, Document } from "mongoose";
import * as sdk from "@/lib/sdk";
import { isLimitedByteArray } from "@/lib/utils/helpers";

mongoose.connect(process.env.MONGODB_PROD_URI as string);

mongoose.Promise = global.Promise;

// Define interface for ResearchPaperArgs
export interface ResearchPaper extends Document {
  address: string; // Storing the PublicKey as a String
  creatorPubkey: string; // Storing the PublicKey as a String
  state: sdk.PaperState;
  accessFee: number;
  version: number;
  paperContentHash: number[]; // Array of size 64
  totalApprovals: number;
  totalCitations: number; // Changed from bignum to number
  totalMints: number; // Changed from bignum to number
  metaDataMerkleRoot: number[]; // Array of size 64
  bump: number;
}

// Define the ResearchPaper schema
const ResearchPaperSchema: Schema = new Schema({
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

export default mongoose.model<ResearchPaper>(
  "ResearchPaper",
  ResearchPaperSchema
);