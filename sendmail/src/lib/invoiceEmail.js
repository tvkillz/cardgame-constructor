const { escapeHtml, renderPortalEmail, siteUrl, brandName } = require('./emailTemplate');
const {
  displayOrderRef,
  formatMoney,
  formatQuantity,
  formatInvoiceDate,
  buyerDisplayName,
  buyerAddressLines,
  lineTotalCents,
  renderInvoiceSummaryTable,
} = require('./invoiceFormat');

function buildInvoiceEmail(payload) {
  const { recipient, order, lineItems, buyer, seller, paymentMethod } = payload;
  const ref = displayOrderRef(order);
  const name = buyerDisplayName(buyer);
  const addressLines = buyerAddressLines(buyer);
  const paidAt = formatInvoiceDate(order.paidAt);
  const portalUrl = siteUrl();

  const subject = `Your ${brandName()} invoice — Order ${ref}`;

  const addressHtml = addressLines.length
    ? `<ul style="margin:8px 0 0;padding:0 0 0 18px;color:#e8dcc8;">${addressLines
        .map((line) => `<li style="margin:0 0 4px;">${escapeHtml(line)}</li>`)
        .join('')}</ul>`
    : '';

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#ffffff;">
      Thank you for your purchase. Your payment was received on <strong>${escapeHtml(paidAt)}</strong>.
      A PDF copy of this invoice is attached to this email.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 8px;width:100%;">
      <tr>
        <td style="padding:12px 14px;border:1px solid rgba(123,77,255,0.2);border-radius:6px;background:rgba(14,16,24,0.55);">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(232,220,200,0.55);">Invoice</p>
          <p style="margin:0;font-size:14px;color:#f3d878;font-weight:700;">#${escapeHtml(ref)}</p>
        </td>
        <td width="12"></td>
        <td style="padding:12px 14px;border:1px solid rgba(123,77,255,0.2);border-radius:6px;background:rgba(14,16,24,0.55);">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(232,220,200,0.55);">Bill to</p>
          <p style="margin:0;font-size:14px;color:#ffffff;font-weight:600;">${escapeHtml(name)}</p>
          ${addressHtml}
        </td>
      </tr>
    </table>
    ${renderInvoiceSummaryTable({ lineItems, order, paymentMethod })}
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:rgba(232,220,200,0.75);">
      Sold by <strong style="color:#e8dcc8;">${escapeHtml(seller.companyName)}</strong>
      (${escapeHtml(seller.companyNumber)}). ${escapeHtml(seller.address)}
    </p>`;

  const text = [
    `Greetings, ${name}.`,
    '',
    'Payment received — your invoice is attached.',
    '',
    `Invoice #: ${ref}`,
    `Date: ${paidAt}`,
    `Total: ${formatMoney(order.totalCents, order.currency)}`,
    `Payment method: ${paymentMethod || 'Card'}`,
    '',
    'Items:',
    ...(lineItems ?? []).map((line) => {
      const qty = line.quantity ?? 1;
      return `- ${line.title} × ${formatQuantity(qty)} — ${formatMoney(lineTotalCents(line), order.currency)}`;
    }),
    '',
    `Portal: ${portalUrl}/portal/market`,
    `Support: ${seller.email}`,
    '',
    `— ${brandName()}`,
  ].join('\n');

  return {
    to: recipient,
    subject,
    html: renderPortalEmail({
      title: subject,
      headline: 'Payment Received',
      greeting: name ? `Greetings, ${name}.` : 'Greetings, traveler.',
      bodyHtml,
      ctaLabel: 'Open Portal',
      ctaUrl: `${portalUrl}/portal/market`,
      footerNote: `Your PDF invoice is attached. Questions? Contact ${seller.email}.`,
    }),
    text,
  };
}

module.exports = { buildInvoiceEmail };
