// src/app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PUT: update a transaction
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

    const body = await request.json();
    const { date, item, quantity, unit, price, categoryId, note, periodId } =
      body;

    if (!date || !item?.trim() || !price || !categoryId) {
      return NextResponse.json(
        { error: "Date, item, price and category are required" },
        { status: 400 },
      );
    }

    const amt = Number(price);
    if (!Number.isFinite(amt) || amt <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    const existing = await db.collection("transactions").findOne({
      _id: new ObjectId(id),
      userId,
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    // Resolve category (in case it changed)
    const category = await db.collection("categories").findOne({
      _id: new ObjectId(categoryId),
      userId,
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Resolve period (if changed, else keep existing)
    let resolvedPeriodId = existing.periodId;
    let resolvedPeriodName = existing.periodName;

    if (periodId && periodId !== existing.periodId) {
      const period = await db.collection("periods").findOne({
        _id: new ObjectId(periodId),
        userId,
      });
      if (!period) {
        return NextResponse.json(
          { error: "Period not found" },
          { status: 404 },
        );
      }
      resolvedPeriodId = periodId;
      resolvedPeriodName = period.name;
    } else if (!resolvedPeriodId) {
      const activePeriod = await db
        .collection("periods")
        .findOne({ userId, isActive: true });
      if (activePeriod) {
        resolvedPeriodId = activePeriod._id.toString();
        resolvedPeriodName = activePeriod.name;
      }
    }

    const updates = {
      date: new Date(date),
      item: item.trim(),
      quantity: quantity != null && quantity !== "" ? Number(quantity) : null,
      unit: unit || null,
      price: amt,
      categoryId,
      categoryName: category.name,
      categoryIcon: category.icon,
      note: (note || "").trim(),
      periodId: resolvedPeriodId,
      periodName: resolvedPeriodName,
      updatedAt: new Date(),
    };

    await db
      .collection("transactions")
      .updateOne({ _id: new ObjectId(id), userId }, { $set: updates });

    return NextResponse.json({
      success: true,
      transaction: { ...existing, ...updates, _id: id },
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE: remove a transaction
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

    const result = await db.collection("transactions").deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
