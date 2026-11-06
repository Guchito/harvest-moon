import PDFDocument from "pdfkit";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getSite } from "@/lib/content";
import { isQuoteAuthenticated } from "@/lib/quote-auth";

export const runtime = "nodejs";

const MARGIN = 48;
const NIGHT = "#0a0820";
const ACCENT = "#8f84ff";
const PAPER = "#f2f0ff";
const MUTED = "#c4c0e6";
const INK = "#17142b";
const BORDER = "#e5e2ef";
const MAX_BODY_BYTES = 64 * 1024;
const MAX_TIERS = 12;
const MAX_LINE_ITEMS = 20;
const MAX_LINE_ITEM_PRICE_CENTS = 10_000_000_000;
const MAX_TIER_TOTAL_CENTS = 10_000_000_000;
const TIER_PHOTOS = ["servicios-1.jpg", "servicios-2.jpg", "servicios-3.jpg"];

type QuoteTier = {
  name: string;
  totalPriceCents: number;
  visibleItems: string[];
};

type QuoteLineItem = {
  description: string;
  priceCents: number;
  hidden: boolean;
};

type QuoteInput = {
  client: string;
  date: string;
  place: string;
  guests: number;
  schedule: string;
  tiers: QuoteTier[];
  terms: string;
};

type QuoteSubmission = Omit<QuoteInput, "tiers"> & {
  tiers: {
    name: string;
    lineItems: QuoteLineItem[];
  }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidDate(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isQuoteInput(value: unknown): value is QuoteSubmission {
  if (!isRecord(value)) return false;
  const { client, date, place, guests, schedule, tiers, terms } = value;

  if (
    typeof client !== "string" ||
    !client.trim() ||
    client.length > 150 ||
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !isValidDate(date) ||
    typeof place !== "string" ||
    !place.trim() ||
    place.length > 200 ||
    typeof guests !== "number" ||
    !Number.isInteger(guests) ||
    guests < 1 ||
    guests > 100000 ||
    typeof schedule !== "string" ||
    !schedule.trim() ||
    schedule.length > 100 ||
    typeof terms !== "string" ||
    terms.length > 4000 ||
    !Array.isArray(tiers) ||
    tiers.length < 1 ||
    tiers.length > MAX_TIERS
  ) {
    return false;
  }

  return tiers.every(
    (tier) => {
      if (
        !isRecord(tier) ||
        typeof tier.name !== "string" ||
        !tier.name.trim() ||
        tier.name.length > 70 ||
        !Array.isArray(tier.lineItems) ||
        tier.lineItems.length < 1 ||
        tier.lineItems.length > MAX_LINE_ITEMS
      ) {
        return false;
      }

      let totalPriceCents = 0;
      for (const lineItem of tier.lineItems) {
        if (
          !isRecord(lineItem) ||
          typeof lineItem.description !== "string" ||
          !lineItem.description.trim() ||
          lineItem.description.length > 200 ||
          typeof lineItem.priceCents !== "number" ||
          !Number.isSafeInteger(lineItem.priceCents) ||
          lineItem.priceCents < 0 ||
          lineItem.priceCents > MAX_LINE_ITEM_PRICE_CENTS ||
          typeof lineItem.hidden !== "boolean"
        ) {
          return false;
        }

        totalPriceCents += lineItem.priceCents;
        if (totalPriceCents > MAX_TIER_TOTAL_CENTS) return false;
      }

      return true;
    },
  );
}

function wrapText(doc: PDFKit.PDFDocument, text: string, width: number, fontSize: number) {
  doc.font("Helvetica").fontSize(fontSize);
  const output: string[] = [];

  for (const paragraph of text.split(/\r?\n/)) {
    if (!paragraph.trim()) {
      output.push("");
      continue;
    }

    let line = "";
    for (const word of paragraph.trim().split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (doc.widthOfString(candidate) <= width) {
        line = candidate;
      } else if (line) {
        output.push(line);
        line = word;
      } else {
        let part = "";
        for (const character of word) {
          if (doc.widthOfString(part + character) > width && part) {
            output.push(part);
            part = character;
          } else {
            part += character;
          }
        }
        line = part;
      }
    }
    if (line) output.push(line);
  }

  return output;
}

function money(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function eventDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function generateQuotePdf(quote: QuoteInput) {
  const site = getSite();

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      bufferPages: true,
      info: {
        Title: `Presupuesto para ${quote.client} · ${site.name}`,
        Author: site.name,
        Subject: "Propuesta de presupuesto para evento",
      },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.registerFont("ArchivoBlack", path.join(process.cwd(), "src/lib/fonts/Archivo-Black.ttf"));

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - MARGIN * 2;
    const pageBottom = pageHeight - MARGIN - 38;
    let cursorY = 0;
    const coverPhoto = path.join(process.cwd(), "public/media/pages/evento-noche.jpg");
    const closingPhoto = path.join(process.cwd(), "public/media/pages/boda-cornelia-hueso.jpg");
    const logoSvgPath = path.join(process.cwd(), "public/symbol.svg");
    const tierPhotos = TIER_PHOTOS.map((photo) => path.join(process.cwd(), "public/media/pages", photo));
    const logoSvg = readFileSync(logoSvgPath, "utf8");
    const logoPaths = [...logoSvg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map((match) => match[1]);
    if (logoPaths.length === 0) throw new Error("Harvest Moon logo SVG contains no paths");

    function startTierPage(continuation: boolean) {
      doc.addPage();
      doc.rect(0, 0, pageWidth, pageHeight).fill("#ffffff");
      doc.rect(0, 0, pageWidth, 5).fill(ACCENT);
      drawLogo(MARGIN, 17, 24, NIGHT);
      doc.font("ArchivoBlack").fontSize(12).fillColor(NIGHT)
        .text(site.name.toUpperCase(), MARGIN + 32, 23, { lineBreak: false });
      doc.font("Helvetica").fontSize(8).fillColor("#77728f")
        .text("PROPUESTA PERSONALIZADA", MARGIN, 26, {
          width: contentWidth,
          align: "right",
          lineBreak: false,
        });
      doc.moveTo(MARGIN, 52).lineTo(pageWidth - MARGIN, 52).lineWidth(0.7).stroke(BORDER);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(ACCENT)
        .text(continuation ? "OPCIONES · CONTINUACIÓN" : "OPCIONES A MEDIDA", MARGIN, 69, {
          characterSpacing: 1.2,
          lineBreak: false,
        });
      doc.font("ArchivoBlack").fontSize(21).fillColor(NIGHT)
        .text("Una experiencia a vuestro ritmo", MARGIN, 84, {
          width: contentWidth,
          lineBreak: false,
        });
      cursorY = 126;
    }

    function ensureSpace(height: number) {
      if (cursorY + height > pageBottom) startTierPage(true);
    }

    function drawCroppedImage(source: string, x: number, y: number, width: number, height: number) {
      doc.save();
      doc.rect(x, y, width, height).clip();
      doc.image(source, x, y, {
        cover: [width, height],
        align: "center",
        valign: "center",
      });
      doc.restore();
    }

    function drawLogo(x: number, y: number, size: number, color: string) {
      doc.save();
      doc.translate(x, y).scale(size / 80).translate(-10, -10);
      for (const logoPath of logoPaths) {
        doc.path(logoPath).fill(color);
      }
      doc.restore();
    }

    function tierDimensions(tier: QuoteTier) {
      const imageWidth = 176;
      const imageGap = 24;
      const textX = MARGIN + imageWidth + imageGap;
      const textWidth = contentWidth - imageWidth - imageGap;
      const priceWidth = 112;
      const titleWidth = textWidth - priceWidth - 10;

      doc.font("ArchivoBlack").fontSize(18);
      const titleHeight = doc.heightOfString(tier.name, { width: titleWidth });
      doc.font("Helvetica").fontSize(9.5);
      const featureHeights = tier.visibleItems.map(
        (item) => doc.heightOfString(item, { width: textWidth - 14, lineGap: 2 }) + 5,
      );
      const featureHeight = featureHeights.reduce((total, height) => total + height, 0);
      const rowHeight = Math.max(184, titleHeight + 66 + (tier.visibleItems.length ? featureHeight + 14 : 0));

      return { imageWidth, textX, textWidth, priceWidth, titleWidth, titleHeight, featureHeights, rowHeight };
    }

    doc.rect(0, 0, pageWidth, pageHeight).fill("#ffffff");
    const coverHeight = 340;
    drawCroppedImage(coverPhoto, 0, 0, pageWidth, coverHeight);
    doc.rect(0, 0, pageWidth, coverHeight).fillOpacity(0.55).fill(NIGHT).fillOpacity(1);
    drawLogo(MARGIN, 32, 38, PAPER);
    doc.font("ArchivoBlack").fontSize(14).fillColor(PAPER)
      .text(site.name.toUpperCase(), MARGIN + 49, 36, { lineBreak: false });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED)
      .text("PROPUESTA PERSONALIZADA", MARGIN + 49, 55, { characterSpacing: 1.1, lineBreak: false });
    doc.font("Helvetica-Bold").fontSize(8).fillColor(ACCENT)
      .text("PARA", MARGIN, 165, { characterSpacing: 1.4, lineBreak: false });
    const clientFontSize = quote.client.length > 75 ? 18 : quote.client.length > 42 ? 22 : 28;
    doc.font("ArchivoBlack").fontSize(clientFontSize).fillColor(PAPER)
      .text(quote.client, MARGIN, 183, { width: contentWidth, height: 70 });
    doc.font("Helvetica").fontSize(10).fillColor(MUTED)
      .text(eventDate(quote.date), MARGIN, 258, { lineBreak: false });
    doc.rect(0, coverHeight - 4, pageWidth, 4).fill(ACCENT);

    cursorY = coverHeight + 42;
    doc.font("Helvetica-Bold").fontSize(8).fillColor(ACCENT)
      .text("EL EVENTO", MARGIN, cursorY, { characterSpacing: 1.4, lineBreak: false });
    doc.font("ArchivoBlack").fontSize(22).fillColor(NIGHT)
      .text("Detalles", MARGIN, cursorY + 14, { lineBreak: false });
    cursorY += 54;

    const details = [
      ["FECHA", eventDate(quote.date)],
      ["LUGAR", quote.place],
      ["INVITADOS", quote.guests.toLocaleString("es-ES")],
      ["HORARIO", quote.schedule],
    ];
    const detailGap = 28;
    const detailWidth = (contentWidth - detailGap) / 2;
    const detailRows = [details.slice(0, 2), details.slice(2)];
    for (const row of detailRows) {
      doc.moveTo(MARGIN, cursorY).lineTo(pageWidth - MARGIN, cursorY).lineWidth(0.6).stroke(BORDER);
      const rowHeight = Math.max(
        ...row.map(([, value]) => {
          doc.font("Helvetica").fontSize(12);
          return doc.heightOfString(value, { width: detailWidth }) + 40;
        }),
        60,
      );
      row.forEach(([label, value], index) => {
        const x = MARGIN + index * (detailWidth + detailGap);
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#77728f")
          .text(label, x, cursorY + 12, { characterSpacing: 1, lineBreak: false });
        doc.font("Helvetica").fontSize(12).fillColor(INK)
          .text(value, x, cursorY + 29, { width: detailWidth });
      });
      cursorY += rowHeight;
    }

    cursorY += 23;
    doc.rect(MARGIN, cursorY, 34, 3).fill(ACCENT);
    doc.font("Helvetica").fontSize(9).fillColor("#77728f")
      .text("Una propuesta creada a la medida de vuestro evento.", MARGIN, cursorY + 13, {
        width: contentWidth,
        lineBreak: false,
      });

    const termsLines = quote.terms.trim() ? wrapText(doc, quote.terms.trim(), contentWidth, 9) : [];
    const termsHeight = termsLines.reduce((height, line) => height + (line ? 13 : 7), 0);
    startTierPage(false);

    quote.tiers.forEach((tier, index) => {
      const dimensions = tierDimensions(tier);
      ensureSpace(dimensions.rowHeight + 25);

      const { imageWidth, textX, textWidth, priceWidth, titleWidth, titleHeight, featureHeights, rowHeight } = dimensions;
      const tierPhoto = tierPhotos[index % tierPhotos.length];
      drawCroppedImage(tierPhoto, MARGIN, cursorY, imageWidth, rowHeight);
      doc.rect(MARGIN, cursorY, imageWidth, rowHeight).lineWidth(0.7).stroke(BORDER);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(ACCENT)
        .text(`${String(index + 1).padStart(2, "0")}  /  ${String(quote.tiers.length).padStart(2, "0")}`, textX, cursorY + 2, {
          characterSpacing: 1,
          lineBreak: false,
        });
      doc.font("ArchivoBlack").fontSize(18).fillColor(NIGHT)
        .text(tier.name, textX, cursorY + 19, {
          width: titleWidth,
          height: titleHeight + 2,
        });
      doc.font("Helvetica-Bold").fontSize(15).fillColor(ACCENT)
        .text(money(tier.totalPriceCents), textX + textWidth - priceWidth, cursorY + 19, {
          width: priceWidth,
          align: "right",
          lineBreak: false,
        });

      if (tier.visibleItems.length) {
        let featureY = cursorY + 23 + titleHeight + 13;
        doc.font("Helvetica-Bold").fontSize(7).fillColor("#77728f")
          .text("INCLUYE", textX, featureY, { characterSpacing: 1.1, lineBreak: false });
        featureY += 14;
        tier.visibleItems.forEach((item, itemIndex) => {
          doc.circle(textX + 3, featureY + 5, 2).fill(ACCENT);
          doc.font("Helvetica").fontSize(9.5).fillColor(INK)
            .text(item, textX + 12, featureY, {
              width: textWidth - 12,
              height: featureHeights[itemIndex],
            });
          featureY += featureHeights[itemIndex];
        });
      }

      cursorY += rowHeight + 23;
      doc.moveTo(MARGIN, cursorY - 11).lineTo(pageWidth - MARGIN, cursorY - 11)
        .lineWidth(0.6).stroke(BORDER);
    });

    if (termsLines.length) {
      ensureSpace(termsHeight + 43);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(ACCENT)
        .text("CONDICIONES", MARGIN, cursorY, { characterSpacing: 1.2, lineBreak: false });
      cursorY += 18;
      doc.font("Helvetica").fontSize(9).fillColor(INK);
      for (const line of termsLines) {
        if (!line) {
          cursorY += 7;
          continue;
        }
        ensureSpace(13);
        doc.text(line, MARGIN, cursorY, { width: contentWidth, lineBreak: false });
        cursorY += 13;
      }
      cursorY += 13;
    }

    doc.addPage();
    drawCroppedImage(closingPhoto, 0, 0, pageWidth, pageHeight);
    doc.rect(0, 0, pageWidth, pageHeight).fillOpacity(0.68).fill(NIGHT).fillOpacity(1);
    doc.rect(MARGIN, 62, 3, 44).fill(ACCENT);
    drawLogo(MARGIN + 18, 60, 48, PAPER);
    doc.font("ArchivoBlack").fontSize(20).fillColor(PAPER)
      .text(site.name, MARGIN + 79, 67, { lineBreak: false });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED)
      .text("MÚSICA Y EXPERIENCIAS PARA CELEBRAR", MARGIN + 79, 94, {
        characterSpacing: 1.1,
        lineBreak: false,
      });

    doc.rect(MARGIN, 210, 38, 3).fill(ACCENT);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(ACCENT)
      .text("EL SIGUIENTE PASO", MARGIN, 228, { characterSpacing: 1.4, lineBreak: false });
    doc.font("ArchivoBlack").fontSize(30).fillColor(PAPER)
      .text("Hablemos de vuestra fecha", MARGIN, 249, {
        width: contentWidth,
        height: 78,
      });
    doc.font("Helvetica").fontSize(11).fillColor(MUTED)
      .text("Nos encantará ayudaros a crear una celebración inolvidable.", MARGIN, 337, {
        width: contentWidth,
        lineBreak: false,
      });

    const contactTop = 407;
    const contactGap = 24;
    const contactColumnWidth = (contentWidth - contactGap) / 2;
    const contacts = [
      { label: "DIRECCIÓN", value: site.address, x: MARGIN, y: contactTop, width: contentWidth },
      { label: "EMAIL", value: site.email, x: MARGIN, y: contactTop + 83, width: contactColumnWidth },
      {
        label: "TELÉFONO",
        value: site.phone,
        x: MARGIN + contactColumnWidth + contactGap,
        y: contactTop + 83,
        width: contactColumnWidth,
      },
    ];
    for (const contact of contacts) {
      doc.moveTo(contact.x, contact.y).lineTo(contact.x + contact.width, contact.y)
        .lineWidth(0.6).strokeColor("#ffffff").strokeOpacity(0.35).stroke().strokeOpacity(1);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(ACCENT)
        .text(contact.label, contact.x, contact.y + 13, { characterSpacing: 1.2, lineBreak: false });
      doc.font("Helvetica").fontSize(12).fillColor(PAPER)
        .text(contact.value, contact.x, contact.y + 32, {
          width: contact.width,
          height: 36,
          lineGap: 3,
        });
    }

    doc.font("Helvetica").fontSize(9).fillColor(MUTED)
      .text("Gracias por confiar en Harvest Moon.", MARGIN, 650, {
        lineBreak: false,
      });

    const pageRange = doc.bufferedPageRange();
    for (let pageIndex = pageRange.start; pageIndex < pageRange.start + pageRange.count; pageIndex++) {
      doc.switchToPage(pageIndex);
      const footerLineY = pageHeight - MARGIN - 22;
      const footerTextY = pageHeight - MARGIN - 14;
      const isClosingPage = pageIndex === pageRange.start + pageRange.count - 1;
      if (pageIndex > pageRange.start) {
        doc.moveTo(MARGIN, footerLineY).lineTo(pageWidth - MARGIN, footerLineY)
          .lineWidth(0.5).strokeColor(isClosingPage ? "#ffffff" : BORDER).strokeOpacity(isClosingPage ? 0.35 : 1).stroke().strokeOpacity(1);
      }
      doc.font("Helvetica").fontSize(7.5).fillColor(isClosingPage ? MUTED : "#77728f")
        .text(`${site.name.toUpperCase()}  ·  PRESUPUESTO`, MARGIN, footerTextY, { lineBreak: false });
      const pageCountText = `${pageIndex + 1} / ${pageRange.count}`;
      const pageCountWidth = doc.widthOfString(pageCountText);
      doc.text(pageCountText, pageWidth - MARGIN - pageCountWidth, footerTextY, { lineBreak: false });
    }

    doc.end();
  });
}

export async function POST(request: Request) {
  if (!(await isQuoteAuthenticated())) {
    return Response.json({ error: "Tu sesión ha caducado. Inicia sesión de nuevo." }, { status: 401 });
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return Response.json({ error: "Formato de solicitud no válido." }, { status: 415 });
  }

  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    return Response.json({ error: "El presupuesto supera el tamaño permitido." }, { status: 413 });
  }

  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    return Response.json({ error: "No se pudieron leer los datos del presupuesto." }, { status: 400 });
  }

  if (!isQuoteInput(input)) {
    return Response.json({ error: "Completa todos los datos y revisa los nombres, textos e importes." }, { status: 400 });
  }

  try {
    const quote: QuoteInput = {
      ...input,
      tiers: input.tiers.map((tier) => ({
        name: tier.name,
        totalPriceCents: tier.lineItems.reduce((total, item) => total + item.priceCents, 0),
        visibleItems: tier.lineItems.filter((item) => !item.hidden).map((item) => item.description),
      })),
    };
    const pdf = await generateQuotePdf(quote);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="presupuesto-harvest-moon.pdf"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("quote pdf generation failed", error);
    return Response.json({ error: "No se pudo generar el PDF. Inténtalo de nuevo más tarde." }, { status: 500 });
  }
}
