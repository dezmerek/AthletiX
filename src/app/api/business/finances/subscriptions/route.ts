import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
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

    const docs = await db
      .collection("subscriptions")
      .find({ businessId: business._id })
      .sort({ nextBillingDate: 1 })
      .limit(200)
      .toArray();

    const subscriptions = docs.map((s: any) => ({
      id: s._id?.toString(),
      plan: s.plan || s.name || "Plan",
      amount: s.amount ?? s.price ?? 0,
      currency: s.currency || "PLN",
      status: s.status || "active",
      billingCycle: s.billingCycle || "monthly",
      nextBillingDate: s.nextBillingDate
        ? new Date(s.nextBillingDate).toISOString()
        : null,
      memberCount: s.memberCount ?? 0,
      features: Array.isArray(s.features) ? s.features : [],
    }));

    return NextResponse.json({ subscriptions });
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
