const { sendMail } = require('../config/email');
const { buildWithdrawalEmail } = require('../lib/withdrawalEmail');

function normalizePayload(body) {
  const recipient = body?.recipient?.trim();
  if (!recipient) {
    throw Object.assign(new Error('recipient is required'), { status: 400 });
  }

  const withdrawal = body?.withdrawal;
  if (!withdrawal?.id) {
    throw Object.assign(new Error('withdrawal.id is required'), { status: 400 });
  }

  const amountCredits = Number(withdrawal.amountCredits);
  if (!Number.isFinite(amountCredits) || amountCredits <= 0) {
    throw Object.assign(new Error('withdrawal.amountCredits must be positive'), { status: 400 });
  }

  return {
    recipient,
    recipientName: String(body.recipientName ?? '').trim(),
    withdrawal: {
      id: String(withdrawal.id),
      amountCredits,
      completedAt: withdrawal.completedAt || new Date().toISOString(),
    },
  };
}

async function sendWithdrawalConfirmation(req, res) {
  try {
    const payload = normalizePayload(req.body || {});
    const email = buildWithdrawalEmail(payload);

    const info = await sendMail({
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    return res.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
    });
  } catch (err) {
    const status = err.status || 500;
    console.error('[sendmail] withdrawal failed:', err.message);
    return res.status(status).json({ success: false, message: err.message });
  }
}

module.exports = { sendWithdrawalConfirmation };
