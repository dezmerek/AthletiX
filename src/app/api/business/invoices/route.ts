import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const business = await db.collection("businesses").findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { "staff.userId": session.user.id },
      ],
    });
    if (!business)
      return NextResponse.json(
        { error: "No business found for user" },
        { status: 404 }
      );

    const invoices = await db
      .collection("invoices")
      .find({ businessId: business._id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ invoices });
  } catch (err) {
    console.error("Error fetching invoices:", err);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const business = await db.collection("businesses").findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { "staff.userId": session.user.id },
      ],
    });
    if (!business)
      return NextResponse.json(
        { error: "No business found for user" },
        { status: 404 }
      );

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
      .countDocuments({ businessId: business._id });
    const invoiceNumber = `FV/${new Date().getFullYear()}/${String(
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
      businessId: business._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("invoices").insertOne(invoice);

    return NextResponse.json({
      success: true,
      invoice: { ...invoice, _id: result.insertedId },
    });
  } catch (err) {
    console.error("Error creating invoice:", err);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
