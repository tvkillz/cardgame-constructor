const { PORTAL } = require('./emailTemplate');

function shortOrderId(orderId) {
  return String(orderId ?? '').replace(/-/g, '').slice(0, 8).toUpperCase();
}

/** Public order reference — prefer stored order_number (VB-XXXXXXXX). */
function displayOrderRef(order) {
  const orderNumber = order?.orderNumber ?? order?.order_number;
  if (typeof orderNumber === 'string' && orderNumber.trim()) return orderNumber.trim();
  return shortOrderId(order?.id);
}

function formatMoney(cents, currency = 'eur') {
  const amount = (Number(cents) || 0) / 100;
  const code = String(currency).toUpperCase();
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: code }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${code}`;
  }
}

function formatInvoiceDate(iso) {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buyerDisplayName(buyer) {
  return [buyer?.firstName, buyer?.lastName].filter(Boolean).join(' ').trim() || 'Customer';
}

function buyerAddressLines(buyer) {
  const lines = [];
  if (buyer?.addressLine1?.trim()) lines.push(buyer.addressLine1.trim());
  if (buyer?.addressLine2?.trim()) lines.push(buyer.addressLine2.trim());
  const cityLine = [buyer?.postalCode, buyer?.city].filter((s) => s?.trim()).join(' ').trim();
  if (cityLine) lines.push(cityLine);
  if (buyer?.stateProvince?.trim()) lines.push(buyer.stateProvince.trim());
  if (buyer?.country?.trim()) lines.push(buyer.country.trim());
  return lines;
}

function formatQuantity(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('en-GB').format(n);
}

/** Row total in cents — use explicit lineTotalCents when set (credit packs). */
function lineTotalCents(line) {
  if (line.lineTotalCents != null && line.lineTotalCents >= 0) {
    return Number(line.lineTotalCents);
  }
  return (Number(line.unitPriceCents) || 0) * (Number(line.quantity) || 1);
}

/** Shared portal-styled summary table for invoice HTML emails. */
function renderInvoiceSummaryTable({ lineItems, order, paymentMethod }) {
  const rows = (lineItems ?? []).map((line) => {
    const qty = line.quantity ?? 1;
    const unit = formatMoney(line.unitPriceCents, order.currency);
    const total = formatMoney(lineTotalCents(line), order.currency);
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid ${PORTAL.purpleBorder};color:${PORTAL.body};">${line.title}</td>
        <td style="padding:10px 12px;border-bottom:1px solid ${PORTAL.purpleBorder};color:${PORTAL.text};text-align:center;">${formatQuantity(qty)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid ${PORTAL.purpleBorder};color:${PORTAL.text};text-align:right;">${unit}</td>
        <td style="padding:10px 12px;border-bottom:1px solid ${PORTAL.purpleBorder};color:${PORTAL.goldBright};text-align:right;font-weight:700;">${total}</td>
      </tr>`;
  }).join('');

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="margin:20px 0 0;border:1px solid ${PORTAL.purpleBorder};border-radius:6px;overflow:hidden;">
      <thead>
        <tr style="background:rgba(14,16,24,0.85);">
          <th align="left" style="padding:10px 12px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${PORTAL.muted};">Item</th>
          <th style="padding:10px 12px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${PORTAL.muted};">Qty</th>
          <th align="right" style="padding:10px 12px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${PORTAL.muted};">Unit</th>
          <th align="right" style="padding:10px 12px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${PORTAL.muted};">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:12px;font-size:13px;color:${PORTAL.text};text-align:right;">Total incl. VAT</td>
          <td style="padding:12px;font-size:15px;font-weight:700;color:${PORTAL.goldBright};text-align:right;">
            ${formatMoney(order.totalCents, order.currency)}
          </td>
        </tr>
        <tr>
          <td colspan="4" style="padding:0 12px 12px;font-size:12px;color:${PORTAL.muted};">
            Payment method: ${paymentMethod || 'Card'}
          </td>
        </tr>
      </tfoot>
    </table>`;
}

module.exports = {
  shortOrderId,
  displayOrderRef,
  formatMoney,
  formatQuantity,
  formatInvoiceDate,
  buyerDisplayName,
  buyerAddressLines,
  lineTotalCents,
  renderInvoiceSummaryTable,
};
