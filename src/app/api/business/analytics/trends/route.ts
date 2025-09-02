import { NextResponse } from "next/server";

export async function GET() {
  const days = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
  const revenue = days.map((_, i) => 10000 + i * 800 + (i % 3) * 500);
  const members = days.map((_, i) => 200 + i * 12 + (i % 2) * 8);

  return NextResponse.json({
    trends: {
      revenue: days.map((label, i) => ({ label, value: revenue[i] })),
      members: days.map((label, i) => ({ label, value: members[i] })),
    },
  });
}
