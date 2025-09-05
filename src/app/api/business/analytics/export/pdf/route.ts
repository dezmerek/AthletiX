import { NextResponse } from "next/server";

type Insight = {
  id: string;
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
  impact?: string;
  recommendation?: string;
};

function transliteratePolish(input: string): string {
  const map: Record<string, string> = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ź: "z",
    ż: "z",
    Ą: "A",
    Ć: "C",
    Ę: "E",
    Ł: "L",
    Ń: "N",
    Ó: "O",
    Ś: "S",
    Ź: "Z",
    Ż: "Z",
  };
  return input.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (m) => map[m] || m);
}

function escapePdfText(input: string): string {
  const ascii = transliteratePolish(input);
  return ascii.replace(/[()\\]/g, (m) => `\\${m}`);
}

function formatInt(n: number | null | undefined): string {
  const v = typeof n === "number" && isFinite(n) ? Math.round(n) : 0;
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatPLN(n: number | null | undefined): string {
  return `${formatInt(n)} PLN`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const insights: Insight[] = Array.isArray(body?.insights)
      ? body.insights
      : [];
    const metrics = body?.metrics || null;
    const finStats = body?.finStats || null;
    const performers: Array<{
      name: string;
      revenue: number;
      members?: number;
    }> = Array.isArray(body?.performers) ? body.performers : [];
    const charts = body?.charts || null;

    const pageWidth = 612; // A4 US letter
    const pageHeight = 792;
    const margin = 40;
    const leading = 16;

    // proste zawijanie linii (szacując 6px na znak przy 12pt)
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      const maxChars = Math.floor(maxWidth / 6);
      for (const w of words) {
        if ((line + (line ? " " : "") + w).length > maxChars) {
          if (line) lines.push(line);
          line = w;
        } else {
          line += (line ? " " : "") + w;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    let y = pageHeight - margin;
    const contentOps: string[] = [];
    // nagłówek tła
    const headerH = 48;
    contentOps.push(
      `0.09 0.3 0.85 rg 0 ${pageHeight - headerH} ${pageWidth} ${headerH} re f`
    );
    // tytuł
    contentOps.push("0 0 0 rg BT /F1 18 Tf");
    const title = escapePdfText(
      transliteratePolish("Raport wniosków biznesowych")
    );
    contentOps.push(`1 0 0 1 ${margin} ${pageHeight - 30} Tm (${title}) Tj ET`);

    y = pageHeight - headerH - 20;

    // sekcja METRYKI
    if (metrics) {
      const sectionTitle = transliteratePolish("Kluczowe metryki");
      contentOps.push("0 0 0 rg BT /F1 14 Tf");
      contentOps.push(
        `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(sectionTitle)}) Tj ET`
      );
      y -= leading + 6;
      const kv: string[] = [
        `Przychody: ${formatPLN(metrics.totalRevenue)}`,
        `Aktywni czlonkowie: ${formatInt(metrics.activeMembers)}`,
        `Sredni przychod na czlonka: ${formatPLN(
          metrics.averageRevenuePerMember
        )}`,
        `Retencja: ${formatInt(metrics.retentionRate)}%`,
      ];
      contentOps.push("0 0 0 rg BT /F1 12 Tf");
      kv.forEach((raw) => {
        const txt = escapePdfText(transliteratePolish(raw));
        contentOps.push(`1 0 0 1 ${margin} ${y} Tm (${txt}) Tj`);
        y -= leading;
      });
      contentOps.push("ET");
      y -= 8;
    }

    // sekcja KPI finansowe
    if (finStats) {
      const sectionTitle = transliteratePolish("Finanse (KPI)");
      contentOps.push("0 0 0 rg BT /F1 14 Tf");
      contentOps.push(
        `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(sectionTitle)}) Tj ET`
      );
      y -= leading + 6;
      const kv: string[] = [
        `MRR: ${formatPLN(finStats.monthlyRecurringRevenue)}`,
        `Zysk netto: ${formatPLN(finStats.netProfit)}`,
      ];
      contentOps.push("0 0 0 rg BT /F1 12 Tf");
      kv.forEach((raw) => {
        const txt = escapePdfText(transliteratePolish(raw));
        contentOps.push(`1 0 0 1 ${margin} ${y} Tm (${txt}) Tj`);
        y -= leading;
      });
      contentOps.push("ET");
      y -= 8;
    }

    // sekcja TOP PERFORMERS (zwięzła lista)
    if (performers.length) {
      const sectionTitle = transliteratePolish("Najlepsi wykonawcy");
      contentOps.push("0 0 0 rg BT /F1 14 Tf");
      contentOps.push(
        `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(sectionTitle)}) Tj ET`
      );
      y -= leading + 6;
      contentOps.push("0 0 0 rg BT /F1 12 Tf");
      performers.slice(0, 10).forEach((p, idx) => {
        const row = `${idx + 1}. ${p.name} — ${p.revenue} PLN${
          p.members ? `, czlonkowie: ${p.members}` : ""
        }`;
        contentOps.push(
          `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(
            transliteratePolish(row)
          )}) Tj`
        );
        y -= leading;
      });
      contentOps.push("ET");
      y -= 8;
    }

    // sekcja PODSUMOWANIE WYKRESÓW (ostatnie / suma)
    if (charts?.revenue?.labels && charts?.revenue?.data) {
      const lastIdx = charts.revenue.data.length - 1;
      const lastVal = charts.revenue.data[lastIdx] ?? 0;
      const label = charts.revenue.labels[lastIdx] ?? "";
      const row = `Trend przychodow — ostatni okres (${label}): ${formatPLN(
        lastVal
      )}`;
      contentOps.push("0 0 0 rg BT /F1 12 Tf");
      contentOps.push(
        `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(
          transliteratePolish(row)
        )}) Tj ET`
      );
      y -= leading + 8;
    }
    if (charts?.members?.labels && charts?.members?.data) {
      const lastIdx = charts.members.data.length - 1;
      const lastVal = charts.members.data[lastIdx] ?? 0;
      const label = charts.members.labels[lastIdx] ?? "";
      const row = `Wzrost czlonkow — ostatni okres (${label}): ${formatInt(
        lastVal
      )}`;
      contentOps.push("0 0 0 rg BT /F1 12 Tf");
      contentOps.push(
        `1 0 0 1 ${margin} ${y} Tm (${escapePdfText(
          transliteratePolish(row)
        )}) Tj ET`
      );
      y -= leading + 8;
    }

    // SPARKLINES (proste mini-wykresy)
    const drawSpark = (
      title: string,
      data: number[],
      x: number,
      yTop: number,
      w: number,
      h: number,
      color: { r: number; g: number; b: number }
    ) => {
      const max = Math.max(1, ...data);
      const min = Math.min(0, ...data);
      const range = Math.max(1, max - min);
      // karta
      contentOps.push(`0.97 0.97 0.99 rg ${x} ${yTop - h} ${w} ${h} re f`);
      // tytul
      contentOps.push("0 0 0 rg BT /F1 12 Tf");
      contentOps.push(
        `1 0 0 1 ${x + 10} ${yTop - 20} Tm (${escapePdfText(
          transliteratePolish(title)
        )}) Tj ET`
      );
      // ramka wykresu
      const gx = x + 10;
      const gy = yTop - h + 14;
      const gw = w - 20;
      const gh = h - 34;
      contentOps.push(`0.85 0.9 0.98 RG ${gx} ${gy} ${gw} ${gh} re S`);
      // linia
      if (data.length > 1) {
        const pts = data
          .map((v, i) => {
            const px = gx + (i / (data.length - 1)) * gw;
            const py = gy + gh - ((v - min) / range) * gh;
            return `${i === 0 ? "m" : "l"} ${px.toFixed(2)} ${py.toFixed(2)}`;
          })
          .join(" ");
        contentOps.push(`${color.r} ${color.g} ${color.b} RG ${pts} S`);
      }
    };

    if (charts?.revenue?.data || charts?.members?.data) {
      const cardW = (pageWidth - margin * 2 - 12) / 2;
      const cardH = 100;
      const yTopCards = y;
      if (charts?.revenue?.data) {
        drawSpark(
          "Przychody (sparkline)",
          charts.revenue.data,
          margin,
          yTopCards,
          cardW,
          cardH,
          { r: 0.06, g: 0.72, b: 0.51 }
        );
      }
      if (charts?.members?.data) {
        drawSpark(
          "Nowi czlonkowie (sparkline)",
          charts.members.data,
          margin + cardW + 12,
          yTopCards,
          cardW,
          cardH,
          { r: 0.23, g: 0.51, b: 0.96 }
        );
      }
      y -= cardH + 16;
    }

    // TABELA TOP PERFORMERS
    if (performers.length) {
      const tableW = pageWidth - margin * 2;
      const colName = Math.floor(tableW * 0.5);
      const colRevenue = Math.floor(tableW * 0.25);
      const colMembers = tableW - colName - colRevenue;
      const rowH = 18;

      // naglowek
      contentOps.push(
        `0.93 0.96 1 rg ${margin} ${y - rowH} ${tableW} ${rowH} re f`
      );
      contentOps.push("0 0 0 rg BT /F1 12 Tf");
      contentOps.push(`1 0 0 1 ${margin + 6} ${y - 13} Tm (Nazwa) Tj`);
      contentOps.push(
        `1 0 0 1 ${margin + colName + 6} ${y - 13} Tm (Przychody) Tj`
      );
      contentOps.push(
        `1 0 0 1 ${margin + colName + colRevenue + 6} ${
          y - 13
        } Tm (Czlonkowie) Tj ET`
      );
      // pionowe linie kolumn
      contentOps.push(`0 0 0 RG ${margin} ${y - rowH} ${tableW} ${rowH} re S`);
      contentOps.push(
        `0.85 0.85 0.9 RG ${margin + colName} ${y - rowH} 0 ${rowH} S`
      );
      contentOps.push(
        `0.85 0.85 0.9 RG ${margin + colName + colRevenue} ${
          y - rowH
        } 0 ${rowH} S`
      );
      y -= rowH;

      performers.slice(0, 8).forEach((p) => {
        contentOps.push(
          `0.99 0.99 1 rg ${margin} ${y - rowH} ${tableW} ${rowH} re f`
        );
        contentOps.push("0 0 0 rg BT /F1 12 Tf");
        contentOps.push(
          `1 0 0 1 ${margin + 6} ${y - 13} Tm (${escapePdfText(
            transliteratePolish(p.name)
          )}) Tj`
        );
        contentOps.push(
          `1 0 0 1 ${margin + colName + 6} ${y - 13} Tm (${escapePdfText(
            formatPLN(p.revenue)
          )}) Tj`
        );
        const m = p.members != null ? String(p.members) : "-";
        contentOps.push(
          `1 0 0 1 ${margin + colName + colRevenue + 6} ${
            y - 13
          } Tm (${escapePdfText(m)}) Tj ET`
        );
        contentOps.push(
          `0.9 0.9 0.95 RG ${margin} ${y - rowH} ${tableW} ${rowH} re S`
        );
        contentOps.push(
          `0.92 0.92 0.96 RG ${margin + colName} ${y - rowH} 0 ${rowH} S`
        );
        contentOps.push(
          `0.92 0.92 0.96 RG ${margin + colName + colRevenue} ${
            y - rowH
          } 0 ${rowH} S`
        );
        y -= rowH;
      });

      y -= 12;
    }

    // sekcja INSIGHTS (karty jak wcześniej)
    const boxGap = 12;
    const boxPad = 10;
    const boxInnerWidth = pageWidth - margin * 2 - 8; // miejsce na lewy pasek
    const stripeW = 6;

    if (insights.length === 0) {
      contentOps.push("0 0 0 rg BT /F1 12 Tf");
      const empty = escapePdfText("Brak wniosków do wyświetlenia.");
      contentOps.push(`1 0 0 1 ${margin} ${y} Tm (${empty}) Tj ET`);
      y -= leading;
    } else {
      insights.forEach((i) => {
        // kolory paska wg typu
        const color =
          i.type === "positive"
            ? "0.12 0.7 0.38" // zielony
            : i.type === "warning"
            ? "0.96 0.65 0.14" // pomarańcz
            : "0.2 0.45 0.9"; // niebieski

        const titleLines = wrapText(
          transliteratePolish(i.title || ""),
          boxInnerWidth - stripeW - boxPad * 2
        );
        const descLines = i.description
          ? wrapText(
              transliteratePolish(i.description),
              boxInnerWidth - stripeW - boxPad * 2
            )
          : [];
        const impLines = i.impact
          ? wrapText(
              `Wplyw: ${transliteratePolish(i.impact)}`,
              boxInnerWidth - stripeW - boxPad * 2
            )
          : [];
        const recLines = i.recommendation
          ? wrapText(
              `Rekomendacja: ${transliteratePolish(i.recommendation)}`,
              boxInnerWidth - stripeW - boxPad * 2
            )
          : [];
        const linesCount =
          titleLines.length +
          descLines.length +
          impLines.length +
          recLines.length;
        const boxH = boxPad * 2 + linesCount * leading + 6; // margines dolny

        if (y - boxH < margin) return; // proste ucięcie (bez paginacji)

        // tło boxa
        contentOps.push(
          `0.96 0.98 1 rg ${margin} ${y - boxH} ${
            pageWidth - margin * 2
          } ${boxH} re f`
        );
        // lewy pasek
        contentOps.push(
          `${color} rg ${margin} ${y - boxH} ${stripeW} ${boxH} re f`
        );

        // tekst w boxie
        let ty = y - boxPad - 4;
        const tx = margin + stripeW + boxPad;
        contentOps.push("0 0 0 rg BT /F1 12 Tf");
        titleLines.forEach((ln) => {
          contentOps.push(`1 0 0 1 ${tx} ${ty} Tm (${escapePdfText(ln)}) Tj`);
          ty -= leading;
        });
        descLines.forEach((ln) => {
          contentOps.push(`1 0 0 1 ${tx} ${ty} Tm (${escapePdfText(ln)}) Tj`);
          ty -= leading;
        });
        impLines.forEach((ln) => {
          contentOps.push(`1 0 0 1 ${tx} ${ty} Tm (${escapePdfText(ln)}) Tj`);
          ty -= leading;
        });
        recLines.forEach((ln) => {
          contentOps.push(`1 0 0 1 ${tx} ${ty} Tm (${escapePdfText(ln)}) Tj`);
          ty -= leading;
        });
        contentOps.push("ET");

        y -= boxH + boxGap;
      });
    }

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
        "Content-Disposition": `attachment; filename=raport_wnioski.pdf`,
        "Cache-Control": "no-store",
      }),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

export const GET = POST;
