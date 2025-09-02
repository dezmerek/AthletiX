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

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from")
      ? new Date(searchParams.get("from") as string)
      : new Date(Date.now() - 7 * 86400000);
    const to = searchParams.get("to")
      ? new Date(searchParams.get("to") as string)
      : new Date(Date.now() + 14 * 86400000);

    const docs = await db
      .collection("schedule_events")
      .find({
        businessId: business._id,
        start: { $gte: from },
        end: { $lte: to },
      })
      .sort({ start: 1 })
      .toArray();

    const events = docs.map((d: any) => ({
      id: d._id.toString(),
      title: d.title,
      coach: d.coach,
      room: d.room,
      start: new Date(d.start).toISOString(),
      end: new Date(d.end).toISOString(),
      capacity: d.capacity ?? 0,
    }));

    return NextResponse.json({ events });
  } catch (err) {
    console.error("Schedule GET error", err);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
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

    const { title, coach, room, start, end, capacity } = await request.json();
    if (!title || !start || !end)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const doc = {
      businessId: business._id,
      title,
      coach: coach || null,
      room: room || null,
      start: new Date(start),
      end: new Date(end),
      capacity: capacity ?? 0,
      createdAt: new Date(),
    };

    const res = await db.collection("schedule_events").insertOne(doc);
    return NextResponse.json(
      { id: res.insertedId, event: { ...doc, id: res.insertedId.toString() } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Schedule POST error", err);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
