import { Db, MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI in fix-bench/.env.local");
}

const dbName = process.env.DB_NAME || "fixbench";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

const client =
  global._mongoClient ?? new MongoClient(uri, options);

if (process.env.NODE_ENV !== "production") {
  global._mongoClient = client;
}

export const db: Db = client.db(dbName);
export { client };