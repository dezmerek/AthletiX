import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const business = await db.collection("businesses").findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { "staff.userId": session.user.id },
      ],
    });
    if (!business)
      return NextResponse.json(
        { error: "No business found for user" },
        { status: 404 }
      );

    // Rank top members by total subscription payments in last 90 days
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const agg = await db
      .collection("transactions")
      .aggregate([
        {
          $match: {
            businessId: business._id,
            date: { $gte: since },
            type: { $in: ["subscription", "income"] },
          },
        },
        {
          $group: {
            _id: "$memberId",
            revenue: { $sum: { $ifNull: ["$amount", 0] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    const ids = agg.map((a: any) => a._id).filter(Boolean);
    const members = ids.length
      ? await db
          .collection("members")
          .find({ _id: { $in: ids } })
          .project({ name: 1 })
          .toArray()
      : [];
    const idToName = new Map(
      members.map((m: any) => [m._id, m.name || "Członek"])
    );

    const topPerformers = agg.map((a: any) => ({
      id: String(a._id || "unknown"),
      name: idToName.get(a._id) || "Członek",
      revenue: a.revenue || 0,
    }));

    // Usuń fallback - teraz dane będą pochodzić z bazy

    return NextResponse.json({ topPerformers });
  } catch (err) {
    console.error("Error fetching top performers:", err);
    return NextResponse.json(
      { error: "Failed to fetch top performers" },
      { status: 500 }
    );
  }
}
