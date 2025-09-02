import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    membership: {
      active: 312,
      newThisMonth: 28,
      cancelledThisMonth: 11,
      avgTenureMonths: 9.4,
    },
  });
}
