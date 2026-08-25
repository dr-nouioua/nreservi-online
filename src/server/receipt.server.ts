import PDFDocument from "pdfkit";

export type ReceiptData = {
  number: string
  restaurantName: string
  tier: string
  start: string | null
  end: string
  amountDA: string | null
  issuedAt: Date
}

const fmt = (iso: string | null) => {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

/** Generates an in-memory A4 receipt PDF (FR, DA amounts). */
export function generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 56, info: { Title: `Reçu ${data.number}` } });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.font("Helvetica-Bold").fontSize(16).fillColor("#1c1917").text("nreservi.online", { continued: false });
    doc.font("Helvetica").fontSize(9).fillColor("#78716c").text("Réservation de table en ligne — Algérie");
    doc.moveDown(1.5);
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#1c1917").text("Reçu de renouvellement");
    doc.font("Helvetica").fontSize(10).fillColor("#78716c").text(`N° ${data.number}`);
    doc.text(`Émis le ${data.issuedAt.toLocaleDateString("fr-FR")} à ${data.issuedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`);
    doc.moveDown(1.5);

    doc.font("Helvetica-Bold").fontSize(12).fillColor("#1c1917").text(data.restaurantName);
    doc.font("Helvetica").fontSize(11).fillColor("#44403c");
    doc.text(`Formule : ${data.tier === "premium" ? "Premium" : "Basique"}`);
    doc.text(`Période : du ${fmt(data.start)} au ${fmt(data.end)}`);
    doc.moveDown(1);

    if (data.amountDA) {
      const y = doc.y;
      doc.roundedRect(56, y, 483, 44, 8).fillAndStroke("#ecfccb", "#a3e635");
      doc.fillColor("#1c1917").font("Helvetica-Bold").fontSize(14)
        .text(`Montant : ${data.amountDA} DA`, 72, y + 15);
      doc.y = y + 56;
    }

    doc.moveDown(1.5);
    doc.font("Helvetica").fontSize(9).fillColor("#78716c")
      .text("Ce reçu atteste du renouvellement de l'abonnement décrit ci-dessus. Document généré électroniquement par nreservi.online.", 56, doc.y, { width: 483 });
    doc.end();
  });
}
