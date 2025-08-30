import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoose();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] });
    }

    const searchRegex = new RegExp(query.trim(), "i");

    const users = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
      email: { $ne: session.user.email }, // Exclude current user
    })
      .select("name email")
      .limit(10);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
