// src/app/api/reports/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");

    const match: any = { userId: session.user.id };
    if (periodId) match.periodId = periodId;

    const client = await clientPromise;
    const db = client.db();

    const rows = await db
      .collection("transactions")
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: "$categoryId",
            name: { $first: "$categoryName" },
            icon: { $first: "$categoryIcon" },
            total: { $sum: "$price" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ])
      .toArray();

    const total = rows.reduce((s, r) => s + r.total, 0);

    return NextResponse.json({
      total,
      categories: rows.map((r) => ({
        categoryId: r._id as string,
        name: r.name || "Unknown",
        icon: r.icon || "FaEllipsisH",
        total: r.total,
        count: r.count,
      })),
    });
  } catch (error) {
    console.error("Error fetching category breakdown:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
