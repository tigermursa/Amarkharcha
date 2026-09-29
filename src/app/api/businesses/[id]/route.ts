// src/app/api/businesses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: one business with its profits
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const business = await db.collection("businesses").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!business) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const profits = await db
      .collection("profits")
      .find({ userId: session.user.id, businessId: id })
      .sort({ month: -1 })
      .toArray();

    const totalProfit = profits.reduce((s, p) => s + p.amount, 0);

    return NextResponse.json({
      business: { ...business, _id: business._id.toString() },
      profits: profits.map((p) => ({ ...p, _id: p._id.toString() })),
      totalProfit,
    });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT: update business
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, personName, amount, investedDate } = await request.json();
    const updates: any = { updatedAt: new Date() };

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 },
        );
      }
      updates.name = name.trim();
    }
    if (personName !== undefined) {
      if (!personName.trim()) {
        return NextResponse.json(
          { error: "Person name cannot be empty" },
          { status: 400 },
        );
      }
      updates.personName = personName.trim();
    }
    if (amount !== undefined) {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt <= 0) {
        return NextResponse.json(
          { error: "Amount must be positive" },
          { status: 400 },
        );
      }
      updates.amount = amt;
    }
    if (investedDate !== undefined)
      updates.investedDate = new Date(investedDate);

    const client = await clientPromise;
    const db = client.db();

    const result = await db
      .collection("businesses")
      .updateOne(
        { _id: new ObjectId(id), userId: session.user.id },
        { $set: updates },
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE: business + cascade its profits
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("businesses").deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Cascade delete profits
    await db
      .collection("profits")
      .deleteMany({ userId: session.user.id, businessId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
