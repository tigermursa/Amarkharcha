// app/api/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalAgg, todayAgg, monthAgg, transactionCount] = await Promise.all([
      db
        .collection("transactions")
        .aggregate([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: "$price" } } },
        ])
        .toArray(),
      db
        .collection("transactions")
        .aggregate([
          { $match: { userId, date: { $gte: startOfToday } } },
          { $group: { _id: null, total: { $sum: "$price" } } },
        ])
        .toArray(),
      db
        .collection("transactions")
        .aggregate([
          { $match: { userId, date: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$price" } } },
        ])
        .toArray(),
      db.collection("transactions").countDocuments({ userId }),
    ]);

    return NextResponse.json({
      totalExpense: totalAgg[0]?.total || 0,
      todayExpense: todayAgg[0]?.total || 0,
      monthExpense: monthAgg[0]?.total || 0,
      transactionCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
