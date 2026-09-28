// app/api/periods/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

// GET: list periods with totals
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    const periods = await db
      .collection("periods")
      .find({ userId })
      .sort({ startDate: -1 })
      .toArray();

    // Aggregate totals per period in one pass
    const agg = await db
      .collection("transactions")
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$periodId",
            total: { $sum: "$price" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const totalsMap = new Map(
      agg.map((a) => [a._id as string, { total: a.total, count: a.count }]),
    );

    const result = periods.map((p) => {
      const id = p._id.toString();
      const totals = totalsMap.get(id) || { total: 0, count: 0 };
      return {
        _id: id,
        name: p.name,
        startDate: p.startDate,
        endDate: p.endDate,
        isActive: p.isActive,
        total: totals.total,
        count: totals.count,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching periods:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: create a new period
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, startDate, endDate, setActive } = await request.json();

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Name, start date and end date are required" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    const existingCount = await db
      .collection("periods")
      .countDocuments({ userId });

    // First period → always active. Else respect setActive flag.
    const shouldBeActive = existingCount === 0 || setActive === true;

    if (shouldBeActive) {
      await db
        .collection("periods")
        .updateMany({ userId }, { $set: { isActive: false } });
    }

    const period = {
      userId,
      name: name.trim(),
      startDate: start,
      endDate: end,
      isActive: shouldBeActive,
      createdAt: new Date(),
    };

    const result = await db.collection("periods").insertOne(period);

    return NextResponse.json(
      { ...period, _id: result.insertedId.toString(), total: 0, count: 0 },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating period:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
