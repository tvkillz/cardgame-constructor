const {
  escapeHtml,
  renderBrandedEmail,
  renderOtpBlock,
} = require('./emailTemplate');
const { resolveSiteBrand, getBrand } = require('./siteBrands');

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

function greetingFor(brand, name) {
  return brand.greetingName(name || '');
}

function buildAuthEmail({
  user,
  emailData,
  token,
  tokenHash,
  redirectTo,
  emailActionType,
  brand: brandOverride,
}) {
  const brand = brandOverride || resolveSiteBrand({ user, emailData, redirectTo });
  const subject = brand.subjects[emailActionType] || `${brand.brandName} notification`;
  const name =
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.username ||
    user.email;

  if (!actionNeedsLink(emailActionType)) {
    const security = brand.securityCopy[emailActionType] || {
      headline: 'Account Notification',
      body: `This is a security notification for your ${brand.brandName} account.`,
    };
    const text = [
      greetingFor(brand, name),
      '',
      security.headline,
      security.body,
      '',
      `— ${brand.brandName}`,
    ].join('\n');

    return {
      subject,
      html: renderBrandedEmail(brand, {
        title: subject,
        headline: security.headline,
        greeting: greetingFor(brand, name),
        bodyHtml: `<p style="margin:0;color:${brand.palette.body};">${escapeHtml(security.body)}</p>`,
      }),
      text,
      brand,
    };
  }

  const confirmUrl = buildVerifyUrl({
    tokenHash,
    emailActionType,
    redirectTo,
    emailData,
  });

  const copy = brand.actionCopy[emailActionType] || {
    headline: 'Continue',
    body: 'Your secure link is below.',
    cta: 'Continue',
  };

  const html = renderBrandedEmail(brand, {
    title: subject,
    headline: copy.headline,
    greeting: greetingFor(brand, name),
    bodyHtml: `<p style="margin:0;color:${brand.palette.body};">${escapeHtml(copy.body)}</p>${renderOtpBlock(token, brand)}`,
    ctaLabel: copy.cta,
    ctaUrl: confirmUrl,
  });

  const text = [
    greetingFor(brand, name),
    '',
    copy.headline,
    copy.body,
    '',
    `${copy.cta}: ${confirmUrl}`,
    token ? `Code: ${token}` : '',
    '',
    `— ${brand.brandName}`,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text, brand };
}

/**
 * GoTrue email_change — token/hash field names are reversed for backward compatibility.
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
 */
function buildEmailChangeMessages({ user, emailData }) {
  const brand = resolveSiteBrand({ user, emailData, redirectTo: emailData.redirect_to });
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
          brand,
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
          brand,
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
        brand,
      }),
    },
  ];
}

function buildRecoveryPreviewEmail({ recipientName = 'Traveler', confirmUrl, siteId = 'voidborn' } = {}) {
  const brand = getBrand(siteId);
  const subject = brand.subjects.recovery;
  const copy = brand.actionCopy.recovery;
  const sampleUrl =
    confirmUrl || `${authVerifyBaseUrl({})}/auth/v1/verify?token=preview&type=recovery`;

  return {
    subject: `[Preview] ${subject}`,
    html: renderBrandedEmail(brand, {
      title: subject,
      headline: copy.headline,
      greeting: greetingFor(brand, recipientName),
      bodyHtml: `<p style="margin:0;color:${brand.palette.body};">${escapeHtml(copy.body)}</p>`,
      ctaLabel: copy.cta,
      ctaUrl: sampleUrl,
      footerNote: brand.previewFooter.recovery,
    }),
    text: [
      greetingFor(brand, recipientName),
      '',
      copy.headline,
      copy.body,
      '',
      `${copy.cta}: ${sampleUrl}`,
    ].join('\n'),
    brand,
  };
}

function buildSignupPreviewEmail({ recipientName = 'Traveler', confirmUrl, siteId = 'voidborn' } = {}) {
  const brand = getBrand(siteId);
  const subject = brand.subjects.signup;
  const copy = brand.actionCopy.signup;
  const sampleUrl =
    confirmUrl || `${authVerifyBaseUrl({})}/auth/v1/verify?token=preview&type=signup`;

  return {
    subject: `[Preview] ${subject}`,
    html: renderBrandedEmail(brand, {
      title: subject,
      headline: copy.headline,
      greeting: greetingFor(brand, recipientName),
      bodyHtml: `<p style="margin:0;color:${brand.palette.body};">${escapeHtml(copy.body)}</p>`,
      ctaLabel: copy.cta,
      ctaUrl: sampleUrl,
      footerNote: brand.previewFooter.signup,
    }),
    text: [
      greetingFor(brand, recipientName),
      '',
      copy.headline,
      copy.body,
      '',
      `${copy.cta}: ${sampleUrl}`,
    ].join('\n'),
    brand,
  };
}

module.exports = {
  authVerifyBaseUrl,
  buildVerifyUrl,
  buildAuthEmail,
  buildEmailChangeMessages,
  buildSignupPreviewEmail,
  buildRecoveryPreviewEmail,
  resolveSiteBrand,
};
