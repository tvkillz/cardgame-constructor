function authVerifyBaseUrl(emailData) {
  return (
    process.env.AUTH_VERIFY_BASE_URL ||
    process.env.API_EXTERNAL_URL ||
    emailData.site_url ||
    'https://api.voidborn.fun'
  ).replace(/\/$/, '');
}

function buildVerifyUrl({ tokenHash, emailActionType, redirectTo, emailData }) {
  const base = authVerifyBaseUrl(emailData);
  const url = new URL('/auth/v1/verify', `${base}/`);
  url.searchParams.set('token', tokenHash);
  url.searchParams.set('type', emailActionType);
  if (redirectTo) {
    url.searchParams.set('redirect_to', redirectTo);
  }
  return url.toString();
}

const SUBJECTS = {
  signup: 'Confirm your VOIDBORN account',
  invite: 'You are invited to VOIDBORN',
  magiclink: 'Your VOIDBORN sign-in link',
  recovery: 'Reset your VOIDBORN password',
  email_change: 'Confirm your VOIDBORN email change',
  email: 'Your VOIDBORN verification code',
  reauthentication: 'Confirm it is you — VOIDBORN',
  password_changed_notification: 'Your VOIDBORN password was changed',
  email_changed_notification: 'Your VOIDBORN email was changed',
  phone_changed_notification: 'Your VOIDBORN phone number was changed',
  identity_linked_notification: 'A sign-in method was linked to your VOIDBORN account',
  identity_unlinked_notification: 'A sign-in method was removed from your VOIDBORN account',
  mfa_factor_enrolled_notification: 'MFA was enabled on your VOIDBORN account',
  mfa_factor_unenrolled_notification: 'MFA was disabled on your VOIDBORN account',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapHtml({ title, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:20px;margin:0 0 16px;">${escapeHtml(title)}</h1>
  ${bodyHtml}
  <p style="margin-top:32px;font-size:12px;color:#666;">VOIDBORN — if you did not request this, you can ignore this email.</p>
</body>
</html>`;
}

function actionNeedsLink(action) {
  return [
    'signup',
    'invite',
    'magiclink',
    'recovery',
    'email_change',
    'email',
    'reauthentication',
  ].includes(action);
}

function buildAuthEmail({ user, emailData, token, tokenHash, redirectTo, emailActionType }) {
  const subject = SUBJECTS[emailActionType] || 'VOIDBORN notification';
  const name = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email;

  if (!actionNeedsLink(emailActionType)) {
    const text = `Hi ${name},\n\nThis is a security notification for your VOIDBORN account (${emailActionType.replace(/_/g, ' ')}).`;
    return {
      subject,
      html: wrapHtml({
        title: subject,
        bodyHtml: `<p>Hi ${escapeHtml(name)},</p><p>This is a security notification for your VOIDBORN account.</p>`,
      }),
      text,
    };
  }

  const confirmUrl = buildVerifyUrl({
    tokenHash,
    emailActionType,
    redirectTo,
    emailData,
  });

  const otpBlock = token
    ? `<p>Or enter this code: <strong style="font-size:18px;letter-spacing:2px;">${escapeHtml(token)}</strong></p>`
    : '';

  const html = wrapHtml({
    title: subject,
    bodyHtml: `
      <p>Hi ${escapeHtml(name)},</p>
      <p><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Continue</a></p>
      ${otpBlock}
      <p style="font-size:13px;color:#444;word-break:break-all;">${escapeHtml(confirmUrl)}</p>
    `,
  });

  const text = [
    `Hi ${name},`,
    '',
    subject,
    confirmUrl,
    token ? `Code: ${token}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}

/**
 * GoTrue email_change — token/hash field names are reversed for backward compatibility.
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
 */
function buildEmailChangeMessages({ user, emailData }) {
  const redirectTo = emailData.redirect_to || '';
  const hasSecurePair =
    Boolean(emailData.token_new) &&
    Boolean(emailData.token_hash_new) &&
    Boolean(emailData.token) &&
    Boolean(emailData.token_hash);

  if (hasSecurePair) {
    return [
      {
        to: user.email,
        ...buildAuthEmail({
          user,
          emailData,
          token: emailData.token,
          tokenHash: emailData.token_hash_new,
          redirectTo,
          emailActionType: 'email_change',
        }),
      },
      {
        to: user.new_email || user.email,
        ...buildAuthEmail({
          user: { ...user, email: user.new_email || user.email },
          emailData,
          token: emailData.token_new,
          tokenHash: emailData.token_hash,
          redirectTo,
          emailActionType: 'email_change',
        }),
      },
    ];
  }

  const targetEmail = user.new_email || user.email;
  const token = emailData.token_new || emailData.token;
  const tokenHash = emailData.token_hash || emailData.token_hash_new;

  return [
    {
      to: targetEmail,
      ...buildAuthEmail({
        user: { ...user, email: targetEmail },
        emailData,
        token,
        tokenHash,
        redirectTo,
        emailActionType: 'email_change',
      }),
    },
  ];
}

module.exports = {
  authVerifyBaseUrl,
  buildVerifyUrl,
  buildAuthEmail,
  buildEmailChangeMessages,
};
