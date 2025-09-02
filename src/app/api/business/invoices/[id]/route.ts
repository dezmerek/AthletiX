import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();
    const _id = new ObjectId(params.id);

    const invoice = await db.collection("invoices").findOne({ _id });
    if (!invoice)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();
    const _id = new ObjectId(params.id);
    const body = await request.json();

    const update: any = { $set: { updatedAt: new Date() } };
    if (body.status) update.$set.status = body.status;
    if (body.items) {
      update.$set.items = body.items;
      update.$set.total = body.items.reduce(
        (sum: number, it: any) =>
          sum + (Number(it.quantity) * Number(it.unitPrice) || 0),
        0
      );
    }
    if (body.clientName) update.$set.clientName = body.clientName;
    if (body.clientEmail !== undefined)
      update.$set.clientEmail = body.clientEmail;
    if (body.dueDate) update.$set.dueDate = new Date(body.dueDate);

    await db.collection("invoices").updateOne({ _id }, update);

    const invoice = await db.collection("invoices").findOne({ _id });
    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}
