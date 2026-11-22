import { Db, MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

const dbName = process.env.DB_NAME || "fixbench";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 10000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 20000,
  connectTimeoutMS: 10000,
  retryReads: true,
  retryWrites: true,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

function createMongoClient(): MongoClient {
  const newClient = new MongoClient(uri!, options);
  newClient.on("topologyClosed", () => {
    if (global._mongoClient === newClient) {
      global._mongoClient = undefined;
    }
  });
  newClient.on("close", () => {
    if (global._mongoClient === newClient) {
      global._mongoClient = undefined;
    }
  });
  return newClient;
}

export function getMongoClient(): MongoClient {
  if (!global._mongoClient) {
    global._mongoClient = createMongoClient();
  }
  return global._mongoClient;
}

export async function resetMongoClient(): Promise<void> {
  const existing = global._mongoClient;
  global._mongoClient = undefined;
  if (existing) {
    try {
      await existing.close();
    } catch {
      // Ignore errors if topology is already closed
    }
  }
}

const client = getMongoClient();

export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const activeDb = getMongoClient().db(dbName);
    const value = Reflect.get(activeDb, prop, activeDb);
    return typeof value === "function" ? value.bind(activeDb) : value;
  },
});

export { client };