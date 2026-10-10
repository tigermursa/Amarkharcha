// src/app/api/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const activePeriod = await db
      .collection("periods")
      .findOne({ userId, isActive: true });

    const [
      totalExpAgg,
      totalIncAgg,
      todayAgg,
      periodExpAgg,
      periodIncAgg,
      transactionCount,
    ] = await Promise.all([
      db
        .collection("transactions")
        .aggregate([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: "$price" } } },
        ])
        .toArray(),
      db
        .collection("incomes")
        .aggregate([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray(),
      db
        .collection("transactions")
        .aggregate([
          { $match: { userId, date: { $gte: startOfToday } } },
          { $group: { _id: null, total: { $sum: "$price" } } },
        ])
        .toArray(),
      activePeriod
        ? db
            .collection("transactions")
            .aggregate([
              { $match: { userId, periodId: activePeriod._id.toString() } },
              { $group: { _id: null, total: { $sum: "$price" } } },
            ])
            .toArray()
        : Promise.resolve([]),
      activePeriod
        ? db
            .collection("incomes")
            .aggregate([
              { $match: { userId, periodId: activePeriod._id.toString() } },
              { $group: { _id: null, total: { $sum: "$amount" } } },
            ])
            .toArray()
        : Promise.resolve([]),
      db.collection("transactions").countDocuments({ userId }),
    ]);

    const totalExpense = totalExpAgg[0]?.total || 0;
    const totalIncome = totalIncAgg[0]?.total || 0;

    return NextResponse.json({
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
      todayExpense: todayAgg[0]?.total || 0,
      currentPeriodExpense: periodExpAgg[0]?.total || 0,
      currentPeriodIncome: periodIncAgg[0]?.total || 0,
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
