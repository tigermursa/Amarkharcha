// src/app/api/incomes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { date, source, amount, note, periodId } = await request.json();
    const updates: any = { updatedAt: new Date() };

    if (date) updates.date = new Date(date);
    if (source !== undefined) {
      if (!source.trim())
        return NextResponse.json(
          { error: "Source cannot be empty" },
          { status: 400 },
        );
      updates.source = source.trim();
    }
    if (amount !== undefined) {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt <= 0)
        return NextResponse.json(
          { error: "Amount must be positive" },
          { status: 400 },
        );
      updates.amount = amt;
    }
    if (note !== undefined) updates.note = note.trim();

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    if (periodId) {
      const p = await db
        .collection("periods")
        .findOne({ _id: new ObjectId(periodId), userId });
      if (!p)
        return NextResponse.json(
          { error: "Period not found" },
          { status: 404 },
        );
      updates.periodId = periodId;
      updates.periodName = p.name;
    }

    const result = await db
      .collection("incomes")
      .updateOne({ _id: new ObjectId(id), userId }, { $set: updates });
    if (result.matchedCount === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating income:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("incomes").deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });
    if (result.deletedCount === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting income:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
