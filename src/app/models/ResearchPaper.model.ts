import mongoose, { Schema, Document } from "mongoose";
import * as sdk from "@/lib/sdk";
import { isLimitedByteArray } from "@/lib/helpers";

mongoose.Promise = global.Promise;

export type PaperStateDB =
  | "AwaitingPeerReview"
  | "InPeerReview"
  | "ApprovedToPublish"
  | "RequiresRevision"
  | "Published"
  | "Minted";

// Define interface for ResearchPaperArgs
export interface ResearchPaper extends Document {
  id?: string;
  address: string; // Storing the PublicKey as a String
  userId?: mongoose.Types.ObjectId; // TODO: Afterc creating profile, this needs to be fixed
  creatorPubkey: string; // PublicKey remains as a string
  state: PaperStateDB;
  accessFee: number;
  version: number;
  paperContentHash: number[];
  totalApprovals: number;
  totalCitations: number;
  totalMints: number;
  metaDataMerkleRoot: number[];
  metadata: {
    title: string;
    abstract: string;
    authors: string[];
    datePublished: Date;
    domain: string;
    tags: string[];
    references?: string[];
    paperImageURI?: string;
    decentralizedStorageURI: string;
  };
  bump: number;
  peerReviews: mongoose.Types.ObjectId[];
}

export type ResearchPaperType = Omit<ResearchPaper, keyof Document>;

export interface PaperMetadata {
  title: string;
  abstract: string;
  authors: string[];
  datePublished: string;
  domain: string;
  tags: string[];
  references: string[];
  paperImageURI: string;
  decentralizedStorageURI: string;
}

// Define the ResearchPaper schema
const ResearchPaperSchema: Schema = new Schema<ResearchPaper>(
  {
    address: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId reference to the user
      ref: "ResearcherProfile", // Assuming ResearcherProfile collection for user reference
      required: true,
    },
    creatorPubkey: {
      type: String, // Keep storing the PublicKey as a String
      required: true,
    },
    state: {
      type: String,
      enum: Object.values(sdk.PaperState),
      required: true,
    },
    accessFee: {
      type: Number,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    paperContentHash: {
      type: [Number],
      validate: [
        isLimitedByteArray,
        "PaperContentHash array must have exactly 64 elements (bytes)",
      ],
      required: true,
    },
    totalApprovals: {
      type: Number,
      default: 0,
      required: true,
    },
    totalCitations: {
      type: Number,
      default: 0,
      required: true,
    },
    totalMints: {
      type: Number,
      default: 0,
      required: true,
    },
    metaDataMerkleRoot: {
      type: [Number],
      validate: [
        isLimitedByteArray,
        "MetadataMerkleRoot array must have exactly 64 elements (bytes)",
      ],
      required: true,
    },
    metadata: {
      title: { type: String, required: true },
      abstract: { type: String, required: true },
      authors: { type: [String], required: true },
      datePublished: { type: Date, required: true },
      domain: { type: String, required: true },
      tags: { type: [String], required: true },
      references: { type: [String], required: false },
      paperImageURI: { type: String, required: false },
      decentralizedStorageURI: { type: String, required: true },
    },
    bump: {
      type: Number,
      required: true,
    },
    peerReviews: [
      {
        type: mongoose.Types.ObjectId,
        ref: "PeerReview",
        default: [],
      },
    ],
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
  },
);

// Virtual to map _id to id
ResearchPaperSchema.virtual("id").get(function (this: {
  _id: mongoose.Types.ObjectId;
}) {
  return this._id.toHexString();
});

// Ensure virtual fields like `id` are included when converting to JSON
ResearchPaperSchema.set("toJSON", { virtuals: true });

// Add a post-save middleware
ResearchPaperSchema.post("save", async function (doc) {
  // Access ResearcherProfile via mongoose.model()
  const ResearcherProfile = mongoose.model("ResearcherProfile");
  try {
    await ResearcherProfile.findByIdAndUpdate(
      doc.userId,
      { $addToSet: { papers: doc._id } },
      { new: true },
    );
  } catch (error) {
    console.error("Error updating ResearcherProfile:", error);
  }
});

ResearchPaperSchema.pre("findOneAndDelete", async function (next) {
  const docToDelete = await this.model.findOne(this.getFilter());
  if (docToDelete) {
    const ResearcherProfile = mongoose.model("ResearcherProfile");
    await ResearcherProfile.findByIdAndUpdate(
      docToDelete.userId,
      { $pull: { papers: docToDelete._id } },
      { new: true },
    );
  }
  next();
});

export default mongoose.models.ResearchPaper ||
  mongoose.model<ResearchPaper>("ResearchPaper", ResearchPaperSchema);
