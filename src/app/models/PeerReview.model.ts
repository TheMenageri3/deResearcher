import mongoose, { Schema, Document } from "mongoose";
import { isLimitedByteArray } from "@/lib/helpers";

// Define the PeerReview interface
export interface PeerReview extends Document {
  address: string; // Review public key
  reviewerPubkey: string;
  paperPubkey: string; // paper public key
  qualityOfResearch: number;
  potentialForRealWorldUseCase: number;
  domainKnowledge: number;
  practicalityOfResultObtained: number;
  metaDataMerkleRoot: string;
  metadata: {
    title: string; // empty strings are not allowed
    reviewComments: string; // empty strings are not allowed
  };
  bump: number;
}

export const PeerReviewSchema: Schema = new Schema<PeerReview>(
  {
    address: {
      type: String,
      required: true,
    },
    reviewerPubkey: {
      type: String,
      required: true,
    },
    paperPubkey: {
      type: String,
      required: true,
    },
    qualityOfResearch: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    potentialForRealWorldUseCase: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    domainKnowledge: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    practicalityOfResultObtained: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    metaDataMerkleRoot: {
      type: String,
      validate: [
        isLimitedByteArray,
        "MetadataMerkleRoot string must be 64 characters long",
      ],
    },
    metadata: {
      type: {
        title: {
          type: String,
          required: true,
        },
        reviewComments: {
          type: String,
          required: true,
        },
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

// Export the PeerReview model and the PeerReview interface
export default mongoose.models.PeerReview ||
  mongoose.model<PeerReview>("PeerReview", PeerReviewSchema);
