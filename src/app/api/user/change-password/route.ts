import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Walidacja nowego hasła
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        {
          error: "New password must be at least 6 characters long",
          code: "PASSWORD_TOO_SHORT",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("athletix");
    const users = db.collection("users");

    // Znajdź użytkownika
    const user = await users.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Jeśli użytkownik ma już hasło, sprawdź obecne hasło
    if (user.password) {
      if (!currentPassword) {
        return NextResponse.json(
          {
            error: "Current password is required",
            code: "CURRENT_PASSWORD_REQUIRED",
          },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          {
            error: "Current password is incorrect",
            code: "CURRENT_PASSWORD_INCORRECT",
          },
          { status: 400 }
        );
      }
    }

    // Hashuj nowe hasło
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Aktualizuj hasło w bazie danych
    const result = await users.updateOne(
      { email: session.user.email },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: user.password
        ? "Password changed successfully"
        : "Password set successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
