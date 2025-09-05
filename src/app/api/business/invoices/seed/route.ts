import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(_request: NextRequest) {
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

    // Example invoices
    const invoices = [
      {
        invoiceNumber: "FV/2024/0001",
        customerName: "Jan Kowalski",
        customerEmail: "jan.kowalski@email.com",
        amount: 299.0,
        currency: "PLN",
        status: "paid",
        dueDate: new Date(Date.now() - 5 * 86400000), // 5 days ago
        issueDate: new Date(Date.now() - 10 * 86400000), // 10 days ago
        description: "Członkostwo miesięczne - Plan Pro",
        items: [
          {
            description: "Członkostwo miesięczne - Plan Pro",
            quantity: 1,
            unitPrice: 299.0,
            total: 299.0,
          },
        ],
        businessId: business._id,
        createdAt: new Date(Date.now() - 10 * 86400000),
        updatedAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        invoiceNumber: "FV/2024/0002",
        customerName: "Anna Nowak",
        customerEmail: "anna.nowak@email.com",
        amount: 199.0,
        currency: "PLN",
        status: "sent",
        dueDate: new Date(Date.now() + 15 * 86400000), // 15 days from now
        issueDate: new Date(Date.now() - 2 * 86400000), // 2 days ago
        description: "Członkostwo miesięczne - Plan Basic",
        items: [
          {
            description: "Członkostwo miesięczne - Plan Basic",
            quantity: 1,
            unitPrice: 199.0,
            total: 199.0,
          },
        ],
        businessId: business._id,
        createdAt: new Date(Date.now() - 2 * 86400000),
        updatedAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        invoiceNumber: "FV/2024/0003",
        customerName: "Piotr Wiśniewski",
        customerEmail: "piotr.wisniewski@email.com",
        amount: 450.0,
        currency: "PLN",
        status: "overdue",
        dueDate: new Date(Date.now() - 10 * 86400000), // 10 days ago
        issueDate: new Date(Date.now() - 25 * 86400000), // 25 days ago
        description: "Treningi personalne - pakiet 5 sesji",
        items: [
          {
            description: "Trening personalny - sesja 1",
            quantity: 1,
            unitPrice: 90.0,
            total: 90.0,
          },
          {
            description: "Trening personalny - sesja 2",
            quantity: 1,
            unitPrice: 90.0,
            total: 90.0,
          },
          {
            description: "Trening personalny - sesja 3",
            quantity: 1,
            unitPrice: 90.0,
            total: 90.0,
          },
          {
            description: "Trening personalny - sesja 4",
            quantity: 1,
            unitPrice: 90.0,
            total: 90.0,
          },
          {
            description: "Trening personalny - sesja 5",
            quantity: 1,
            unitPrice: 90.0,
            total: 90.0,
          },
        ],
        businessId: business._id,
        createdAt: new Date(Date.now() - 25 * 86400000),
        updatedAt: new Date(Date.now() - 10 * 86400000),
      },
      {
        invoiceNumber: "FV/2024/0004",
        customerName: "Maria Zielińska",
        customerEmail: "maria.zielinska@email.com",
        amount: 149.0,
        currency: "PLN",
        status: "draft",
        dueDate: new Date(Date.now() + 30 * 86400000), // 30 days from now
        issueDate: new Date(),
        description: "Jednorazowe wejście + suplementy",
        items: [
          {
            description: "Jednorazowe wejście na siłownię",
            quantity: 1,
            unitPrice: 49.0,
            total: 49.0,
          },
          {
            description: "Pakiet suplementów - kreatyna",
            quantity: 1,
            unitPrice: 100.0,
            total: 100.0,
          },
        ],
        businessId: business._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        invoiceNumber: "FV/2024/0005",
        customerName: "Tomasz Krawczyk",
        customerEmail: "tomasz.krawczyk@email.com",
        amount: 599.0,
        currency: "PLN",
        status: "paid",
        dueDate: new Date(Date.now() - 3 * 86400000), // 3 days ago
        issueDate: new Date(Date.now() - 8 * 86400000), // 8 days ago
        description: "Członkostwo kwartalne - Plan Pro",
        items: [
          {
            description: "Członkostwo kwartalne - Plan Pro (3 miesiące)",
            quantity: 1,
            unitPrice: 599.0,
            total: 599.0,
          },
        ],
        businessId: business._id,
        createdAt: new Date(Date.now() - 8 * 86400000),
        updatedAt: new Date(Date.now() - 3 * 86400000),
      },
    ];

    const result = await db.collection("invoices").insertMany(invoices);

    return NextResponse.json({
      insertedInvoices: result.insertedCount,
    });
  } catch (err) {
    console.error("Error seeding invoices:", err);
    return NextResponse.json(
      { error: "Failed to seed invoices" },
      { status: 500 }
    );
  }
}
