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
        startDate: new Date(),
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
        startDate: new Date(),
      },
    ];

    // Dodatkowe starty subskrypcji w ostatnich 12 miesiącach z realistycznymi danymi
    const nowDate = new Date();
    const baseMembers = [12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48];

    for (let i = 1; i <= 12; i++) {
      const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1);
      const baseCount = baseMembers[12 - i];
      const randomVariation = Math.floor(Math.random() * 6) - 3;
      const monthlyMembers = Math.max(1, baseCount + randomVariation);

      for (let j = 0; j < monthlyMembers; j++) {
        subs.push({
          businessId: business._id,
          plan: j % 2 === 0 ? "Basic" : "Pro",
          amount: j % 2 === 0 ? 99 : 149,
          currency: "PLN",
          status: "active",
          billingCycle: "monthly",
          nextBillingDate: new Date(d.getTime() + 30 * 86400000),
          memberCount: 1,
          features: ["seed"],
          createdAt: d,
          startDate: d,
        } as any);
      }
    }

    // Example transactions (last 12 months with realistic data)
    const now = new Date();
    const baseRevenue = [
      8500, 9200, 8800, 10500, 11200, 9800, 10800, 11500, 10200, 11800, 12500,
      13200,
    ];

    const tx = [];

    // Generate monthly revenue transactions for the last 12 months
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 15);
      const baseAmount = baseRevenue[11 - month];
      const randomVariation = Math.floor(Math.random() * 1000) - 500;
      const monthlyRevenue = Math.max(0, baseAmount + randomVariation);

      // Split monthly revenue into multiple transactions
      const transactionCount = Math.floor(Math.random() * 5) + 3; // 3-7 transactions per month
      const avgTransaction = Math.floor(monthlyRevenue / transactionCount);

      for (let i = 0; i < transactionCount; i++) {
        const variation = Math.floor(Math.random() * 200) - 100;
        const amount = Math.max(50, avgTransaction + variation);

        tx.push({
          businessId: business._id,
          type: Math.random() > 0.3 ? "subscription" : "income",
          amount: amount,
          currency: "PLN",
          description:
            Math.random() > 0.3
              ? `Plan ${
                  Math.random() > 0.5 ? "Pro" : "Basic"
                } – opłata miesięczna`
              : "Jednorazowe wejście",
          status: "completed",
          category: Math.random() > 0.3 ? "subscription" : "single_pass",
          date: new Date(monthDate.getTime() + i * 2 * 86400000), // Spread over month
          createdAt: new Date(),
        });
      }
    }

    // Add some expenses
    const expenses = [
      { amount: 1200, description: "Czynsz", category: "rent" },
      { amount: 350, description: "Media", category: "utilities" },
      { amount: 800, description: "Sprzęt fitness", category: "equipment" },
      { amount: 450, description: "Marketing", category: "marketing" },
      { amount: 600, description: "Ubezpieczenie", category: "insurance" },
    ];

    expenses.forEach((expense, i) => {
      tx.push({
        businessId: business._id,
        type: "expense",
        amount: expense.amount,
        currency: "PLN",
        description: expense.description,
        status: "completed",
        category: expense.category,
        date: new Date(now.getTime() - i * 7 * 86400000),
        createdAt: new Date(),
      });
    });

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
