import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import User from "@/models/User";
import mongoose from "mongoose";

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
      _id: { $ne: session.user.id }, // Exclude current user
    })
      .select("_id name email")
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
