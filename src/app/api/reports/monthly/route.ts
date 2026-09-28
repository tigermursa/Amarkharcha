// app/api/reports/monthly/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

const MONTH_LABELS = [
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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get("months") || "12");

    const client = await clientPromise;
    const db = client.db();

    // Range: last N months (including current)
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1),
      1,
    );

    const agg = await db
      .collection("transactions")
      .aggregate([
        {
          $match: {
            userId: session.user.id,
            date: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            total: { $sum: "$price" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray();

    // Build a full N-month series (fill missing with 0)
    const result: {
      month: string;
      label: string;
      total: number;
      count: number;
    }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1;

      const found = agg.find(
        (a) => a._id.year === year && a._id.month === monthNum,
      );

      result.push({
        month: `${year}-${String(monthNum).padStart(2, "0")}`,
        label: `${MONTH_LABELS[d.getMonth()]} ${year}`,
        total: found?.total || 0,
        count: found?.count || 0,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
