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
    const ann = await db
      .collection("announcements")
      .find({ businessId: business._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return NextResponse.json({
      announcements: ann.map((a: any) => ({
        id: a._id.toString(),
        title: a.title,
        body: a.body,
        date: a.date?.toISOString?.() || a.createdAt?.toISOString?.(),
        author: a.author || "",
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
    const { title, body } = await request.json();
    if (!title)
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    const doc = {
      businessId: business._id,
      title,
      body: body || "",
      date: new Date(),
      author: session.user.name || session.user.email,
      createdAt: new Date(),
    };
    const res = await db.collection("announcements").insertOne(doc);
    return NextResponse.json(
      {
        id: res.insertedId,
        announcement: { ...doc, id: res.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
