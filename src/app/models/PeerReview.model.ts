import mongoose, { Schema, Document } from "mongoose";
import { isLimitedByteArray } from "@/lib/helpers";

// Define the PeerReview interface
export interface PeerReview extends Document {
  id?: string; // Aliased from _id
  reviewerId: mongoose.Types.ObjectId;
  paperId: mongoose.Types.ObjectId;
  address: string; // Review public key
  reviewerPubkey: string;
  paperPubkey: string;
  qualityOfResearch: number;
  potentialForRealWorldUseCase: number;
  domainKnowledge: number;
  practicalityOfResultObtained: number;
  metaDataMerkleRoot: number[]; // Array of size 64
  metadata: {
    title: string;
    reviewComments: string;
  };
  bump: number;
}

export const PeerReviewSchema: Schema = new Schema<PeerReview>(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResearcherProfile",
      required: true,
    },
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResearchPaper",
      required: true,
    },
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
      type: [Number],
      validate: [
        isLimitedByteArray,
        "MetadataMerkleRoot array must have exactly 64 elements (bytes)",
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
  },
);

// Virtual to map _id to id
PeerReviewSchema.virtual("id").get(function (
  this: PeerReview & { _id: mongoose.Types.ObjectId },
) {
  return this._id.toHexString();
});

// Middleware using mongoose.model() to avoid circular dependencies
PeerReviewSchema.pre("findOneAndDelete", async function (next) {
  const docToDelete = await this.model.findOne(this.getFilter());
  if (docToDelete) {
    const ResearchPaper = mongoose.model("ResearchPaper");
    const ResearcherProfile = mongoose.model("ResearcherProfile");

    await ResearchPaper.findByIdAndUpdate(
      docToDelete.paperId,
      { $pull: { peerReviews: docToDelete._id } },
      { new: true },
    );
    await ResearcherProfile.findByIdAndUpdate(
      docToDelete.reviewerId,
      { $pull: { peerReviewsAsReviewer: docToDelete._id } },
      { new: true },
    );
  }
  next();
});

// Export the PeerReview model and the PeerReview interface
export default mongoose.models.PeerReview ||
  mongoose.model<PeerReview>("PeerReview", PeerReviewSchema);
