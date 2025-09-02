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

    const now = new Date();
    const ann = [
      {
        businessId: business._id,
        title: "Nowy grafik na przyszły miesiąc",
        body: "Proszę o potwierdzenie dostępności do 28-go.",
        date: now,
        author: session.user.name || session.user.email,
        createdAt: now,
      },
      {
        businessId: business._id,
        title: "Szkolenie BHP",
        body: "05.09 o 10:00 w sali konferencyjnej. Obecność obowiązkowa.",
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        author: "Dział HR",
        createdAt: now,
      },
      {
        businessId: business._id,
        title: "Nowy sprzęt w siłowni",
        body: "Dotarły nowe bieżnie i hantle – zapraszamy do testów.",
        date: now,
        author: "Administracja",
        createdAt: now,
      },
    ];

    const res = await db.collection("announcements").insertMany(ann);
    return NextResponse.json({ inserted: res.insertedCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to seed announcements" },
      { status: 500 }
    );
  }
}
