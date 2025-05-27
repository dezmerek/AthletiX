import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Znajdź użytkownika w bazie danych
    const user = await db.collection("users").findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found:", user._id, typeof user._id);

    // Sprawdź czy użytkownik ma połączone konto Google
    // Próbuj różne formaty userId - NextAuth może zapisywać jako ObjectId lub string
    const userIdAsString = user._id.toString();
    const userIdAsObjectId = new ObjectId(userIdAsString);

    const googleAccount = await db.collection("accounts").findOne({
      $or: [
        { userId: user._id, provider: "google" },
        { userId: userIdAsString, provider: "google" },
        { userId: userIdAsObjectId, provider: "google" },
      ],
    });

    console.log("Google account search with userId variants:", {
      original: user._id,
      string: userIdAsString,
      objectId: userIdAsObjectId,
    });
    console.log("Google account found:", googleAccount);

    return NextResponse.json({
      isConnected: Boolean(googleAccount),
    });
  } catch (error) {
    console.error("Error checking Google status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
