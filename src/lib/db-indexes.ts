// lib/db-indexes.ts
import clientPromise from "./mongodb";

export async function createIndexes() {
  const client = await clientPromise;
  const db = client.db();

  // Users কালেকশনের ইনডেক্স (Better Auth ইতিমধ্যে তৈরি করে)

  // Transactions কালেকশনের ইনডেক্স
  await db.collection("transactions").createIndex({ userId: 1, date: -1 });
  await db.collection("transactions").createIndex({ userId: 1, categoryId: 1 });
  await db
    .collection("transactions")
    .createIndex({ userId: 1, type: 1, date: -1 });

  // Categories কালেকশনের ইনডেক্স
  await db
    .collection("categories")
    .createIndex({ userId: 1, name: 1 }, { unique: true });
  await db.collection("categories").createIndex({ userId: 1, isDefault: 1 });

  console.log("✅ Indexes created successfully");
}
