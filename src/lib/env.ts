export const getMongoDbUri = () => {
  return (
    (process.env.MONGODB_PROD_URI as string) || "mongodb://localhost:27017/"
  );
};
