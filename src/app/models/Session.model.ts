import { getMongoDbUri } from "@/lib/env";
import mongoose, { Schema, Document } from "mongoose";

mongoose.connect(getMongoDbUri());
mongoose.Promise = global.Promise;

export interface Session extends Document {
  walletSignature: string;
  walletPubkey: string;
  createdAt: Date;
  expiresAt: Date;
}

const SessionSchema: Schema = new Schema<Session>({
  walletSignature: {
    type: String,
    required: true,
    unique: true,
  },
  walletPubkey: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Ensure TTL index is created on `expiresAt`
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Session ||
  mongoose.model<Session>("Session", SessionSchema);
