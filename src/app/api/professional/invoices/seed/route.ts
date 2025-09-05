import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has professional role or professional context
    const hasAccess =
      session.user.role === "professional" ||
      session.user.activeContext === "professional" ||
      (Array.isArray(session.user.role) &&
        session.user.role.includes("professional"));

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied - professional access required" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Example invoices for professional
    const invoices = [
      {
        invoiceNumber: "FV-PRO/2024/0001",
        customerName: "Anna Kowalska",
        customerEmail: "anna.kowalska@email.com",
        amount: 299.0,
        currency: "PLN",
        status: "paid",
        dueDate: new Date(Date.now() - 5 * 86400000), // 5 days ago
        issueDate: new Date(Date.now() - 10 * 86400000), // 10 days ago
        description: "Konsultacja dietetyczna - Plan żywieniowy",
        items: [
          {
            description: "Konsultacja dietetyczna - Plan żywieniowy",
            quantity: 1,
            unitPrice: 299.0,
            total: 299.0,
          },
        ],
        professionalId: new ObjectId(session.user.id),
        createdAt: new Date(Date.now() - 10 * 86400000),
        updatedAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        invoiceNumber: "FV-PRO/2024/0002",
        customerName: "Piotr Nowak",
        customerEmail: "piotr.nowak@email.com",
        amount: 450.0,
        currency: "PLN",
        status: "sent",
        dueDate: new Date(Date.now() + 7 * 86400000), // 7 days from now
        issueDate: new Date(Date.now() - 2 * 86400000), // 2 days ago
        description: "Pakiet treningów personalnych",
        items: [
          {
            description: "Trening personalny - 4 sesje",
            quantity: 4,
            unitPrice: 100.0,
            total: 400.0,
          },
          {
            description: "Konsultacja przed treningiem",
            quantity: 1,
            unitPrice: 50.0,
            total: 50.0,
          },
        ],
        professionalId: new ObjectId(session.user.id),
        createdAt: new Date(Date.now() - 2 * 86400000),
        updatedAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        invoiceNumber: "FV-PRO/2024/0003",
        customerName: "Maria Wiśniewska",
        customerEmail: "maria.wisniewska@email.com",
        amount: 199.0,
        currency: "PLN",
        status: "draft",
        dueDate: new Date(Date.now() + 14 * 86400000), // 14 days from now
        issueDate: new Date(),
        description: "Analiza składu ciała i plan treningowy",
        items: [
          {
            description: "Analiza składu ciała",
            quantity: 1,
            unitPrice: 99.0,
            total: 99.0,
          },
          {
            description: "Plan treningowy na miesiąc",
            quantity: 1,
            unitPrice: 100.0,
            total: 100.0,
          },
        ],
        professionalId: new ObjectId(session.user.id),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        invoiceNumber: "FV-PRO/2024/0004",
        customerName: "Tomasz Kowalczyk",
        customerEmail: "tomasz.kowalczyk@email.com",
        amount: 600.0,
        currency: "PLN",
        status: "overdue",
        dueDate: new Date(Date.now() - 10 * 86400000), // 10 days ago
        issueDate: new Date(Date.now() - 20 * 86400000), // 20 days ago
        description: "Miesięczny pakiet treningów",
        items: [
          {
            description: "Trening personalny - 8 sesji",
            quantity: 8,
            unitPrice: 75.0,
            total: 600.0,
          },
        ],
        professionalId: new ObjectId(session.user.id),
        createdAt: new Date(Date.now() - 20 * 86400000),
        updatedAt: new Date(Date.now() - 20 * 86400000),
      },
      {
        invoiceNumber: "FV-PRO/2024/0005",
        customerName: "Katarzyna Zielińska",
        customerEmail: "katarzyna.zielinska@email.com",
        amount: 350.0,
        currency: "PLN",
        status: "paid",
        dueDate: new Date(Date.now() - 3 * 86400000), // 3 days ago
        issueDate: new Date(Date.now() - 8 * 86400000), // 8 days ago
        description: "Konsultacja i plan żywieniowy",
        items: [
          {
            description: "Konsultacja dietetyczna",
            quantity: 1,
            unitPrice: 150.0,
            total: 150.0,
          },
          {
            description: "Plan żywieniowy na 4 tygodnie",
            quantity: 1,
            unitPrice: 200.0,
            total: 200.0,
          },
        ],
        professionalId: new ObjectId(session.user.id),
        createdAt: new Date(Date.now() - 8 * 86400000),
        updatedAt: new Date(Date.now() - 3 * 86400000),
      },
    ];

    // Clear existing invoices for this professional
    await db.collection("invoices").deleteMany({
      professionalId: new ObjectId(session.user.id),
    });

    // Insert new invoices
    await db.collection("invoices").insertMany(invoices);

    return NextResponse.json({
      success: true,
      message: "Demo invoices created successfully",
      count: invoices.length,
    });
  } catch (err) {
    console.error("Error seeding professional invoices:", err);
    return NextResponse.json(
      { error: "Failed to seed invoices" },
      { status: 500 }
    );
  }
}
