import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Placeholder PDF response
  const content = `PDF placeholder for invoice ${params.id}`;
  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${params.id}.pdf"`,
    },
  });
}
