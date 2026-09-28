// app/api/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db
      .collection("transactions")
      .aggregate([
        { $match: { userId: session.user.id } },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$price" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const income = result.find((r) => r._id === "income");
    const expense = result.find((r) => r._id === "expense");

    const totalIncome = income?.total || 0;
    const totalExpense = expense?.total || 0;

    return NextResponse.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: (income?.count || 0) + (expense?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
