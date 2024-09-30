import { getMongoDbUri } from "@/lib/env";
import { isLimitedByteArray } from "@/lib/helpers";
import mongoose, { Schema, Document } from "mongoose";

mongoose.connect(getMongoDbUri());
mongoose.Promise = global.Promise;

// Define interface for ResearchMintCollectionArgs
export interface ResearchMintCollection extends Document {
  readerPubkey: string; // Storing the PublicKey as a String
  dataMerkleRoot: number[]; // Array of size 64
  metadata: {
    mintedResearchPaperPubkeys: string[];
  };
  bump: number;
}

// Define the ResearchMintCollection schema
const ResearchMintCollectionSchema: Schema = new Schema<ResearchMintCollection>(
  {
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
  }
);

// Validation function for array size
function arrayLimit(val: number[]) {
  return val.length === 64;
}

export default mongoose.models.ResearchMintCollection ||
  mongoose.model<ResearchMintCollection>(
    "ResearchMintCollection",
    ResearchMintCollectionSchema
  );
