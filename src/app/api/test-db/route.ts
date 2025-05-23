import { NextResponse } from "next/server";
import client from "@/lib/mongodb";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mongoClient = await client;
    await mongoClient.connect();
    const db = mongoClient.db();

    // Pobierz dane użytkownika
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { password: 0 } } // Nie zwracamy hasła
    );

    // Pobierz konta połączone (np. Google)
    const accounts = await db
      .collection("accounts")
      .find({ userId: user?._id.toString() })
      .toArray();

    return NextResponse.json({
      user,
      accounts,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
