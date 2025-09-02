import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const client = await clientPromise;
    const db = client.db();
    const business = await db
      .collection("businesses")
      .findOne({
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
    const reqs = await db
      .collection("employee_requests")
      .find({ businessId: business._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json({
      requests: reqs.map((r: any) => ({
        id: r._id.toString(),
        type: r.type,
        payload: r.payload,
        status: r.status,
        createdAt: r.createdAt?.toISOString?.(),
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const client = await clientPromise;
    const db = client.db();
    const business = await db
      .collection("businesses")
      .findOne({
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
    const { type, payload } = await request.json();
    if (!type)
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    const doc = {
      businessId: business._id,
      userId: new ObjectId(session.user.id),
      type,
      payload: payload || {},
      status: "pending",
      createdAt: new Date(),
    };
    const res = await db.collection("employee_requests").insertOne(doc);
    return NextResponse.json(
      {
        id: res.insertedId,
        request: { ...doc, id: res.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
