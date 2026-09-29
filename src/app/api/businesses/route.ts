// src/app/api/businesses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

// GET: list all businesses with aggregated profit totals
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    const [businesses, profitAgg] = await Promise.all([
      db
        .collection("businesses")
        .find({ userId })
        .sort({ investedDate: -1 })
        .toArray(),
      db
        .collection("profits")
        .aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: "$businessId",
              totalProfit: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
    ]);

    const map = new Map(
      profitAgg.map((p) => [
        p._id as string,
        { totalProfit: p.totalProfit, count: p.count },
      ]),
    );

    return NextResponse.json(
      businesses.map((b) => {
        const id = b._id.toString();
        const agg = map.get(id) || { totalProfit: 0, count: 0 };
        return {
          ...b,
          _id: id,
          totalProfit: agg.totalProfit,
          profitCount: agg.count,
        };
      }),
    );
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: create a business
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, personName, amount, investedDate } = await request.json();

    if (!name?.trim() || !personName?.trim() || !investedDate) {
      return NextResponse.json(
        { error: "Business name, person name and date are required" },
        { status: 400 },
      );
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const now = new Date();
    const business = {
      userId: session.user.id,
      name: name.trim(),
      personName: personName.trim(),
      amount: amt,
      investedDate: new Date(investedDate),
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("businesses").insertOne(business);

    return NextResponse.json(
      {
        ...business,
        _id: result.insertedId.toString(),
        totalProfit: 0,
        profitCount: 0,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
