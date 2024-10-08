export const getMongoDbUri = () => {
  return (
    (process.env.MONGODB_DEV_URI as string) || "mongodb://localhost:27017/"
  );
};
