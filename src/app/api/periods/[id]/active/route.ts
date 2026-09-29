// src/app/api/periods/[id]/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PATCH: mark this period as active
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    const target = await db.collection("periods").findOne({
      _id: new ObjectId(id),
      userId,
    });

    if (!target) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    await db
      .collection("periods")
      .updateMany({ userId }, { $set: { isActive: false } });

    await db
      .collection("periods")
      .updateOne({ _id: new ObjectId(id) }, { $set: { isActive: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting active period:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
