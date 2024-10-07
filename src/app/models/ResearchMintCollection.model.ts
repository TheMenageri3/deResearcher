import { isLimitedByteArray } from "@/lib/helpers";
import mongoose, { Schema, Document } from "mongoose";

mongoose.Promise = global.Promise;

// Define interface for ResearchMintCollectionArgs
export interface ResearchMintCollection extends Document {
  address: string; // Storing the PublicKey as a String
  readerPubkey: string; // Storing the PublicKey as a String
  metaDataMerkleRoot: string; // merkel root of the metadata
  metadata: {
    mintedResearchPaperPubkeys: string[]; // Array of ResearchPaper IDs
  };
  bump: number;
}

// Define the ResearchMintCollection schema
const ResearchMintCollectionSchema: Schema = new Schema<ResearchMintCollection>(
  {
    address: {
      type: String, // Storing the PublicKey as a String
      required: true,
    },
    readerPubkey: {
      type: String, // Storing the PublicKey or wallet address as a String
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
      type: {
        mintedResearchPaperPubkeys: [
          {
            type: [String],
            ref: "ResearchPaper", // Reference to ResearchPaper documents
          },
        ],
      },
      required: true,
    },
    bump: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ResearchMintCollectionSchema.index({
  readerPubkey: 1,
  "metadata.mintedResearchPaperPubkeys": 1,
});

// Export the model
export default mongoose.models.ResearchMintCollection ||
  mongoose.model<ResearchMintCollection>(
    "ResearchMintCollection",
    ResearchMintCollectionSchema
  );
