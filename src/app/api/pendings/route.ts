// src/app/api/pendings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

// GET: all pending entries grouped by type with totals
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const entries = await db
      .collection("pendings")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    const receivables = entries.filter((e) => e.type === "they_owe_me");
    const payables = entries.filter((e) => e.type === "i_owe_them");

    const strip = (arr: any[]) =>
      arr.map((e) => ({ ...e, _id: e._id.toString() }));

    return NextResponse.json({
      receivables: strip(receivables),
      payables: strip(payables),
      receivablesTotal: receivables.reduce((s, e) => s + e.amount, 0),
      payablesTotal: payables.reduce((s, e) => s + e.amount, 0),
    });
  } catch (error) {
    console.error("Error fetching pendings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: create a pending entry
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, name, amount, note } = await request.json();

    if (type !== "they_owe_me" && type !== "i_owe_them") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const now = new Date();
    const entry = {
      userId: session.user.id,
      type,
      name: String(name).trim(),
      amount: amt,
      note: (note || "").trim(),
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("pendings").insertOne(entry);

    return NextResponse.json(
      { ...entry, _id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating pending:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
