import { NextResponse } from "next/server";

export async function GET() {
  const topPerformers = [
    {
      id: "p1",
      name: "Studio Centrum",
      revenue: 32500,
      members: 142,
      growth: 5.4,
      status: "growing",
    },
    {
      id: "p2",
      name: "Strefa Fitness",
      revenue: 28100,
      members: 118,
      growth: 0.8,
      status: "stable",
    },
    {
      id: "p3",
      name: "Power Gym",
      revenue: 19750,
      members: 96,
      growth: -1.2,
      status: "declining",
    },
  ];
  return NextResponse.json({ topPerformers });
}
