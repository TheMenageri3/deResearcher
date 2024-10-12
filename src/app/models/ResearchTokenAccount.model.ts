import { isLimitedByteArray } from "@/lib/helpers";
import mongoose, { Schema, Document } from "mongoose";

mongoose.Promise = global.Promise;

// Define interface for ResearchTokenAccountArgs
export interface ResearchTokenAccount extends Document {
  address: string; // Storing the PublicKey as a String
  researcherPubkey: string; // Storing the PublicKey as a String
  bump: number;
}

// Define the ResearchTokenAccount schema
const ResearchTokenAccountSchema: Schema = new Schema<ResearchTokenAccount>(
  {
    address: {
      type: String, // Storing the PublicKey as a String
      required: true,
    },
    researcherPubkey: {
      type: String, // Storing the PublicKey or wallet address as a String
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

// Export the model
export default mongoose.models.ResearchTokenAccount ||
  mongoose.model<ResearchTokenAccount>(
    "ResearchTokenAccount",
    ResearchTokenAccountSchema
  );
