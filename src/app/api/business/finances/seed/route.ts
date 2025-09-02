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

    // Example subscriptions
    const subs = [
      {
        businessId: business._id,
        plan: "Basic",
        amount: 99,
        currency: "PLN",
        status: "active",
        billingCycle: "monthly",
        nextBillingDate: new Date(Date.now() + 10 * 86400000),
        memberCount: 60,
        features: ["Wejścia 10/mies", "Dostęp w tygodniu"],
        createdAt: new Date(),
      },
      {
        businessId: business._id,
        plan: "Pro",
        amount: 149,
        currency: "PLN",
        status: "active",
        billingCycle: "monthly",
        nextBillingDate: new Date(Date.now() + 5 * 86400000),
        memberCount: 120,
        features: ["Wejścia nielimitowane", "Strefa premium"],
        createdAt: new Date(),
      },
    ];

    // Example transactions (last 30 days)
    const now = new Date();
    const tx = [
      {
        type: "subscription",
        amount: 149,
        currency: "PLN",
        description: "Plan Pro – opłata",
        status: "completed",
        category: "subscription",
      },
      {
        type: "income",
        amount: 49,
        currency: "PLN",
        description: "Jednorazowe wejście",
        status: "completed",
        category: "single_pass",
      },
      {
        type: "expense",
        amount: 1200,
        currency: "PLN",
        description: "Czynsz",
        status: "completed",
        category: "rent",
      },
      {
        type: "expense",
        amount: 350,
        currency: "PLN",
        description: "Media",
        status: "completed",
        category: "utilities",
      },
      {
        type: "subscription",
        amount: 99,
        currency: "PLN",
        description: "Plan Basic – opłata",
        status: "completed",
        category: "subscription",
      },
    ].map((t, i) => ({
      businessId: business._id,
      ...t,
      date: new Date(now.getTime() - i * 3 * 86400000),
      createdAt: new Date(),
    }));

    const [subsRes, txRes] = await Promise.all([
      db.collection("subscriptions").insertMany(subs),
      db.collection("transactions").insertMany(tx),
    ]);

    return NextResponse.json({
      insertedSubscriptions: subsRes.insertedCount,
      insertedTransactions: txRes.insertedCount,
    });
  } catch (err) {
    console.error("Error seeding finances:", err);
    return NextResponse.json(
      { error: "Failed to seed finances" },
      { status: 500 }
    );
  }
}
