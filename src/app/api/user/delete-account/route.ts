import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("athletix");
    const users = db.collection("users");
    const accounts = db.collection("accounts");
    const sessions = db.collection("sessions");
    const verificationTokens = db.collection("verificationTokens");

    // Znajdź użytkownika, żeby uzyskać jego ID
    const user = await users.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Usuń wszystkie powiązane dane użytkownika w odpowiedniej kolejności:

    // 1. Usuń wszystkie sesje użytkownika
    await sessions.deleteMany({
      userId: user._id,
    });

    // 2. Usuń wszystkie powiązane konta OAuth (Google, etc.)
    await accounts.deleteMany({
      userId: user._id,
    });

    // 3. Usuń tokeny weryfikacyjne powiązane z emailem użytkownika
    await verificationTokens.deleteMany({
      identifier: session.user.email,
    });

    // 4. Na końcu usuń samego użytkownika
    const result = await users.deleteOne({
      email: session.user.email,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
