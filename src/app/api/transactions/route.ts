// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: ট্রানজ্যাকশন লিস্ট
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const client = await clientPromise;
    const db = client.db();

    // ফিল্টার তৈরি
    const filter: any = { userId: session.user.id };

    if (categoryId) filter.categoryId = categoryId;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      db
        .collection("transactions")
        .find(filter)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection("transactions").countDocuments(filter),
    ]);

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        ...t,
        _id: t._id.toString(),
      })),
      total,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: নতুন ট্রানজ্যাকশন
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, item, quantity, unit, price, categoryId, type, note } = body;

    // ভ্যালিডেশন
    if (!item || !price || !categoryId || !type || !date) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // ক্যাটাগরির তথ্য আনুন (ডেনরমালাইজেশনের জন্য)
    const category = await db.collection("categories").findOne({
      _id: new ObjectId(categoryId),
      userId: session.user.id,
    });

    const transaction = {
      userId: session.user.id,
      date: new Date(date),
      item,
      quantity: quantity || null,
      unit: unit || null,
      price,
      categoryId,
      categoryName: category?.name || "Unknown",
      categoryIcon: category?.icon || "FaEllipsisH",
      type,
      note: note || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("transactions").insertOne(transaction);

    return NextResponse.json(
      { ...transaction, _id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
