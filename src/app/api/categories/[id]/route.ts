// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PUT: update a custom category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, icon } = await request.json();
    if (!name || !icon) {
      return NextResponse.json(
        { error: "Name and icon are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const category = await db.collection("categories").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (category.isDefault) {
      return NextResponse.json(
        { error: "Default categories cannot be edited" },
        { status: 403 },
      );
    }

    const duplicate = await db.collection("categories").findOne({
      userId: session.user.id,
      name: { $regex: `^${name}$`, $options: "i" },
      _id: { $ne: new ObjectId(id) },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 },
      );
    }

    await db
      .collection("categories")
      .updateOne({ _id: new ObjectId(id) }, { $set: { name, icon } });

    await db
      .collection("transactions")
      .updateMany(
        { userId: session.user.id, categoryId: id },
        { $set: { categoryName: name, categoryIcon: icon } },
      );

    return NextResponse.json({ success: true, name, icon });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE: remove a custom category
export async function DELETE(
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

    const category = await db.collection("categories").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (category.isDefault) {
      return NextResponse.json(
        { error: "Default categories cannot be deleted" },
        { status: 403 },
      );
    }

    const usageCount = await db.collection("transactions").countDocuments({
      userId: session.user.id,
      categoryId: id,
    });

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: ${usageCount} transaction(s) use this category`,
        },
        { status: 409 },
      );
    }

    await db.collection("categories").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
