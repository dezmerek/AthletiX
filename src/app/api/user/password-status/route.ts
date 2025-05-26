import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("athletix");
    const users = db.collection("users");

    const user = await users.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sprawdź czy użytkownik ma ustawione hasło
    const hasPassword = Boolean(user.password);

    return NextResponse.json({
      hasPassword,
    });
  } catch (error) {
    console.error("Error checking password status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
