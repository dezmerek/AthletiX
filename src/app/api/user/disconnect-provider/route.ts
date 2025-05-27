import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
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

    // Sprawdź czy użytkownik ma hasło (aby mógł się logować po rozłączeniu)
    if (!user.password && provider === "google") {
      return NextResponse.json(
        {
          error:
            "Cannot disconnect Google account without setting a password first",
          code: "PASSWORD_REQUIRED",
        },
        { status: 400 }
      );
    }

    // Usuń połączenie z providerem
    const result = await db.collection("accounts").deleteOne({
      userId: user._id,
      provider: provider,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Provider connection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${provider} account disconnected successfully`,
    });
  } catch (error) {
    console.error("Error disconnecting provider:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
