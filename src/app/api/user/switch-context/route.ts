import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activeContext } = await request.json();

    if (!activeContext || !["user", "professional"].includes(activeContext)) {
      return NextResponse.json(
        { error: "Invalid context. Must be 'user' or 'professional'" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user and check permissions
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user can switch to professional context
    if (activeContext === "professional") {
      const roles = Array.isArray(user.role) ? user.role : [user.role];
      const canActAsProfessional =
        roles.includes("professional") || roles.includes("admin");

      if (!canActAsProfessional) {
        return NextResponse.json(
          {
            error:
              "You don't have permission to switch to professional context",
          },
          { status: 403 }
        );
      }
    }

    // Update user's active context
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(session.user.id) },
        { $set: { activeContext: activeContext } }
      );

    return NextResponse.json({
      success: true,
      activeContext: activeContext,
    });
  } catch (error) {
    console.error("Error switching context:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
