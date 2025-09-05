import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(_request: NextRequest) {
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

    // Create example members for top performers
    const exampleMembers = [
      {
        businessId: business._id,
        name: "Anna Kowalska",
        email: "anna.kowalska@example.com",
        status: "active",
        plan: "Pro",
        joinedAt: new Date(Date.now() - 180 * 86400000), // 6 months ago
        createdAt: new Date(Date.now() - 180 * 86400000),
      },
      {
        businessId: business._id,
        name: "Piotr Nowak",
        email: "piotr.nowak@example.com",
        status: "active",
        plan: "Pro",
        joinedAt: new Date(Date.now() - 120 * 86400000), // 4 months ago
        createdAt: new Date(Date.now() - 120 * 86400000),
      },
      {
        businessId: business._id,
        name: "Maria Wiśniewska",
        email: "maria.wisniewska@example.com",
        status: "active",
        plan: "Basic",
        joinedAt: new Date(Date.now() - 90 * 86400000), // 3 months ago
        createdAt: new Date(Date.now() - 90 * 86400000),
      },
      {
        businessId: business._id,
        name: "Tomasz Kowalczyk",
        email: "tomasz.kowalczyk@example.com",
        status: "active",
        plan: "Pro",
        joinedAt: new Date(Date.now() - 60 * 86400000), // 2 months ago
        createdAt: new Date(Date.now() - 60 * 86400000),
      },
      {
        businessId: business._id,
        name: "Katarzyna Zielińska",
        email: "katarzyna.zielinska@example.com",
        status: "active",
        plan: "Basic",
        joinedAt: new Date(Date.now() - 30 * 86400000), // 1 month ago
        createdAt: new Date(Date.now() - 30 * 86400000),
      },
    ];

    // Insert members
    const membersRes = await db
      .collection("members")
      .insertMany(exampleMembers);
    const memberIds = Object.values(membersRes.insertedIds);

    // Create transactions for these members to make them top performers
    const memberTransactions = [];
    const revenueData = [2400, 2100, 1950, 1800, 1650]; // Revenue for each member

    memberIds.forEach((memberId, index) => {
      const memberRevenue = revenueData[index];
      const transactionCount = Math.floor(Math.random() * 3) + 2; // 2-4 transactions per member
      const avgTransaction = Math.floor(memberRevenue / transactionCount);

      for (let i = 0; i < transactionCount; i++) {
        const variation = Math.floor(Math.random() * 100) - 50;
        const amount = Math.max(50, avgTransaction + variation);

        memberTransactions.push({
          businessId: business._id,
          memberId: memberId,
          type: "subscription",
          amount: amount,
          currency: "PLN",
          description: `Plan ${index % 2 === 0 ? "Pro" : "Basic"} – opłata`,
          status: "completed",
          category: "subscription",
          date: new Date(Date.now() - (i + 1) * 30 * 86400000), // Spread over months
          createdAt: new Date(),
        });
      }
    });

    // Insert member transactions
    const transactionsRes = await db
      .collection("transactions")
      .insertMany(memberTransactions);

    return NextResponse.json({
      insertedMembers: membersRes.insertedCount,
      insertedTransactions: transactionsRes.insertedCount,
    });
  } catch (err) {
    console.error("Error seeding analytics data:", err);
    return NextResponse.json(
      { error: "Failed to seed analytics data" },
      { status: 500 }
    );
  }
}
