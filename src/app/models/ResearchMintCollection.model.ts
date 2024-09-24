import { isLimitedByteArray } from "@/lib/utils/helpers";
import mongoose, { Schema, Document } from "mongoose";

mongoose.connect(process.env.MONGODB_PROD_URI as string);
mongoose.Promise = global.Promise;

// Define interface for ResearchMintCollectionArgs
export interface ResearchMintCollection extends Document {
  readerPubkey: string; // Storing the PublicKey as a String
  dataMerkleRoot: number[]; // Array of size 64
  bump: number;
}

// Define the ResearchMintCollection schema
const ResearchMintCollectionSchema: Schema = new Schema({
  readerPubkey: {
    type: String, // Storing the PublicKey as a String
    required: true,
  },
  dataMerkleRoot: {
    type: [Number], // Array of size 64
    validate: [
      isLimitedByteArray,
      "MetadataMerkleRoot array must have exactly 64 elements(bytes)",
    ],
    required: true,
  },
  metadata: {
    type: {
      mintedResearchPaperPubkeys: [String],
    },
    required: true,
  },
  bump: {
    type: Number,
    required: true,
  },
});

// Validation function for array size
function arrayLimit(val: number[]) {
  return val.length === 64;
}

export default mongoose.model<ResearchMintCollection>(
  "ResearchMintCollection",
  ResearchMintCollectionSchema
);
