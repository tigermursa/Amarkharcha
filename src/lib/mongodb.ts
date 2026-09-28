// lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // ডেভেলপমেন্টে গ্লোবাল ভেরিয়েবল ব্যবহার করে হট রিলোডে মাল্টিপল কানেকশন প্রতিরোধ
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // প্রোডাকশনে প্রতিবার নতুন কানেকশন
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
