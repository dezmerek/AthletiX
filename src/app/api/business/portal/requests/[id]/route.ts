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
    const { status } = await request.json();
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await db
      .collection("employee_requests")
      .updateOne({ _id: id }, { $set: { status, updatedAt: new Date() } });
    const r = await db.collection("employee_requests").findOne({ _id: id });
    return NextResponse.json({ request: { ...r, id: r?._id?.toString?.() } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
