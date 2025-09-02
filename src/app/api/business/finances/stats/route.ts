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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const now = new Date();
    const from = new Date(now);
    if (period === "7d") from.setDate(now.getDate() - 7);
    else if (period === "30d") from.setDate(now.getDate() - 30);
    else if (period === "90d") from.setDate(now.getDate() - 90);
    else if (period === "1y") from.setFullYear(now.getFullYear() - 1);
    else from.setDate(now.getDate() - 30);

    const [txAgg, subsCount] = await Promise.all([
      db
        .collection("transactions")
        .aggregate([
          { $match: { businessId: business._id, date: { $gte: from } } },
          {
            $group: {
              _id: "$type",
              amount: { $sum: "$amount" },
            },
          },
        ])
        .toArray(),
      db
        .collection("subscriptions")
        .countDocuments({ businessId: business._id, status: "active" }),
    ]);

    const sumByType = Object.fromEntries(
      txAgg.map((r: any) => [r._id, r.amount])
    );
    const totalRevenue =
      (sumByType["income"] || 0) + (sumByType["subscription"] || 0);
    const totalExpenses = sumByType["expense"] || 0;
    const netProfit = totalRevenue - totalExpenses;

    // MRR: suma aktywnych subskrypcji amount (jeśli nie ma, fallback 0)
    const mrrDocs = await db
      .collection("subscriptions")
      .aggregate([
        {
          $match: {
            businessId: business._id,
            status: "active",
            billingCycle: { $in: ["monthly", null] },
          },
        },
        {
          $group: { _id: null, amount: { $sum: { $ifNull: ["$amount", 0] } } },
        },
      ])
      .toArray();
    const monthlyRecurringRevenue = mrrDocs[0]?.amount || 0;

    // growthRate placeholder (docelowo porównanie z poprzednim okresem)
    const growthRate = 0;

    const stats = {
      totalRevenue,
      totalExpenses,
      netProfit,
      activeSubscriptions: subsCount,
      monthlyRecurringRevenue,
      averageRevenuePerMember: subsCount
        ? Math.round((totalRevenue / subsCount) * 100) / 100
        : 0,
      growthRate,
    };

    return NextResponse.json({ stats });
  } catch (err) {
    console.error("Error fetching financial stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch financial stats" },
      { status: 500 }
    );
  }
}
