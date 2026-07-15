function brevoApiKey() {
  return (process.env.BREVO_API_KEY || '').trim();
}

function fromAddress() {
  const name = process.env.BREVO_SENDER_NAME || process.env.SMTP_FROM_NAME || process.env.SMTP_SENDER_NAME || 'Mail';
  const email =
    process.env.BREVO_SENDER_EMAIL || process.env.SMTP_ADMIN_EMAIL || process.env.SMTP_USER;
  if (!email) {
    throw new Error('BREVO_SENDER_EMAIL (or SMTP_ADMIN_EMAIL) is not configured');
  }
  return { name, email };
}

function parseRecipientList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function mapAttachments(attachments) {
  if (!Array.isArray(attachments) || attachments.length === 0) return undefined;

  return attachments.map((att) => {
    const content = Buffer.isBuffer(att.content)
      ? att.content.toString('base64')
      : String(att.content ?? '');
    const mapped = {
      name: att.filename || att.name || 'attachment',
      content,
    };
    if (att.cid) mapped.contentId = att.cid;
    return mapped;
  });
}

async function verifyBrevo() {
  const apiKey = brevoApiKey();
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const res = await fetch('https://api.brevo.com/v3/account', {
    headers: {
      'api-key': apiKey,
      accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Brevo account check failed (${res.status}): ${errText}`);
  }

  return res.json();
}

async function sendViaBrevo({ to, cc, subject, html, text, attachments }) {
  const apiKey = brevoApiKey();
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const sender = fromAddress();
  const toList = parseRecipientList(to);
  if (!toList.length) {
    throw new Error('At least one recipient is required');
  }

  const body = {
    sender,
    to: toList.map((email) => ({ email })),
    subject,
  };

  if (html) body.htmlContent = html;
  if (text) body.textContent = text;

  const ccList = parseRecipientList(cc);
  if (ccList.length) {
    body.cc = ccList.map((email) => ({ email }));
  }

  const mappedAttachments = mapAttachments(attachments);
  if (mappedAttachments?.length) {
    body.attachment = mappedAttachments;
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Brevo API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return {
    messageId: data.messageId || data.messageIds?.[0] || 'brevo-accepted',
    accepted: toList,
  };
}

module.exports = {
  verifyBrevo,
  sendViaBrevo,
  fromAddress,
  brevoApiKey,
};
