// src/app/api/reports/monthly-income/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get("months") || "12");

    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1),
      1,
    );

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    const [incomeAgg, expenseAgg] = await Promise.all([
      db
        .collection("incomes")
        .aggregate([
          { $match: { userId, date: { $gte: startDate } } },
          {
            $group: {
              _id: { y: { $year: "$date" }, m: { $month: "$date" } },
              total: { $sum: "$amount" },
            },
          },
        ])
        .toArray(),
      db
        .collection("transactions")
        .aggregate([
          { $match: { userId, date: { $gte: startDate } } },
          {
            $group: {
              _id: { y: { $year: "$date" }, m: { $month: "$date" } },
              total: { $sum: "$price" },
            },
          },
        ])
        .toArray(),
    ]);

    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;

      const inc =
        incomeAgg.find((a) => a._id.y === y && a._id.m === m)?.total || 0;
      const exp =
        expenseAgg.find((a) => a._id.y === y && a._id.m === m)?.total || 0;

      result.push({
        month: `${y}-${String(m).padStart(2, "0")}`,
        label: `${MONTHS[d.getMonth()]} ${y}`,
        income: inc,
        expense: exp,
        net: inc - exp,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching monthly income:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
