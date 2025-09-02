import { NextResponse } from "next/server";

export async function GET() {
  const labels = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);

  const revenueChart = {
    labels,
    datasets: [
      {
        label: "Przychody",
        data: labels.map((_, i) => 10000 + i * 900 + ((i % 3) - 1) * 600),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        tension: 0.3,
      },
    ],
  };

  const membersChart = {
    labels,
    datasets: [
      {
        label: "Członkowie",
        data: labels.map((_, i) => 200 + i * 14 + (i % 2) * 10),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        tension: 0.3,
      },
    ],
  };

  return NextResponse.json({ revenueChart, membersChart });
}
