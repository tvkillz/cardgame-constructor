const { Webhook } = require('standardwebhooks');

function hookSecretRaw() {
  const configured = (
    process.env.SEND_EMAIL_HOOK_SECRET ||
    process.env.GOTRUE_HOOK_SEND_EMAIL_SECRETS ||
    ''
  ).trim();
  // Format: v1,whsec_<base64> — must not split on the comma between v1 and whsec_
  return configured.replace(/^v\d+,whsec_/, '');
}

function verifySendEmailHook(req) {
  const secret = hookSecretRaw();
  if (!secret) {
    const err = new Error('SEND_EMAIL_HOOK_SECRET is not configured');
    err.status = 503;
    throw err;
  }

  const payload = req.body;
  if (!Buffer.isBuffer(payload)) {
    const err = new Error('Hook body must be raw bytes for signature verification');
    err.status = 400;
    throw err;
  }

  const wh = new Webhook(secret);
  const headers = Object.fromEntries(
    Object.entries(req.headers).map(([key, value]) => [key.toLowerCase(), value]),
  );

  return wh.verify(payload.toString('utf8'), headers);
}

module.exports = { verifySendEmailHook, hookSecretRaw };
