import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function escapePdfText(input: string): string {
  // Escape special PDF characters and transliterate Polish characters to ASCII
  return (
    input
      .replace(/[()\\]/g, (m) => `\\${m}`)
      // Polish lowercase characters to ASCII
      .replace(/ą/g, "a")
      .replace(/ć/g, "c")
      .replace(/ę/g, "e")
      .replace(/ł/g, "l")
      .replace(/ń/g, "n")
      .replace(/ó/g, "o")
      .replace(/ś/g, "s")
      .replace(/ź/g, "z")
      .replace(/ż/g, "z")
      // Polish uppercase characters to ASCII
      .replace(/Ą/g, "A")
      .replace(/Ć/g, "C")
      .replace(/Ę/g, "E")
      .replace(/Ł/g, "L")
      .replace(/Ń/g, "N")
      .replace(/Ó/g, "O")
      .replace(/Ś/g, "S")
      .replace(/Ź/g, "Z")
      .replace(/Ż/g, "Z")
  );
}

function formatCurrency(amount: number, currency: string = "PLN"): string {
  return `${amount.toFixed(2).replace(".", ",")} ${currency}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Validate ObjectId format
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

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

    const invoice = await db.collection("invoices").findOne({
      _id: new ObjectId(id),
      businessId: business._id,
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Generate PDF
    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 40;
    const leading = 16;

    let y = pageHeight - margin;
    const contentOps: string[] = [];

    // Header
    contentOps.push("0 0 0 rg BT /F1 18 Tf");
    const title = escapePdfText("FAKTURA");
    contentOps.push(`1 0 0 1 ${margin} ${y} Tm (${title}) Tj ET`);
    y -= leading * 2;

    // Invoice number and date
    contentOps.push("0 0 0 rg BT /F1 12 Tf");
    contentOps.push(
      `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(
        `Numer faktury: ${invoice.invoiceNumber}`
      )}) Tj ET`
    );
    y -= leading;

    contentOps.push(
      `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(
        `Data wystawienia: ${new Date(invoice.issueDate).toLocaleDateString(
          "pl-PL"
        )}`
      )}) Tj ET`
    );
    y -= leading;

    contentOps.push(
      `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(
        `Termin płatności: ${new Date(invoice.dueDate).toLocaleDateString(
          "pl-PL"
        )}`
      )}) Tj ET`
    );
    y -= leading * 2;

    // Business info
    contentOps.push("0 0 0 rg BT /F1 14 Tf");
    contentOps.push(
      `1 0 0 1 ${margin} ${y} Tm (${escapePdfText("Sprzedawca:")}) Tj ET`
    );
    y -= leading;

    contentOps.push("0 0 0 rg BT /F1 12 Tf");
    contentOps.push(
      `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(
        business.name || "Nazwa firmy"
      )}) Tj ET`
    );
    y -= leading;

    if (business.address) {
      contentOps.push(
        `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(business.address)}) Tj ET`
      );
      y -= leading;
    }

    y -= leading;

    // Customer info
    contentOps.push("0 0 0 rg BT /F1 14 Tf");
    contentOps.push(
      `1 0 0 1 ${margin} ${y} Tm (${escapePdfText("Nabywca:")}) Tj ET`
    );
    y -= leading;

    contentOps.push("0 0 0 rg BT /F1 12 Tf");
    contentOps.push(
      `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(invoice.customerName)}) Tj ET`
    );
    y -= leading;

    contentOps.push(
      `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(
        invoice.customerEmail
      )}) Tj ET`
    );
    y -= leading * 2;

    // Items table
    if (invoice.items && invoice.items.length > 0) {
      const tableW = pageWidth - margin * 2;
      const colDesc = Math.floor(tableW * 0.4);
      const colQty = Math.floor(tableW * 0.15);
      const colPrice = Math.floor(tableW * 0.2);
      const colTotal = tableW - colDesc - colQty - colPrice;
      const rowH = 20;

      // Table header
      contentOps.push(
        `0.93 0.96 1 rg ${margin} ${y - rowH} ${tableW} ${rowH} re f`
      );
      contentOps.push("0 0 0 rg BT /F1 12 Tf");
      contentOps.push(
        `1 0 0 1 ${margin + 6} ${y - 13} Tm (${escapePdfText("Opis")}) Tj`
      );
      contentOps.push(
        `1 0 0 1 ${margin + colDesc + 6} ${y - 13} Tm (${escapePdfText(
          "Ilość"
        )}) Tj`
      );
      contentOps.push(
        `1 0 0 1 ${margin + colDesc + colQty + 6} ${y - 13} Tm (${escapePdfText(
          "Cena"
        )}) Tj`
      );
      contentOps.push(
        `1 0 0 1 ${margin + colDesc + colQty + colPrice + 6} ${
          y - 13
        } Tm (${escapePdfText("Wartość")}) Tj ET`
      );

      // Table border
      contentOps.push(`0 0 0 RG ${margin} ${y - rowH} ${tableW} ${rowH} re S`);
      y -= rowH;

      // Table rows
      invoice.items.forEach((item: any) => {
        contentOps.push(
          `0.99 0.99 1 rg ${margin} ${y - rowH} ${tableW} ${rowH} re f`
        );
        contentOps.push("0 0 0 rg BT /F1 12 Tf");
        contentOps.push(
          `1 0 0 1 ${margin + 6} ${y - 13} Tm (${escapePdfText(
            item.description || ""
          )}) Tj`
        );
        contentOps.push(
          `1 0 0 1 ${margin + colDesc + 6} ${y - 13} Tm (${String(
            item.quantity || 0
          )}) Tj`
        );
        contentOps.push(
          `1 0 0 1 ${margin + colDesc + colQty + 6} ${
            y - 13
          } Tm (${escapePdfText(formatCurrency(item.unitPrice || 0))}) Tj`
        );
        contentOps.push(
          `1 0 0 1 ${margin + colDesc + colQty + colPrice + 6} ${
            y - 13
          } Tm (${escapePdfText(formatCurrency(item.total || 0))}) Tj ET`
        );

        contentOps.push(
          `0.9 0.9 0.95 RG ${margin} ${y - rowH} ${tableW} ${rowH} re S`
        );
        y -= rowH;
      });

      y -= leading;
    }

    // Total
    contentOps.push("0 0 0 rg BT /F1 14 Tf");
    contentOps.push(
      `1 0 0 1 ${pageWidth - margin - 150} ${y} Tm (${escapePdfText(
        "RAZEM:"
      )}) Tj ET`
    );
    contentOps.push(
      `1 0 0 1 ${pageWidth - margin - 100} ${y} Tm (${escapePdfText(
        formatCurrency(invoice.amount)
      )}) Tj ET`
    );

    const contentStream = contentOps.join("\n");
    const contentBytes = Buffer.from(contentStream, "utf8");

    const objects: string[] = [];
    objects.push(`1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n`);
    objects.push(`2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n`);
    objects.push(
      `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n`
    );
    objects.push(
      `4 0 obj << /Length ${contentBytes.length} >> stream\n${contentStream}\nendstream endobj\n`
    );
    objects.push(
      `5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n`
    );

    let offset = 0;
    const parts: Buffer[] = [];
    const header = Buffer.from("%PDF-1.4\n");
    parts.push(header);
    offset += header.length;
    const xref: number[] = [0];
    objects.forEach((obj) => {
      xref.push(offset);
      const buf = Buffer.from(obj, "utf8");
      parts.push(buf);
      offset += buf.length;
    });
    const xrefStart = offset;
    const xrefLines = [
      `xref\n0 ${objects.length + 1}\n`,
      `0000000000 65535 f \n`,
      ...xref
        .slice(1)
        .map((pos) => `${pos.toString().padStart(10, "0")} 00000 n \n`),
    ].join("");
    parts.push(Buffer.from(xrefLines, "utf8"));
    const trailer = `trailer\n<< /Root 1 0 R /Size ${
      objects.length + 1
    } >>\nstartxref\n${xrefStart}\n%%EOF`;
    parts.push(Buffer.from(trailer, "utf8"));

    const pdfBytes = Buffer.concat(parts);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: new Headers({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=faktura-${invoice.invoiceNumber}.pdf`,
        "Cache-Control": "no-store",
      }),
    });
  } catch (err) {
    console.error("Error generating invoice PDF:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
