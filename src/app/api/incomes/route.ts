// src/app/api/incomes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: list incomes
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
    );
    const periodId = searchParams.get("periodId");
    const sort = searchParams.get("sort") || "created_desc";

    const client = await clientPromise;
    const db = client.db();
    const filter: any = { userId: session.user.id };
    if (periodId) filter.periodId = periodId;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      created_desc: { createdAt: -1 },
      date_desc: { date: -1, createdAt: -1 },
      date_asc: { date: 1, createdAt: 1 },
      amount_desc: { amount: -1, date: -1 },
      amount_asc: { amount: 1, date: -1 },
    };

    const [incomes, total, sumAgg] = await Promise.all([
      db
        .collection("incomes")
        .find(filter)
        .sort(sortMap[sort] || sortMap.created_desc)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection("incomes").countDocuments(filter),
      db
        .collection("incomes")
        .aggregate([
          { $match: filter },
          { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ])
        .toArray(),
    ]);

    return NextResponse.json({
      incomes: incomes.map((i) => ({ ...i, _id: i._id.toString() })),
      total,
      totalAmount: sumAgg[0]?.totalAmount || 0,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching incomes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: create income
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { date, source, amount, note, periodId } = await request.json();

    if (!date || !source?.trim() || !amount) {
      return NextResponse.json(
        { error: "Date, source and amount are required" },
        { status: 400 },
      );
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return NextResponse.json(
        { error: "Amount must be positive" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    let resolvedPeriodId = periodId || null;
    let resolvedPeriodName: string | null = null;

    if (!resolvedPeriodId) {
      const active = await db
        .collection("periods")
        .findOne({ userId, isActive: true });
      if (!active) {
        return NextResponse.json(
          { error: "No active period. Please create one first." },
          { status: 400 },
        );
      }
      resolvedPeriodId = active._id.toString();
      resolvedPeriodName = active.name;
    } else {
      const p = await db.collection("periods").findOne({
        _id: new ObjectId(resolvedPeriodId),
        userId,
      });
      if (!p)
        return NextResponse.json(
          { error: "Period not found" },
          { status: 404 },
        );
      resolvedPeriodName = p.name;
    }

    const now = new Date();
    const income = {
      userId,
      periodId: resolvedPeriodId,
      periodName: resolvedPeriodName,
      date: new Date(date),
      source: source.trim(),
      amount: amt,
      note: (note || "").trim(),
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("incomes").insertOne(income);
    return NextResponse.json(
      { ...income, _id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating income:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
