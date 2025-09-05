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

    const now = new Date();
    const last30 = new Date(now);
    last30.setDate(now.getDate() - 30);

    const [txAggAll, txAgg30d, activeMembers, totalMembers] = await Promise.all(
      [
        db
          .collection("transactions")
          .aggregate([
            { $match: { businessId: business._id } },
            {
              $group: {
                _id: "$type",
                amount: { $sum: { $ifNull: ["$amount", 0] } },
              },
            },
          ])
          .toArray(),
        db
          .collection("transactions")
          .aggregate([
            { $match: { businessId: business._id, date: { $gte: last30 } } },
            {
              $group: {
                _id: "$type",
                amount: { $sum: { $ifNull: ["$amount", 0] } },
              },
            },
          ])
          .toArray(),
        db
          .collection("members")
          .countDocuments({ businessId: business._id, status: "active" })
          .catch(() => 0),
        db
          .collection("members")
          .countDocuments({ businessId: business._id })
          .catch(() => 0),
      ]
    );

    const sumByType = Object.fromEntries(
      txAggAll.map((r: any) => [r._id, r.amount])
    );
    const sumByType30 = Object.fromEntries(
      txAgg30d.map((r: any) => [r._id, r.amount])
    );

    const totalRevenue =
      (sumByType["income"] || 0) + (sumByType["subscription"] || 0);
    const totalExpenses = sumByType["expense"] || 0;
    const monthlyRevenue =
      (sumByType30["income"] || 0) + (sumByType30["subscription"] || 0);
    const staffCount = Array.isArray((business as any).staff)
      ? (business as any).staff.length
      : 0;

    // Retention as active / total (fallback 0/0 -> 0)
    const retentionRate = totalMembers
      ? Math.round((activeMembers / totalMembers) * 100)
      : 0;

    // Avg visits per member not tracked yet; placeholder 0 based on lack of attendance data
    const avgVisitPerMember = 0;

    return NextResponse.json({
      metrics: {
        totalRevenue,
        monthlyRevenue,
        activeMembers,
        staffCount,
        retentionRate,
        avgVisitPerMember,
        totalExpenses,
        averageRevenuePerMember:
          activeMembers > 0 ? Math.round(totalRevenue / activeMembers) : 0,
      },
    });
  } catch (err) {
    console.error("Error fetching business metrics:", err);
    return NextResponse.json(
      { error: "Failed to fetch business metrics" },
      { status: 500 }
    );
  }
}
