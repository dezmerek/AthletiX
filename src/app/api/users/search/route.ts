import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sprawdź czy użytkownik jest profesjonalistą
    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    if (!userRoles.includes("professional") && !userRoles.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Wyszukaj użytkowników po imieniu, nazwisku lub email
    const users = await db
      .collection("users")
      .find(
        {
          $and: [
            { _id: { $ne: new ObjectId(session.user.id) } }, // Wyklucz siebie
            {
              $or: [
                { name: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
              ],
            },
          ],
        },
        {
          projection: {
            _id: 1,
            name: 1,
            email: 1,
            image: 1,
            role: 1,
            createdAt: 1,
          },
        }
      )
      .limit(limit)
      .toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
