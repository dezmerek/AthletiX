import { NextResponse } from "next/server";

export async function GET() {
  const subscriptions = [
    {
      id: "s1",
      plan: "Basic",
      price: 99,
      currency: "PLN",
      status: "active",
      nextBillingDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      memberCount: 58,
    },
    {
      id: "s2",
      plan: "Pro",
      price: 149,
      currency: "PLN",
      status: "active",
      nextBillingDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      memberCount: 124,
    },
  ];
  return NextResponse.json({ subscriptions });
}
