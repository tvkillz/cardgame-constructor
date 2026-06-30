const { escapeHtml, renderPortalEmail, siteUrl, brandName } = require('./emailTemplate');
const { shortOrderId, formatInvoiceDate } = require('./invoiceFormat');

function formatCredits(amount) {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat('en-GB').format(n);
}

function buildWithdrawalEmail(payload) {
  const { recipient, withdrawal, recipientName } = payload;
  const ref = shortOrderId(withdrawal.id);
  const name = recipientName?.trim() || 'Traveler';
  const completedAt = formatInvoiceDate(withdrawal.completedAt);
  const credits = formatCredits(withdrawal.amountCredits);
  const portalUrl = siteUrl();

  const subject = `Your ${brandName()} withdrawal — ${ref}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#ffffff;">
      Your withdrawal request was approved on <strong>${escapeHtml(completedAt)}</strong>.
      <strong style="color:#f3d878;">${escapeHtml(credits)} credits</strong> have been sent for payout processing.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0;width:100%;">
      <tr>
        <td style="padding:12px 14px;border:1px solid rgba(123,77,255,0.2);border-radius:6px;background:rgba(14,16,24,0.55);">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(232,220,200,0.55);">Reference</p>
          <p style="margin:0;font-size:14px;color:#f3d878;font-weight:700;">#${escapeHtml(ref)}</p>
        </td>
        <td width="12"></td>
        <td style="padding:12px 14px;border:1px solid rgba(123,77,255,0.2);border-radius:6px;background:rgba(14,16,24,0.55);">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(232,220,200,0.55);">Amount</p>
          <p style="margin:0;font-size:14px;color:#ffffff;font-weight:600;">${escapeHtml(credits)} credits</p>
        </td>
      </tr>
    </table>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:rgba(232,220,200,0.75);">
      Payout timing depends on your payment provider. You can review this withdrawal in your portal transaction history.
    </p>`;

  const text = [
    `Greetings, ${name}.`,
    '',
    'Your withdrawal was approved.',
    '',
    `Reference: #${ref}`,
    `Amount: ${credits} credits`,
    `Completed: ${completedAt}`,
    '',
    `Portal: ${portalUrl}/portal/transactions`,
    '',
    `— ${brandName()}`,
  ].join('\n');

  return {
    to: recipient,
    subject,
    html: renderPortalEmail({
      title: subject,
      headline: 'Withdrawal Confirmed',
      greeting: `Greetings, ${name}.`,
      bodyHtml,
      ctaLabel: 'View Transactions',
      ctaUrl: `${portalUrl}/portal/transactions`,
      footerNote: `This confirms your approved withdrawal from ${brandName()}.`,
    }),
    text,
  };
}

module.exports = { buildWithdrawalEmail };
