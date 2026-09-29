// src/app/api/periods/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PUT: update a period
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

    const { name, startDate, endDate } = await request.json();

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Name, start date and end date are required" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const period = await db.collection("periods").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!period) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    await db
      .collection("periods")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { name: name.trim(), startDate: start, endDate: end } },
      );

    await db
      .collection("transactions")
      .updateMany(
        { userId: session.user.id, periodId: id },
        { $set: { periodName: name.trim() } },
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating period:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE: remove a period (only if no transactions)
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

    const period = await db.collection("periods").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!period) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    const usageCount = await db.collection("transactions").countDocuments({
      userId: session.user.id,
      periodId: id,
    });

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: ${usageCount} transaction(s) belong to this period`,
        },
        { status: 409 },
      );
    }

    await db.collection("periods").deleteOne({ _id: new ObjectId(id) });

    // If deleted one was active, make the newest remaining period active
    if (period.isActive) {
      const next = await db
        .collection("periods")
        .find({ userId: session.user.id })
        .sort({ startDate: -1 })
        .limit(1)
        .toArray();

      if (next[0]) {
        await db
          .collection("periods")
          .updateOne({ _id: next[0]._id }, { $set: { isActive: true } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting period:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
