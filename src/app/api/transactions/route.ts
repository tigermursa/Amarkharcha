// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: list transactions (filter by periodId optional)
// export async function GET(request: NextRequest) {
//   try {
//     const session = await auth.api.getSession({ headers: request.headers });
//     if (!session) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "20");
//     const periodId = searchParams.get("periodId");
//     const categoryId = searchParams.get("categoryId");

//     const client = await clientPromise;
//     const db = client.db();

//     const filter: any = { userId: session.user.id };
//     if (periodId) filter.periodId = periodId;
//     if (categoryId) filter.categoryId = categoryId;

//     const [transactions, total] = await Promise.all([
//       db
//         .collection("transactions")
//         .find(filter)
//         .sort({ date: -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .toArray(),
//       db.collection("transactions").countDocuments(filter),
//     ]);

//     return NextResponse.json({
//       transactions: transactions.map((t) => ({
//         ...t,
//         _id: t._id.toString(),
//       })),
//       total,
//     });
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }
// GET: list transactions with pagination, sort, and filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
    );
    const sort = searchParams.get("sort") || "date_desc";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");
    const periodId = searchParams.get("periodId");

    const client = await clientPromise;
    const db = client.db();

    const filter: any = { userId: session.user.id };

    if (categoryId) filter.categoryId = categoryId;
    if (periodId) filter.periodId = periodId;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        filter.date.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        filter.date.$lte = e;
      }
    }

    // Sort map
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      created_desc: { createdAt: -1 }, // 👈 new: last added first
      date_desc: { date: -1, createdAt: -1 },
      date_asc: { date: 1, createdAt: 1 },
      price_desc: { price: -1, date: -1 },
      price_asc: { price: 1, date: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.created_desc;

    const [transactions, total] = await Promise.all([
      db
        .collection("transactions")
        .find(filter)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection("transactions").countDocuments(filter),
    ]);

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        ...t,
        _id: t._id.toString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
// POST: create expense (auto-attach to active period if not provided)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, item, quantity, unit, price, categoryId, note, periodId } =
      body;

    if (!item || !price || !categoryId || !date) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    // Resolve period: provided or active
    let resolvedPeriodId: string | null = periodId || null;
    let resolvedPeriodName: string | null = null;

    if (!resolvedPeriodId) {
      const activePeriod = await db
        .collection("periods")
        .findOne({ userId, isActive: true });
      if (!activePeriod) {
        return NextResponse.json(
          { error: "No active period. Please create one first." },
          { status: 400 },
        );
      }
      resolvedPeriodId = activePeriod._id.toString();
      resolvedPeriodName = activePeriod.name;
    } else {
      const period = await db.collection("periods").findOne({
        _id: new ObjectId(resolvedPeriodId),
        userId,
      });
      if (!period) {
        return NextResponse.json(
          { error: "Period not found" },
          { status: 404 },
        );
      }
      resolvedPeriodName = period.name;
    }

    const category = await db.collection("categories").findOne({
      _id: new ObjectId(categoryId),
      userId,
    });

    const transaction = {
      userId,
      periodId: resolvedPeriodId,
      periodName: resolvedPeriodName,
      date: new Date(date),
      item,
      quantity: quantity ?? null,
      unit: unit ?? null,
      price,
      categoryId,
      categoryName: category?.name || "Unknown",
      categoryIcon: category?.icon || "FaEllipsisH",
      note: note || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("transactions").insertOne(transaction);

    return NextResponse.json(
      { ...transaction, _id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
