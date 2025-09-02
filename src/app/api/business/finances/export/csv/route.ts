import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const business = await db.collection("businesses").findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { "staff.userId": session.user.id },
      ],
    });
    if (!business)
      return NextResponse.json(
        { error: "No business found for user" },
        { status: 404 }
      );

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const now = new Date();
    const from = new Date(now);
    if (period === "7d") from.setDate(now.getDate() - 7);
    else if (period === "30d") from.setDate(now.getDate() - 30);
    else if (period === "90d") from.setDate(now.getDate() - 90);
    else if (period === "1y") from.setFullYear(now.getFullYear() - 1);
    else from.setDate(now.getDate() - 30);

    const tx = await db
      .collection("transactions")
      .find({ businessId: business._id, date: { $gte: from } })
      .sort({ date: -1 })
      .toArray();

    const header = [
      "date",
      "type",
      "amount",
      "currency",
      "status",
      "category",
      "description",
      "memberName",
    ];
    const rows = tx.map((t: any) => [
      new Date(t.date).toISOString(),
      t.type,
      t.amount,
      t.currency || "PLN",
      t.status || "completed",
      t.category || "",
      (t.description || "").replace(/\n|\r/g, " "),
      t.memberName || "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=finanse-${from
          .toISOString()
          .slice(0, 10)}.csv`,
      },
    });
  } catch (err) {
    console.error("CSV export error", err);
    return NextResponse.json(
      { error: "Failed to export CSV" },
      { status: 500 }
    );
  }
}
