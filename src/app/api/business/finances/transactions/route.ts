import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user's business
    const business = await db.collection("businesses").findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { "staff.userId": session.user.id },
      ],
    });
    if (!business) {
      return NextResponse.json(
        { error: "No business found for user" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const now = new Date();
    const from = new Date(now);
    if (period === "7d") from.setDate(now.getDate() - 7);
    else if (period === "30d") from.setDate(now.getDate() - 30);
    else if (period === "90d") from.setDate(now.getDate() - 90);
    else if (period === "1y") from.setFullYear(now.getFullYear() - 1);
    else from.setDate(now.getDate() - 30);

    const filter: any = {
      businessId: business._id,
      date: { $gte: from },
    };

    const docs = await db
      .collection("transactions")
      .find(filter)
      .sort({ date: -1 })
      .limit(200)
      .toArray();

    const transactions = docs.map((d: any) => ({
      id: d._id?.toString(),
      type: d.type,
      amount: d.amount,
      currency: d.currency || "PLN",
      description: d.description,
      date: new Date(d.date).toISOString(),
      status: d.status || "completed",
      category: d.category || "other",
      memberId: d.memberId?.toString?.() || undefined,
      memberName: d.memberName || undefined,
    }));

    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
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

    const client = await clientPromise;
    const db = client.db();

    const business = await db.collection("businesses").findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { "staff.userId": session.user.id },
      ],
    });
    if (!business) {
      return NextResponse.json(
        { error: "No business found for user" },
        { status: 404 }
      );
    }

    const {
      type,
      amount,
      currency = "PLN",
      description,
      date,
      status = "completed",
      category,
      memberId,
      memberName,
    } = await request.json();

    if (!type || typeof amount !== "number" || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const doc: any = {
      businessId: business._id,
      type,
      amount,
      currency,
      description,
      date: date ? new Date(date) : new Date(),
      status,
      category: category || "other",
      createdAt: new Date(),
    };
    if (memberId) doc.memberId = new ObjectId(memberId);
    if (memberName) doc.memberName = memberName;

    const res = await db.collection("transactions").insertOne(doc);
    return NextResponse.json(
      {
        id: res.insertedId,
        transaction: { ...doc, id: res.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating transaction:", err);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
