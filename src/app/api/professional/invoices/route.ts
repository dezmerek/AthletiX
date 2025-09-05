import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    console.log("Session:", session);

    if (!session?.user) {
      console.log("No session or user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User role:", session.user.role);

    // Check if user has professional role or professional context
    const hasAccess =
      session.user.role === "professional" ||
      session.user.activeContext === "professional" ||
      (Array.isArray(session.user.role) &&
        session.user.role.includes("professional"));

    if (!hasAccess) {
      console.log("User does not have professional access");
      return NextResponse.json(
        { error: "Access denied - professional access required" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    console.log("Fetching invoices for professional:", session.user.id);

    // Get invoices for this professional
    const invoices = await db
      .collection("invoices")
      .find({ professionalId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    console.log("Found invoices:", invoices.length);

    return NextResponse.json({ invoices });
  } catch (err) {
    console.error("Error fetching professional invoices:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch invoices",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const client = await clientPromise;
    const db = client.db();

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      amount,
      currency = "PLN",
      dueDate,
      description,
      items,
    } = body;

    // Generate invoice number
    const invoiceCount = await db
      .collection("invoices")
      .countDocuments({ professionalId: new ObjectId(session.user.id) });
    const invoiceNumber = `FV-PRO/${new Date().getFullYear()}/${String(
      invoiceCount + 1
    ).padStart(4, "0")}`;

    const invoice = {
      invoiceNumber,
      customerName,
      customerEmail,
      amount: parseFloat(amount),
      currency,
      status: "draft",
      dueDate: new Date(dueDate),
      issueDate: new Date(),
      description,
      items: items || [],
      professionalId: new ObjectId(session.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("invoices").insertOne(invoice);

    return NextResponse.json({
      success: true,
      invoice: { ...invoice, _id: result.insertedId },
    });
  } catch (err) {
    console.error("Error creating professional invoice:", err);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
