export const getMongoDbUri = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.MONGODB_PROD_URI;
  } else {
    return process.env.MONGODB_DEV_URI || "mongodb://localhost:27017/";
  }
};
