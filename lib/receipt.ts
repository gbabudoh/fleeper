/**
 * Fleeper Receipt Generator
 * Builds a clean PDF receipt using jsPDF (client-side only).
 */

interface ReceiptPool {
  name: string;
  color: string;
  percentage: number;
  amount: number;
  bankName: string | null;
  bankLastFour: string | null;
}

interface ReceiptData {
  id: string;
  paymentRef: string | null;
  description: string | null;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  status: string;
  customerEmail: string | null;
  createdAt: string;
  splits: ReceiptPool[];
}

function fmt(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export async function downloadReceipt(tx: ReceiptData) {
  // Dynamic import — jsPDF is large, only load when needed
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = doc.internal.pageSize.getWidth();

  // ── Colours ──────────────────────────────────────────────────────────────
  const INK   = [10, 10, 10]      as [number, number, number];
  const GLASS = [22, 22, 22]      as [number, number, number];
  const MINT  = [0, 255, 204]     as [number, number, number];
  const MUTED = [120, 120, 120]   as [number, number, number];
  const WHITE = [255, 255, 255]   as [number, number, number];

  // ── Background ───────────────────────────────────────────────────────────
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, 297, "F");

  // ── Header band ──────────────────────────────────────────────────────────
  doc.setFillColor(...MINT);
  doc.roundedRect(20, 14, W - 40, 28, 4, 4, "F");

  // Fleeper wordmark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text("fleeper", 30, 31);

  // "Receipt" label
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  doc.text("PAYMENT RECEIPT", W - 30, 25, { align: "right" });
  doc.text(new Date(tx.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), W - 30, 31, { align: "right" });
  doc.text(new Date(tx.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), W - 30, 37, { align: "right" });

  let y = 56;

  // ── Gross amount (hero) ───────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(...WHITE);
  doc.text(fmt(tx.grossAmount), W / 2, y, { align: "center" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(tx.description ?? "Payment", W / 2, y, { align: "center" });
  y += 14;

  // ── Ref + status pill ─────────────────────────────────────────────────────
  if (tx.paymentRef) {
    doc.setFillColor(...GLASS);
    doc.roundedRect(W / 2 - 40, y - 5, 80, 9, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`REF: ${tx.paymentRef}`, W / 2, y + 0.5, { align: "center" });
    y += 14;
  }

  // ── Divider ───────────────────────────────────────────────────────────────
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.3);
  doc.line(20, y, W - 20, y);
  y += 10;

  // ── Fee row ───────────────────────────────────────────────────────────────
  doc.setFillColor(...GLASS);
  doc.roundedRect(20, y - 4, W - 40, 14, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Fleeper Provision (2.9% + $0.30)", 27, y + 4);
  doc.setTextColor(220, 80, 80);
  doc.text(`-${fmt(tx.platformFee)}`, W - 27, y + 4, { align: "right" });
  y += 20;

  // Net
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("Net for routing", 27, y);
  doc.setTextColor(...WHITE);
  doc.text(fmt(tx.netAmount), W - 27, y, { align: "right" });
  y += 14;

  // ── Automated Routing header ──────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("AUTOMATED ROUTING", 20, y);
  y += 6;

  // ── Split rows ────────────────────────────────────────────────────────────
  for (const split of tx.splits) {
    const [r, g, b] = hexToRgb(split.color);

    // Card background
    doc.setFillColor(r, g, b, );
    // Use a tinted background (low opacity simulation via light fill)
    doc.setFillColor(Math.min(255, r + 220), Math.min(255, g + 220), Math.min(255, b + 220));
    doc.roundedRect(20, y - 1, W - 40, 18, 3, 3, "F");

    // Left colour bar
    doc.setFillColor(r, g, b);
    doc.roundedRect(20, y - 1, 3, 18, 1, 1, "F");

    // Pool name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(split.name, 30, y + 7);

    // Bank
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const bankLabel = split.bankName && split.bankLastFour
      ? `${split.bankName} ...${split.bankLastFour}`
      : "No bank linked";
    doc.text(bankLabel, 30, y + 13);

    // Percentage
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(r, g, b);
    doc.text(`${split.percentage}%`, W - 50, y + 7, { align: "right" });

    // Amount
    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    doc.text(fmt(split.amount), W - 27, y + 10, { align: "right" });

    y += 22;
  }

  y += 4;

  // ── Divider ───────────────────────────────────────────────────────────────
  doc.setDrawColor(40, 40, 40);
  doc.line(20, y, W - 20, y);
  y += 10;

  // ── Customer info ─────────────────────────────────────────────────────────
  if (tx.customerEmail) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("CUSTOMER", 20, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text(tx.customerEmail, 20, y);
    y += 12;
  }

  // ── Status ────────────────────────────────────────────────────────────────
  const statusColor: [number, number, number] =
    tx.status === "succeeded" ? MINT :
    tx.status === "failed"    ? [239, 68, 68] :
                                [255, 179, 71];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("STATUS", 20, y);
  doc.setTextColor(...statusColor);
  doc.text(tx.status === "succeeded" ? "SETTLED" : tx.status.toUpperCase(), 20, y + 6);

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = 280;
  doc.setDrawColor(40, 40, 40);
  doc.line(20, footerY, W - 20, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  doc.text("Fleeper — Automated Income Gateway · fleeper.com", W / 2, footerY + 6, { align: "center" });
  doc.text("Payments secured by Stripe · PCI DSS Compliant", W / 2, footerY + 11, { align: "center" });

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `fleeper-receipt-${tx.paymentRef ?? tx.id.slice(0, 8)}.pdf`;
  doc.save(filename);
}
