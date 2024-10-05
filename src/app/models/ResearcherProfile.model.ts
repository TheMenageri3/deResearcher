import mongoose, { Schema, Document } from "mongoose";
import * as sdk from "@/lib/sdk";
import { isLimitedByteArray } from "@/lib/helpers";

mongoose.Promise = global.Promise;

type ResearcherProfileStateDB = "AwaitingApproval" | "Approved" | "Rejected";

// Define interface for ResearcherProfileArgs
export interface ResearcherProfile extends Document {
  id?: string; // Aliased from _id
  address: string; // Storing the PublicKey as a String
  researcherPubkey: string; // Storing the PublicKey as a String
  name: string; // Firstname + Lastname
  state: ResearcherProfileStateDB; // Using string to represent ResearcherProfileState
  totalPapersPublished?: number;
  totalCitations?: number;
  totalReviews?: number;
  reputation?: number;
  metaDataMerkleRoot: string; // merkel root of the metadata
  peerReviewsAsReviewer: mongoose.Types.ObjectId[]; // Array of PeerReviews where researcher is the reviewer
  papers: mongoose.Types.ObjectId[]; // Array of ResearchPaper IDs authored by the researcher
  metadata: {
    email: string;
    organization?: string;
    bio?: string;
    profileImageURI?: string;
    backgroundImageURI?: string;
    externalResearchProfiles?: string[];
    interestedDomains?: string[];
    topPublications?: string[];
    socialLinks?: string[];
  };
  bump: number;
}

// Define the ResearcherProfile schema
const ResearcherProfileSchema: Schema = new Schema<ResearcherProfile>(
  {
    address: {
      type: String,
      required: true,
    },
    researcherPubkey: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      enum: Object.values(sdk.ResearcherProfileState), // Ensuring only valid states can be stored
      required: true,
    },
    totalPapersPublished: {
      type: Number,
      default: 0,
    },
    totalCitations: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    reputation: {
      type: Number,
      default: 0,
    },
    metaDataMerkleRoot: {
      type: String, // Storing the MetadataMerkleRoot as a String
      validate: [
        isLimitedByteArray,
        "MetadataMerkleRoot string must be 64 characters long",
      ],
      required: true,
    },
    peerReviewsAsReviewer: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PeerReview",
      },
    ],
    papers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ResearchPaper",
      },
    ],
    metadata: {
      type: {
        email: { type: String, required: true },
        organization: { type: String },
        bio: { type: String },
        profileImageURI: { type: String },
        backgroundImageURI: { type: String },
        externalResearchProfiles: { type: [String] },
        interestedDomains: { type: [String] },
        topPublications: { type: [String] },
        socialLinks: { type: [String] },
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

// Virtual to map _id to id
ResearcherProfileSchema.virtual("id").get(function (this: {
  _id: mongoose.Types.ObjectId;
}) {
  return this._id.toHexString();
});

// Ensure virtual fields like `id` are included when converting to JSON
ResearcherProfileSchema.set("toJSON", { virtuals: true });

export default mongoose.models.ResearcherProfile ||
  mongoose.model<ResearcherProfile>(
    "ResearcherProfile",
    ResearcherProfileSchema
  );
