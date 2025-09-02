import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const transactions = [
    {
      id: "t1",
      type: "income",
      amount: 199,
      currency: "PLN",
      description: "Miesięczny karnet",
      date: new Date().toISOString(),
      status: "completed",
      category: "subscription",
      memberName: "Jan Kowalski",
    },
    {
      id: "t2",
      type: "expense",
      amount: 1200,
      currency: "PLN",
      description: "Czynsz",
      date: new Date().toISOString(),
      status: "completed",
      category: "rent",
    },
  ];
  return NextResponse.json({ transactions });
}
