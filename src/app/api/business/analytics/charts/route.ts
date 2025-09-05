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
    const start = new Date(now.getFullYear(), 0, 1);

    // Revenue by month (current year)
    const revenueByMonth = await db
      .collection("transactions")
      .aggregate([
        {
          $match: {
            businessId: business._id,
            date: { $gte: start },
            type: { $in: ["income", "subscription"] },
          },
        },
        {
          $group: {
            _id: { $month: "$date" },
            amount: { $sum: { $ifNull: ["$amount", 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const labels = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
    const revenueSeries = labels.map((_, i) => {
      const rec = revenueByMonth.find((r: any) => r._id === i + 1);
      return rec?.amount || 0;
    });

    // Members growth by month (active members snapshot per month)
    const membersByMonth = await db
      .collection("members")
      .aggregate([
        { $match: { businessId: business._id } },
        {
          $group: {
            _id: { $month: { $ifNull: ["$joinedAt", "$createdAt"] } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const membersSeries = labels.map((_, i) => {
      const rec = membersByMonth.find((r: any) => r._id === i + 1);
      return rec?.count || 0;
    });

    // Usuń fallback - teraz dane będą pochodzić z bazy

    const revenueChart = {
      labels,
      datasets: [
        {
          label: "Przychody",
          data: revenueSeries,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          tension: 0.3,
        },
      ],
    };

    const membersChart = {
      labels,
      datasets: [
        {
          label: "Nowi członkowie (miesięcznie)",
          data: membersSeries,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          tension: 0.3,
        },
      ],
    };

    return NextResponse.json({ revenueChart, membersChart });
  } catch (err) {
    console.error("Error fetching analytics charts:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics charts" },
      { status: 500 }
    );
  }
}
