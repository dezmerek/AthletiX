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

    // Build a few simple insights based on current data
    const now = new Date();
    const last30 = new Date(now);
    last30.setDate(now.getDate() - 30);
    const prev30Start = new Date(last30);
    prev30Start.setDate(prev30Start.getDate() - 30);

    const [currRevenueDoc, prevRevenueDoc, activeMembers, newMembers30] =
      await Promise.all([
        db
          .collection("transactions")
          .aggregate([
            {
              $match: {
                businessId: business._id,
                date: { $gte: last30 },
                type: { $in: ["income", "subscription"] },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: { $ifNull: ["$amount", 0] } },
              },
            },
          ])
          .toArray(),
        db
          .collection("transactions")
          .aggregate([
            {
              $match: {
                businessId: business._id,
                date: { $gte: prev30Start, $lt: last30 },
                type: { $in: ["income", "subscription"] },
              },
            },
            {
              $group: {
                _id: null,
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
          .countDocuments({
            businessId: business._id,
            createdAt: { $gte: last30 },
          })
          .catch(() => 0),
      ]);

    const currRevenue = currRevenueDoc[0]?.amount || 0;
    const prevRevenue = prevRevenueDoc[0]?.amount || 0;
    const revenueDelta = prevRevenue
      ? ((currRevenue - prevRevenue) / prevRevenue) * 100
      : 0;

    const insights = [
      {
        id: "i1",
        type: revenueDelta >= 0 ? "positive" : "warning",
        title: "Zmiana przychodów w ostatnich 30 dniach",
        description: `Przychody ${
          revenueDelta >= 0 ? "wzrosły" : "spadły"
        } o ${Math.abs(revenueDelta).toFixed(1)}% vs poprzednie 30 dni`,
        impact: `${revenueDelta >= 0 ? "+" : "-"}${Math.abs(
          revenueDelta
        ).toFixed(1)}%`,
        recommendation:
          revenueDelta >= 0
            ? "Kontynuuj działania sprzedażowe"
            : "Zweryfikuj źródła spadków i oferty",
      },
      {
        id: "i2",
        type: newMembers30 > 0 ? "info" : "warning",
        title: "Nowi członkowie w ostatnich 30 dniach",
        description: `${newMembers30} nowych członków dołączyło do firmy`,
        impact:
          newMembers30 > 0 ? "Wzrost bazy klientów" : "Brak nowych członków",
        recommendation:
          newMembers30 > 0
            ? "Zadbaj o onboarding i utrzymanie"
            : "Uruchom kampanię pozyskującą",
      },
      {
        id: "i3",
        type: activeMembers > 0 ? "info" : "warning",
        title: "Aktywni członkowie",
        description: `Aktualnie ${activeMembers} aktywnych członków`,
        impact: activeMembers > 0 ? "Stabilna baza" : "Brak aktywnej bazy",
        recommendation:
          activeMembers > 0
            ? "Segmentuj klientów po wartości"
            : "Zwiększ działania akwizycyjne",
      },
    ];

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("Error fetching analytics insights:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics insights" },
      { status: 500 }
    );
  }
}
