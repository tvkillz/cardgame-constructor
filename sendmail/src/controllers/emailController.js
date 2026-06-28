const { sendMail, verifySmtp, fromAddress } = require('../config/email');

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

    const stamp = new Date().toISOString();
    const info = await sendMail({
      to: to.join(', '),
      subject: `VOIDBORN sendmail test ${stamp}`,
      html: `<p>SMTP relay test from <strong>voidborn sendmail</strong>.</p><p>Time: ${stamp}</p>`,
      text: `VOIDBORN sendmail SMTP test at ${stamp}`,
    });

    return res.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      recipients: to,
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
