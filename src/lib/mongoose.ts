import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

let isConnected: boolean | undefined;

export async function connectMongoose() {
  if (isConnected) {
    return mongoose.connection;
  }

  // Reuse cached connection in dev to avoid creating multiple connections
  const globalWithMongoose = global as typeof globalThis & {
    _mongooseConn?: typeof mongoose;
  };

  if (globalWithMongoose._mongooseConn) {
    isConnected = true;
    return globalWithMongoose._mongooseConn.connection;
  }

  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB || undefined,
  });

  isConnected = true;
  globalWithMongoose._mongooseConn = mongoose;
  return mongoose.connection;
}

export default connectMongoose;
