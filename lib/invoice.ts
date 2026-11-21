export interface InvoiceData {
  bookingId?: string;
  serviceTitle: string;
  category?: string;
  technicianName: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  currency?: string;
  transactionId: string;
  paidAt?: string | Date;
}

export function printInvoice(data: InvoiceData): void {
  const paidAt = data.paidAt
    ? new Date(data.paidAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Just now";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>FixBench Invoice - ${escapeHtml(data.serviceTitle)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 32px; color: #0f172a; }
    .card { max-width: 720px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo { width: 40px; height: 40px; border-radius: 12px; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    h1 { margin: 0; font-size: 22px; }
    .subtitle { color: #64748b; font-size: 12px; margin-top: 4px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .label { color: #64748b; }
    .value { font-weight: 600; text-align: right; }
    .amount { font-size: 20px; color: #059669; font-weight: 800; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 700; font-size: 12px; }
    .footer { margin-top: 24px; text-align: center; color: #94a3b8; font-size: 11px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">
      <div class="logo">FB</div>
      <div>
        <h1>FixBench Repair Invoice</h1>
        <div class="subtitle">Verified Repair & Home-Appliance Service Platform</div>
      </div>
    </div>
    <div style="margin: 20px 0;">
      <span class="badge">PAID</span>
    </div>
    ${data.bookingId ? `<div class="row"><span class="label">Booking ID</span><span class="value">${escapeHtml(data.bookingId)}</span></div>` : ""}
    <div class="row"><span class="label">Service</span><span class="value">${escapeHtml(data.serviceTitle)}</span></div>
    ${data.category ? `<div class="row"><span class="label">Category</span><span class="value">${escapeHtml(data.category)}</span></div>` : ""}
    <div class="row"><span class="label">Technician</span><span class="value">${escapeHtml(data.technicianName)}</span></div>
    <div class="row"><span class="label">Customer</span><span class="value">${escapeHtml(data.customerName)}${data.customerEmail ? ` (${escapeHtml(data.customerEmail)})` : ""}</span></div>
    <div class="row"><span class="label">Transaction ID</span><span class="value">${escapeHtml(data.transactionId)}</span></div>
    <div class="row"><span class="label">Paid On</span><span class="value">${escapeHtml(paidAt)}</span></div>
    <div class="row"><span class="label">Amount Paid</span><span class="value amount">$${Number(data.amount || 0).toFixed(2)} ${(data.currency || "usd").toUpperCase()}</span></div>
    <div class="footer">Thank you for choosing FixBench. This receipt confirms your repair payment.</div>
  </div>
  <script>window.onload = function(){ window.print(); };</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) {
    alert("Please allow pop-ups to download the invoice.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}