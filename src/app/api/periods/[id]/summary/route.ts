// src/app/api/periods/[id]/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: category-wise breakdown for a specific period
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

    const period = await db.collection("periods").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!period) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    const breakdown = await db
      .collection("transactions")
      .aggregate([
        { $match: { userId: session.user.id, periodId: id } },
        {
          $group: {
            _id: "$categoryId",
            categoryName: { $first: "$categoryName" },
            categoryIcon: { $first: "$categoryIcon" },
            total: { $sum: "$price" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ])
      .toArray();

    const totalAmount = breakdown.reduce((s, b) => s + b.total, 0);
    const totalCount = breakdown.reduce((s, b) => s + b.count, 0);

    return NextResponse.json({
      period: {
        _id: period._id.toString(),
        name: period.name,
        startDate: period.startDate,
        endDate: period.endDate,
      },
      breakdown: breakdown.map((b) => ({
        categoryId: b._id,
        categoryName: b.categoryName || "Unknown",
        categoryIcon: b.categoryIcon || "FaEllipsisH",
        total: b.total,
        count: b.count,
      })),
      totalAmount,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching period summary:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
