const { sendMail } = require('../config/email');
const { buildInvoiceEmail } = require('../lib/invoiceEmail');
const { buildInvoicePdf, invoicePdfFilename } = require('../lib/invoicePdf');
const { displayOrderRef } = require('../lib/invoiceFormat');
const { normalizeInvoicePayload } = require('../lib/invoicePayload');

async function sendInvoice(req, res) {
  try {
    const payload = normalizeInvoicePayload(req.body || {});
    const email = buildInvoiceEmail(payload);
    const pdfBuffer = await buildInvoicePdf(payload);
    const ref = displayOrderRef(payload.order);

    const info = await sendMail({
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      brand: email.brand,
      attachments: [
        {
          filename: invoicePdfFilename(email.brand, ref),
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return res.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      invoiceRef: ref,
    });
  } catch (err) {
    const status = err.status || 500;
    console.error('[sendmail] invoice failed:', err.message);
    return res.status(status).json({ success: false, message: err.message });
  }
}

module.exports = { sendInvoice };
