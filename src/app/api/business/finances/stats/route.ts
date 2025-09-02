import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const stats = {
    totalRevenue: 125000,
    totalExpenses: 74000,
    netProfit: 51000,
    activeSubscriptions: 182,
    monthlyRecurringRevenue: 18200,
    growthRate: 6.4,
  };
  return NextResponse.json({ stats });
}
