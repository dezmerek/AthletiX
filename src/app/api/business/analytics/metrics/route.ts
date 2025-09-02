import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    metrics: {
      totalRevenue: 125000,
      monthlyRevenue: 18200,
      activeMembers: 312,
      staffCount: 14,
      retentionRate: 87,
      avgVisitPerMember: 6.2,
    },
  });
}
