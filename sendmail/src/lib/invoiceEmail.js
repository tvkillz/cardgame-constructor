const { escapeHtml, renderBrandedEmail, siteUrl, brandName } = require('./emailTemplate');
const { getBrand } = require('./siteBrands');
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

function invoicePanelStyle(palette) {
  const isLight = palette.colorScheme === 'light';
  return {
    border: palette.border,
    background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(14, 16, 24, 0.55)',
    label: palette.muted,
    value: isLight ? palette.text : '#ffffff',
    accent: palette.accentBright,
  };
}

function buildInvoiceEmail(payload) {
  const { recipient, order, lineItems, buyer, seller, paymentMethod } = payload;
  const brand = getBrand(payload.siteId || 'voidborn');
  const palette = brand.palette;
  const panel = invoicePanelStyle(palette);
  const ref = displayOrderRef(order);
  const name = buyerDisplayName(buyer);
  const addressLines = buyerAddressLines(buyer);
  const paidAt = formatInvoiceDate(order.paidAt);
  const portalUrl = siteUrl(brand);
  const firstName = buyer?.firstName?.trim() || '';
  const greeting = brand.greetingName(firstName || (name !== 'Customer' ? name : ''));

  const subject = `Your ${brandName(brand)} invoice — Order ${ref}`;

  const addressHtml = addressLines.length
    ? `<ul style="margin:8px 0 0;padding:0 0 0 18px;color:${palette.text};">${addressLines
        .map((line) => `<li style="margin:0 0 4px;">${escapeHtml(line)}</li>`)
        .join('')}</ul>`
    : '';

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${palette.body};">
      Thank you for your purchase. Your payment was received on <strong>${escapeHtml(paidAt)}</strong>.
      A PDF copy of this invoice is attached to this email.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 8px;width:100%;">
      <tr>
        <td style="padding:12px 14px;border:1px solid ${panel.border};border-radius:6px;background:${panel.background};">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${panel.label};">Invoice</p>
          <p style="margin:0;font-size:14px;color:${panel.accent};font-weight:700;">#${escapeHtml(ref)}</p>
        </td>
        <td width="12"></td>
        <td style="padding:12px 14px;border:1px solid ${panel.border};border-radius:6px;background:${panel.background};">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${panel.label};">Bill to</p>
          <p style="margin:0;font-size:14px;color:${panel.value};font-weight:600;">${escapeHtml(name)}</p>
          ${addressHtml}
        </td>
      </tr>
    </table>
    ${renderInvoiceSummaryTable({ lineItems, order, paymentMethod, palette })}
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:${palette.muted};">
      Sold by <strong style="color:${palette.text};">${escapeHtml(seller.companyName)}</strong>
      (${escapeHtml(seller.companyNumber)}). ${escapeHtml(seller.address)}
    </p>`;

  const textGreeting = greeting.replace(/\.$/, '');
  const text = [
    `${textGreeting}.`,
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
    `— ${brandName(brand)}`,
  ].join('\n');

  return {
    to: recipient,
    subject,
    brand,
    html: renderBrandedEmail(brand, {
      title: subject,
      headline: 'Payment Received',
      greeting,
      bodyHtml,
      ctaLabel: brand.id === 'iyashikei' ? 'Visit Market' : 'Open Portal',
      ctaUrl: `${portalUrl}/portal/market`,
      footerNote: `Your PDF invoice is attached. Questions? Contact ${seller.email}.`,
    }),
    text,
  };
}

module.exports = { buildInvoiceEmail };
