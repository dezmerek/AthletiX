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

    const invoice = await db.collection("invoices").findOne({
      _id: new ObjectId(id),
      professionalId: new ObjectId(session.user.id),
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Get professional details
    const professional = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id),
    });

    // PDF generation
    const pageWidth = 595; // A4 width in points
    const pageHeight = 842; // A4 height in points
    const margin = 50;
    const contentWidth = pageWidth - 2 * margin;

    let yPosition = pageHeight - margin - 50;

    // Helper function to add text
    const addText = (
      text: string,
      x: number,
      y: number,
      fontSize: number = 12,
      bold: boolean = false
    ) => {
      const font = bold ? "F1-Bold" : "F1";
      return `${fontSize} ${font} ${x} ${y} Td (${escapePdfText(text)}) Tj\n`;
    };

    // Helper function to draw line
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      return `${x1} ${y1} m ${x2} ${y2} l S\n`;
    };

    // Helper function to draw rectangle
    const drawRect = (x: number, y: number, width: number, height: number) => {
      return `${x} ${y} m ${x + width} ${y} l ${x + width} ${
        y + height
      } l ${x} ${y + height} l h S\n`;
    };

    // Build content stream
    let contentStream = "";
    contentStream += "BT\n";
    contentStream += "/F1 12 Tf\n";

    // Header
    contentStream += addText("FAKTURA", margin, yPosition, 24, true);
    yPosition -= 40;

    contentStream += addText(
      `Numer: ${invoice.invoiceNumber}`,
      margin,
      yPosition,
      14,
      true
    );
    yPosition -= 20;

    contentStream += addText(
      `Data wystawienia: ${new Date(invoice.issueDate).toLocaleDateString(
        "pl-PL"
      )}`,
      margin,
      yPosition
    );
    yPosition -= 20;

    contentStream += addText(
      `Termin platnosci: ${new Date(invoice.dueDate).toLocaleDateString(
        "pl-PL"
      )}`,
      margin,
      yPosition
    );
    yPosition -= 40;

    // Professional info
    contentStream += addText("Sprzedawca:", margin, yPosition, 14, true);
    yPosition -= 20;
    contentStream += addText(
      professional?.name || "Profesjonalista",
      margin,
      yPosition
    );
    yPosition -= 15;
    contentStream += addText(professional?.email || "", margin, yPosition);
    yPosition -= 40;

    // Customer info
    contentStream += addText("Nabywca:", margin, yPosition, 14, true);
    yPosition -= 20;
    contentStream += addText(invoice.customerName, margin, yPosition);
    yPosition -= 15;
    contentStream += addText(invoice.customerEmail, margin, yPosition);
    yPosition -= 40;

    // Items table header
    contentStream += drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition -= 20;

    contentStream += addText("Opis", margin, yPosition, 12, true);
    contentStream += addText("Ilosc", margin + 200, yPosition, 12, true);
    contentStream += addText("Cena j.", margin + 300, yPosition, 12, true);
    contentStream += addText("Razem", margin + 400, yPosition, 12, true);
    yPosition -= 20;

    contentStream += drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition -= 20;

    // Items
    if (invoice.items && invoice.items.length > 0) {
      for (const item of invoice.items) {
        contentStream += addText(item.description, margin, yPosition);
        contentStream += addText(
          item.quantity.toString(),
          margin + 200,
          yPosition
        );
        contentStream += addText(
          formatCurrency(item.unitPrice, invoice.currency),
          margin + 300,
          yPosition
        );
        contentStream += addText(
          formatCurrency(item.total, invoice.currency),
          margin + 400,
          yPosition
        );
        yPosition -= 20;
      }
    } else {
      contentStream += addText(
        invoice.description || "Usluga",
        margin,
        yPosition
      );
      contentStream += addText("1", margin + 200, yPosition);
      contentStream += addText(
        formatCurrency(invoice.amount, invoice.currency),
        margin + 300,
        yPosition
      );
      contentStream += addText(
        formatCurrency(invoice.amount, invoice.currency),
        margin + 400,
        yPosition
      );
      yPosition -= 20;
    }

    yPosition -= 20;
    contentStream += drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition -= 30;

    // Total
    contentStream += addText(
      `Razem: ${formatCurrency(invoice.amount, invoice.currency)}`,
      margin + 300,
      yPosition,
      14,
      true
    );
    yPosition -= 40;

    // Status
    const statusText =
      {
        draft: "Szkic",
        sent: "Wyslana",
        paid: "Oplacona",
        overdue: "Przeterminowana",
      }[invoice.status] || "Szkic";

    contentStream += addText(
      `Status: ${statusText}`,
      margin,
      yPosition,
      12,
      true
    );

    contentStream += "ET\n";

    // Create PDF objects
    const objects: string[] = [];
    objects.push(`1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n`);
    objects.push(`2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n`);
    objects.push(
      `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F1-Bold 6 0 R >> >> >> endobj\n`
    );
    objects.push(
      `4 0 obj << /Length ${contentStream.length} >> stream\n${contentStream}\nendstream endobj\n`
    );
    objects.push(
      `5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n`
    );
    objects.push(
      `6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n`
    );

    let offset = 0;
    const parts: Buffer[] = [];
    const header = Buffer.from("%PDF-1.4\n");
    parts.push(header);

    // Add objects
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      const objBuffer = Buffer.from(obj);
      parts.push(objBuffer);
      offset += objBuffer.length;
    }

    // Add xref table
    const xrefOffset = offset;
    const xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${objects
      .map((_, i) => {
        const objOffset =
          i === 0 ? 0 : offset - Buffer.concat(parts.slice(1, i + 1)).length;
        return `${String(objOffset).padStart(10, "0")} 00000 n `;
      })
      .join("\n")}\n`;

    const xrefBuffer = Buffer.from(xref);
    parts.push(xrefBuffer);
    offset += xrefBuffer.length;

    // Add trailer
    const trailer = `trailer\n<< /Size ${
      objects.length + 1
    } /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    const trailerBuffer = Buffer.from(trailer);
    parts.push(trailerBuffer);

    const pdfBuffer = Buffer.concat(parts);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="faktura-${invoice.invoiceNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Error generating professional invoice PDF:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
