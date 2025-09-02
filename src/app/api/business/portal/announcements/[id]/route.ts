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
    const { title, body } = await request.json();
    const update: any = { $set: { updatedAt: new Date() } };
    if (title !== undefined) update.$set.title = title;
    if (body !== undefined) update.$set.body = body;
    await db.collection("announcements").updateOne({ _id: id }, update);
    const a = await db.collection("announcements").findOne({ _id: id });
    return NextResponse.json({
      announcement: { ...a, id: a?._id?.toString?.() },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const client = await clientPromise;
    const db = client.db();
    const id = new ObjectId(params.id);
    await db.collection("announcements").deleteOne({ _id: id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
