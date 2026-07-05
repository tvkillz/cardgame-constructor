const { sendMail, verifySmtp, fromAddress } = require('../config/email');
const { buildSignupPreviewEmail, buildRecoveryPreviewEmail } = require('../lib/authEmails');
const { defaultSeller, normalizeInvoicePayload } = require('../lib/invoicePayload');
const { buildInvoiceEmail } = require('../lib/invoiceEmail');
const { buildInvoicePdf } = require('../lib/invoicePdf');

function normalizeRecipients(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [String(value)];
}

async function sendEmail(req, res) {
  try {
    const { recipients, cc, subject, body, text, attachments } = req.body || {};

    const to = normalizeRecipients(recipients);
    if (!to.length) {
      return res.status(400).json({ success: false, message: 'recipients is required' });
    }
    if (!subject || (!body && !text)) {
      return res.status(400).json({
        success: false,
        message: 'subject and body (or text) are required',
      });
    }

    const info = await sendMail({
      to: to.join(', '),
      cc: normalizeRecipients(cc).join(', ') || undefined,
      subject,
      html: body,
      text,
      attachments,
    });

    return res.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
    });
  } catch (err) {
    console.error('[sendmail] send failed:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function smtpHealth(_req, res) {
  try {
    await verifySmtp();
    return res.json({
      success: true,
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 465,
        user: process.env.SMTP_USER,
        from: fromAddress(),
      },
    });
  } catch (err) {
    console.error('[sendmail] smtp health failed:', err.message);
    return res.status(503).json({ success: false, message: err.message });
  }
}

async function sendTestEmail(req, res) {
  try {
    const defaults = (process.env.TEST_EMAIL_RECIPIENTS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const requested = normalizeRecipients(req.body?.recipients);
    const to = requested.length ? requested : defaults;

    if (!to.length) {
      return res.status(400).json({
        success: false,
        message: 'Set TEST_EMAIL_RECIPIENTS in .env or POST { "recipients": ["you@example.com"] }',
      });
    }

    const template = String(req.body?.template || 'signup').toLowerCase();
    let preview;

    if (template === 'recovery') {
      preview = buildRecoveryPreviewEmail();
    } else if (template === 'invoice') {
      const stamp = new Date().toISOString();
      const payload = normalizeInvoicePayload({
        recipient: to[0],
        order: {
          id: '00000000-0000-4000-8000-000000preview',
          orderNumber: 'VB-PREVIEW',
          paidAt: stamp,
          totalCents: 1000,
          currency: 'eur',
          creditsGranted: 1000,
        },
        lineItems: [
          { title: 'Credits', quantity: 1000, unitPriceCents: 1, lineTotalCents: 1000 },
        ],
        buyer: {
          firstName: 'Ada',
          lastName: 'Lovelace',
          addressLine1: '1 Analytical Engine Way',
          city: 'London',
          postalCode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
        seller: defaultSeller(),
        paymentMethod: 'Test payment',
      });
      const email = buildInvoiceEmail(payload);
      const pdfBuffer = await buildInvoicePdf(payload);
      const info = await sendMail({
        to: to.join(', '),
        subject: `[Preview] ${email.subject}`,
        html: email.html,
        text: email.text,
        attachments: [
          {
            filename: 'VOIDBORN-invoice-PREVIEW.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
      return res.json({
        success: true,
        messageId: info.messageId,
        accepted: info.accepted,
        recipients: to,
        template,
      });
    } else {
      preview = buildSignupPreviewEmail();
    }

    const info = await sendMail({
      to: to.join(', '),
      subject: preview.subject,
      html: preview.html,
      text: preview.text,
    });

    return res.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      recipients: to,
      template,
    });
  } catch (err) {
    console.error('[sendmail] test send failed:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  sendEmail,
  smtpHealth,
  sendTestEmail,
};
