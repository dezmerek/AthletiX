import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has professional role or professional context
    const hasAccess =
      session.user.role === "professional" ||
      session.user.activeContext === "professional" ||
      (Array.isArray(session.user.role) &&
        session.user.role.includes("professional"));

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied - professional access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate ObjectId format
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const invoice = await db.collection("invoices").findOne({
      _id: new ObjectId(id),
      professionalId: new ObjectId(session.user.id),
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("Error fetching professional invoice:", err);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has professional role or professional context
    const hasAccess =
      session.user.role === "professional" ||
      session.user.activeContext === "professional" ||
      (Array.isArray(session.user.role) &&
        session.user.role.includes("professional"));

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied - professional access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate ObjectId format
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const result = await db.collection("invoices").updateOne(
      {
        _id: new ObjectId(id),
        professionalId: new ObjectId(session.user.id),
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating professional invoice:", err);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has professional role or professional context
    const hasAccess =
      session.user.role === "professional" ||
      session.user.activeContext === "professional" ||
      (Array.isArray(session.user.role) &&
        session.user.role.includes("professional"));

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied - professional access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate ObjectId format
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("invoices").deleteOne({
      _id: new ObjectId(id),
      professionalId: new ObjectId(session.user.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting professional invoice:", err);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
