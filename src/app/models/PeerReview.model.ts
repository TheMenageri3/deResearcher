import mongoose, { Schema, Document, SchemaType } from "mongoose";
import { isLimitedByteArray } from "@/lib/helpers";
import { getMongoDbUri } from "@/lib/env";

mongoose.connect(getMongoDbUri());
mongoose.Promise = global.Promise;

export interface PeerReview extends Document {
  address: String;
  reviewerPubkey: String;
  paperPubkey: String;
  qualityOfResearch: number;
  potentialForRealWorldUseCase: number;
  domainKnowledge: number;
  practicalityOfResultObtained: number;
  metaDataMerkleRoot: number[]; // Array of size 64
  metadata: {
    reviewComments: String;
  };
  bump: number;
}

const PeerReviewSchema: Schema = new Schema<PeerReview>({
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
    type: [Number], // Array of size 64
    validate: [
      isLimitedByteArray,
      "MetadataMerkleRoot array must have exactly 64 elements (bytes)",
    ],
  },
  metadata: {
    type: {
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
});

export default mongoose.models.PeerReview ||
  mongoose.model<PeerReview>("PeerReview", PeerReviewSchema);
