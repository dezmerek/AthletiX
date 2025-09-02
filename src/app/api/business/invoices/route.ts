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

    // Find business for user
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
      .sort({ issueDate: -1 })
      .toArray();

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
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
    const now = new Date();
    const newInvoice = {
      businessId: business._id,
      number:
        body.number ||
        `INV-${now.getFullYear()}-${Math.floor(Math.random() * 100000)
          .toString()
          .padStart(5, "0")}`,
      issueDate: body.issueDate ? new Date(body.issueDate) : now,
      dueDate: body.dueDate
        ? new Date(body.dueDate)
        : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      clientName: body.clientName || "Klient",
      clientEmail: body.clientEmail || null,
      currency: body.currency || "PLN",
      status: body.status || "draft",
      items: Array.isArray(body.items) ? body.items : [],
      total: Array.isArray(body.items)
        ? body.items.reduce(
            (sum: number, it: any) =>
              sum + (Number(it.quantity) * Number(it.unitPrice) || 0),
            0
          )
        : Number(body.total) || 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("invoices").insertOne(newInvoice);
    return NextResponse.json(
      {
        id: result.insertedId,
        invoice: { _id: result.insertedId, ...newInvoice },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
