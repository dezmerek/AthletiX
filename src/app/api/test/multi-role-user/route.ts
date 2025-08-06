import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Test endpoint to set current user with multiple roles
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Set current user with all three roles for testing
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          role: ["user", "professional", "admin"], // All three roles
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: "User roles updated successfully",
      roles: ["user", "professional", "admin"],
    });
  } catch (error) {
    console.error("Error updating user roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Reset to single role
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Reset current user to single role
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          role: "user", // Single role
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: "User roles reset to single role",
      role: "user",
    });
  } catch (error) {
    console.error("Error resetting user roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
