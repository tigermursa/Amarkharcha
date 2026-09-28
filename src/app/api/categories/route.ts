// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

// GET: ইউজারের সব ক্যাটাগরি
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

    const categories = await db
      .collection("categories")
      .find({ userId: session.user.id })
      .sort({ isDefault: -1, name: 1 })
      .toArray();

    return NextResponse.json(
      categories.map((c) => ({ ...c, _id: c._id.toString() })),
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: নতুন ক্যাটাগরি
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon } = body;

    if (!name || !icon) {
      return NextResponse.json(
        { error: "Name and icon are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // চেক করুন একই নামের ক্যাটাগরি আছে কি না
    const existing = await db.collection("categories").findOne({
      userId: session.user.id,
      name,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 },
      );
    }

    const category = {
      userId: session.user.id,
      name,
      icon,
      isDefault: false,
      createdAt: new Date(),
    };

    const result = await db.collection("categories").insertOne(category);

    return NextResponse.json(
      { ...category, _id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
