import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, roles, activeContext } = await request.json();

    // Input validation
    if (!email || !roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: "Email and roles are required" },
        { status: 400 }
      );
    }

    // Validate all roles
    const validRoles = ["user", "professional"];
    if (!roles.every(role => validRoles.includes(role))) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate activeContext
    if (!validRoles.includes(activeContext)) {
      return NextResponse.json({ error: "Invalid active context" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Update user roles and set active context
    const result = await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          role: roles,
          activeContext: activeContext,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Role updated successfully",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
