// src/app/api/businesses/[id]/profits/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST: add profit entry to a business
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { month, amount } = await request.json();

    if (!month || typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "Month is required (YYYY-MM)" },
        { status: 400 },
      );
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt === 0) {
      return NextResponse.json(
        { error: "Amount must be a non-zero number" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    const business = await db.collection("businesses").findOne({
      _id: new ObjectId(id),
      userId,
    });
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 },
      );
    }

    const profit = {
      userId,
      businessId: id,
      month,
      amount: amt,
      createdAt: new Date(),
    };

    const result = await db.collection("profits").insertOne(profit);

    return NextResponse.json(
      { ...profit, _id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding profit:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
