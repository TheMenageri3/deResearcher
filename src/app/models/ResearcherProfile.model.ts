import mongoose, { Schema, Document } from "mongoose";
import * as sdk from "@/lib/sdk";
import { isLimitedByteArray } from "@/lib/helpers";
import { getMongoDbUri } from "@/lib/env";

mongoose.connect(getMongoDbUri());
mongoose.Promise = global.Promise;

// Define interface for ResearcherProfileArgs
export interface ResearcherProfile extends Document {
  address: string; // Storing the PublicKey as a String
  researcherPubkey: string; // Storing the PublicKey as a String
  name: number[]; // Array of size 64
  state: sdk.ResearcherProfileState;
  totalPapersPublished: number;
  totalCitations: number;
  totalReviews: number;
  reputation: number;
  metaDataMerkleRoot: number[]; // Array of size 64
  metadata: {
    externalResearchProfiles: string[];
    interestedDomains: string[];
    topPublications: string[];
    socialLinks: string[];
  };
  bump: number;
}

// Define the ResearcherProfile schema
const ResearcherProfileSchema: Schema = new Schema({
  address: {
    type: String,
    required: true,
  },
  researcherPubkey: {
    type: String,
    required: true,
  },
  name: {
    type: String, // Array of size 64
    required: true,
  },
  state: {
    type: String, // Using string to represent ResearcherProfileState
    enum: Object.values(sdk.ResearcherProfileState), // Ensuring only valid states can be stored
    required: true,
  },
  totalPapersPublished: {
    type: Number, // Assuming bignum can be represented as Decimal128
    required: true,
  },
  totalCitations: {
    type: Number,
    required: true,
  },
  totalReviews: {
    type: Number,
    required: true,
  },
  reputation: {
    type: Number,
    required: true,
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
      externalResearchProfiles: [String],
      interestedDomains: [String],
      topPublications: [String],
      socialLinks: [String],
    },
    required: true,
  },
  bump: {
    type: Number,
    required: true,
  },
});

export default mongoose.models.ResearcherProfile ||
  mongoose.model<ResearcherProfile>(
    "ResearcherProfile",
    ResearcherProfileSchema
  );
