import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(_request: NextRequest) {
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

    const today = new Date();
    const mk = (d: Date, hh: number, mm: number) => {
      const s = new Date(d);
      s.setHours(hh, mm, 0, 0);
      const e = new Date(s);
      e.setMinutes(e.getMinutes() + 60);
      return { start: s, end: e };
    };
    const tmr = new Date(Date.now() + 86400000);

    const events = [
      {
        title: "CrossFit – grupa zaawansowana",
        coach: "Agnieszka Nowak",
        room: "Sala A",
        ...mk(today, 17, 0),
        capacity: 16,
      },
      {
        title: "Joga – relaksacyjna",
        coach: "Piotr Zieliński",
        room: "Sala B",
        ...mk(today, 18, 30),
        capacity: 20,
      },
      {
        title: "Trening obwodowy",
        coach: "Jan Kowalski",
        room: "Sala C",
        ...mk(tmr, 7, 30),
        capacity: 12,
      },
    ].map((e) => ({ businessId: business._id, ...e, createdAt: new Date() }));

    const res = await db.collection("schedule_events").insertMany(events);
    return NextResponse.json({ inserted: res.insertedCount });
  } catch (err) {
    console.error("Schedule seed error", err);
    return NextResponse.json(
      { error: "Failed to seed schedule" },
      { status: 500 }
    );
  }
}
