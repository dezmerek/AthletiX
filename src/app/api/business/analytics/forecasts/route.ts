import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    forecasts: {
      nextMonthRevenue: 19500,
      nextQuarterRevenue: 61000,
      churnRate: 4.1,
      ltv: 890,
      cac: 120,
    },
  });
}
