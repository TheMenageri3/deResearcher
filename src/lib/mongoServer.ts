import mongoose from "mongoose";
import { getMongoDbUri } from "@/lib/env";

const connectToDatabase = async () => {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(getMongoDbUri());
  }
};

export default connectToDatabase;
