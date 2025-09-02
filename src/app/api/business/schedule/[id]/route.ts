import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
    const id = new ObjectId(params.id);
    const body = await request.json();
    const update: any = { $set: { updatedAt: new Date() } };
    ["title", "coach", "room", "capacity"].forEach((k) => {
      if (body[k] !== undefined) update.$set[k] = body[k];
    });
    if (body.start) update.$set.start = new Date(body.start);
    if (body.end) update.$set.end = new Date(body.end);
    await db.collection("schedule_events").updateOne({ _id: id }, update);
    const event = await db.collection("schedule_events").findOne({ _id: id });
    return NextResponse.json({
      event: { ...event, id: event?._id?.toString?.() },
    });
  } catch (err) {
    console.error("Schedule PATCH error", err);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const client = await clientPromise;
    const db = client.db();
    const id = new ObjectId(params.id);
    await db.collection("schedule_events").deleteOne({ _id: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Schedule DELETE error", err);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
