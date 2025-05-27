import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { providerAccountId } = await request.json();

    if (!providerAccountId) {
      return NextResponse.json(
        { error: "Provider account ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Sprawdź czy to konto Google jest już połączone z innym użytkownikiem
    const existingGoogleAccount = await db.collection("accounts").findOne({
      provider: "google",
      providerAccountId: providerAccountId,
    });

    if (existingGoogleAccount) {
      // Sprawdź czy to konto Google jest połączone z innym użytkownikiem
      const existingUser = await db.collection("users").findOne({
        _id: existingGoogleAccount.userId,
      });

      if (
        existingUser &&
        existingUser.email?.toLowerCase() !== session.user.email?.toLowerCase()
      ) {
        return NextResponse.json({
          isAlreadyConnected: true,
          message:
            "This Google account is already connected to another user account",
        });
      }
    }

    return NextResponse.json({
      isAlreadyConnected: false,
    });
  } catch (error) {
    console.error("Error checking Google account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
