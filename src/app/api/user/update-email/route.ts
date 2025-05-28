import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();

    // Walidacja emaila
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required and must be a string" },
        { status: 400 }
      );
    }

    // Walidacja formatu emaila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Sanityzacja emaila
    const sanitizedEmail = email.trim().toLowerCase();

    // Sprawdź czy nowy email jest taki sam jak obecny
    if (sanitizedEmail === session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "New email is the same as current email" },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db();

    // Znajdź użytkownika w bazie danych
    const currentUser = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id),
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sprawdź czy użytkownik ma konto Google
    const googleAccount = await db.collection("accounts").findOne({
      userId: new ObjectId(session.user.id),
      provider: "google",
    });

    // Jeśli użytkownik ma tylko konto Google (bez hasła), wymagaj ustawienia hasła
    if (googleAccount && !currentUser.password) {
      return NextResponse.json(
        {
          error: "You must set a password before changing your email address",
          code: "PASSWORD_REQUIRED_FOR_GOOGLE_ACCOUNT",
        },
        { status: 400 }
      );
    }

    // Sprawdź czy email nie jest już używany przez inne konto
    const existingUser = await db.collection("users").findOne({
      email: sanitizedEmail,
      _id: { $ne: new ObjectId(session.user.id) },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email address is already used by another account" },
        { status: 409 }
      );
    }

    // Aktualizacja emaila w bazie danych
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          email: sanitizedEmail,
          emailVerified: null, // Reset weryfikacji emaila po zmianie
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Zaktualizuj też wszystkie konta społecznościowe powiązane z tym użytkownikiem
    await db.collection("accounts").updateMany(
      { userId: new ObjectId(session.user.id) },
      {
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Email updated successfully",
      email: sanitizedEmail,
    });
  } catch (error) {
    console.error("Error updating user email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
