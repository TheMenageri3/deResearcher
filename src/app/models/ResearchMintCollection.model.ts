import { isLimitedByteArray } from "@/lib/helpers";
import mongoose, { Schema, Document } from "mongoose";

mongoose.Promise = global.Promise;

// Define interface for ResearchMintCollectionArgs
export interface ResearchMintCollection extends Document {
  id?: string; // Aliased from _id
  readerPubkey: string; // Storing the PublicKey as a String
  metaDataMerkleRoot: string; // merkel root of the metadata
  metadata: {
    mintedResearchPaperIds: mongoose.Types.ObjectId[]; // Array of ResearchPaper IDs (references)
  };
  bump: number;
}

// Define the ResearchMintCollection schema
const ResearchMintCollectionSchema: Schema = new Schema<ResearchMintCollection>(
  {
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
        mintedResearchPaperIds: [
          {
            type: mongoose.Types.ObjectId,
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
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret._id;
      },
    },
  }
);

ResearchMintCollectionSchema.index({
  readerPubkey: 1,
  "metadata.mintedResearchPaperIds": 1,
});

// Virtual to map _id to id
ResearchMintCollectionSchema.virtual("id").get(function (this: {
  _id: mongoose.Types.ObjectId;
}) {
  return this._id.toHexString();
});

// Ensure virtual fields like `id` are included when converting to JSON
ResearchMintCollectionSchema.set("toJSON", { virtuals: true });

// Export the model
export default mongoose.models.ResearchMintCollection ||
  mongoose.model<ResearchMintCollection>(
    "ResearchMintCollection",
    ResearchMintCollectionSchema
  );
