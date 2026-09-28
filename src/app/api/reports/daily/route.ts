// app/api/reports/daily/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

const MONTH_SHORT = [
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
    const days = parseInt(searchParams.get("days") || "30");

    const client = await clientPromise;
    const db = client.db();

    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - (days - 1),
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
              day: { $dayOfMonth: "$date" },
            },
            total: { $sum: "$price" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ])
      .toArray();

    const result: {
      date: string;
      label: string;
      total: number;
      count: number;
    }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const day = d.getDate();

      const found = agg.find(
        (a) => a._id.year === y && a._id.month === m && a._id.day === day,
      );

      result.push({
        date: `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        label: `${day} ${MONTH_SHORT[d.getMonth()]}`,
        total: found?.total || 0,
        count: found?.count || 0,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching daily report:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
