import { NextResponse } from "next/server";

export async function GET() {
  const insights = [
    {
      id: "i1",
      type: "positive",
      title: "Silny wzrost przychodów miesiąc do miesiąca",
      description:
        "Przychody wzrosły o 6.2% w porównaniu do poprzedniego miesiąca.",
      impact: "+6.2% MoM",
      recommendation: "Kontynuuj kampanie promocyjne dla planu Pro.",
    },
    {
      id: "i2",
      type: "warning",
      title: "Wzrost rezygnacji wśród nowych klientów",
      description: "Churn w pierwszych 30 dniach wzrósł do 5.1%",
      impact: "-1.3 pp",
      recommendation: "Dodaj onboarding mailowy i plan 14-dniowy.",
    },
    {
      id: "i3",
      type: "info",
      title: "Najaktywniejsze dni tygodnia",
      description: "Poniedziałek i środa mają największą frekwencję",
      impact: "Planowanie zasobów",
      recommendation: "Dodaj więcej zajęć w godzinach 17-20.",
    },
  ];
  return NextResponse.json({ insights });
}
