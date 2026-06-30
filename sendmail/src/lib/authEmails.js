const {
  escapeHtml,
  brandName,
  renderPortalEmail,
  renderOtpBlock,
} = require('./emailTemplate');

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

const ACTION_COPY = {
  signup: {
    headline: 'Welcome to the Realm',
    body:
      'Your journey into the realm begins now. Confirm your account to unlock the portal — collect cards, forge your deck, and challenge rivals across the dominions.',
    cta: 'Activate Your Account',
  },
  invite: {
    headline: 'You Are Summoned',
    body:
      'A champion has invited you to join the realm. Accept the invitation below to enter the portal and begin your legend.',
    cta: 'Accept Invitation',
  },
  magiclink: {
    headline: 'Your Sign-In Awaits',
    body:
      'Your secure passage back to the realm is ready. Use the link below to sign in — no password required.',
    cta: 'Sign In to the Portal',
  },
  recovery: {
    headline: 'Restore Your Path',
    body:
      'We received a request to reset your password. If this was you, forge a new one using the link below. The path closes shortly for your protection.',
    cta: 'Reset Password',
  },
  email_change: {
    headline: 'Confirm Your New Seal',
    body:
      'You asked to change the email bound to your account. Confirm the new address to keep your portal access secure.',
    cta: 'Confirm Email Change',
  },
  email: {
    headline: 'Verify Your Presence',
    body:
      'Use the link or code below to verify your identity and continue into the realm.',
    cta: 'Verify Now',
  },
  reauthentication: {
    headline: 'Prove It Is You',
    body:
      'For your protection, we need to confirm your identity before this sensitive action can proceed.',
    cta: 'Confirm Identity',
  },
};

const SECURITY_COPY = {
  password_changed_notification: {
    headline: 'Password Changed',
    body: 'Your portal password was changed. If you did not make this change, secure your account immediately.',
  },
  email_changed_notification: {
    headline: 'Email Address Changed',
    body: 'The email on your account was updated. If this was unexpected, contact support and review your account security.',
  },
  phone_changed_notification: {
    headline: 'Phone Number Changed',
    body: 'A phone number linked to your account was updated.',
  },
  identity_linked_notification: {
    headline: 'Sign-In Method Linked',
    body: 'A new sign-in method was linked to your portal account.',
  },
  identity_unlinked_notification: {
    headline: 'Sign-In Method Removed',
    body: 'A sign-in method was removed from your portal account.',
  },
  mfa_factor_enrolled_notification: {
    headline: 'Extra Wards Enabled',
    body: 'Multi-factor authentication is now active on your account. Your realm is better protected.',
  },
  mfa_factor_unenrolled_notification: {
    headline: 'Extra Wards Removed',
    body: 'Multi-factor authentication was disabled on your account.',
  },
};

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

function greetingFor(name) {
  return name ? `Greetings, ${name}.` : 'Greetings, traveler.';
}

function buildAuthEmail({ user, emailData, token, tokenHash, redirectTo, emailActionType }) {
  const subject = SUBJECTS[emailActionType] || `${brandName()} notification`;
  const name =
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.username ||
    user.email;

  if (!actionNeedsLink(emailActionType)) {
    const security = SECURITY_COPY[emailActionType] || {
      headline: 'Account Notification',
      body: `This is a security notification for your ${brandName()} account.`,
    };
    const text = [
      greetingFor(name),
      '',
      security.headline,
      security.body,
      '',
      `— ${brandName()}`,
    ].join('\n');

    return {
      subject,
      html: renderPortalEmail({
        title: subject,
        headline: security.headline,
        greeting: greetingFor(name),
        bodyHtml: `<p style="margin:0;color:#ffffff;">${escapeHtml(security.body)}</p>`,
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

  const copy = ACTION_COPY[emailActionType] || {
    headline: 'Continue to the Portal',
    body: 'Your secure link to the realm is below.',
    cta: 'Continue',
  };

  const html = renderPortalEmail({
    title: subject,
    headline: copy.headline,
    greeting: greetingFor(name),
        bodyHtml: `<p style="margin:0;color:#ffffff;">${escapeHtml(copy.body)}</p>${renderOtpBlock(token)}`,
    ctaLabel: copy.cta,
    ctaUrl: confirmUrl,
  });

  const text = [
    greetingFor(name),
    '',
    copy.headline,
    copy.body,
    '',
    `${copy.cta}: ${confirmUrl}`,
    token ? `Code: ${token}` : '',
    '',
    `— ${brandName()}`,
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

function buildRecoveryPreviewEmail({ recipientName = 'Traveler', confirmUrl } = {}) {
  const subject = SUBJECTS.recovery;
  const copy = ACTION_COPY.recovery;
  const sampleUrl =
    confirmUrl || `${authVerifyBaseUrl({})}/auth/v1/verify?token=preview&type=recovery`;

  return {
    subject: `[Preview] ${subject}`,
    html: renderPortalEmail({
      title: subject,
      headline: copy.headline,
      greeting: greetingFor(recipientName),
      bodyHtml: `<p style="margin:0;color:#ffffff;">${escapeHtml(copy.body)}</p>`,
      ctaLabel: copy.cta,
      ctaUrl: sampleUrl,
      footerNote: 'This is a preview of the VOIDBORN password reset email template.',
    }),
    text: [
      greetingFor(recipientName),
      '',
      copy.headline,
      copy.body,
      '',
      `${copy.cta}: ${sampleUrl}`,
    ].join('\n'),
  };
}

function buildSignupPreviewEmail({ recipientName = 'Traveler', confirmUrl } = {}) {
  const subject = SUBJECTS.signup;
  const copy = ACTION_COPY.signup;
  const sampleUrl =
    confirmUrl || `${authVerifyBaseUrl({})}/auth/v1/verify?token=preview&type=signup`;

  return {
    subject: `[Preview] ${subject}`,
    html: renderPortalEmail({
      title: subject,
      headline: copy.headline,
      greeting: greetingFor(recipientName),
      bodyHtml: `<p style="margin:0;color:#ffffff;">${escapeHtml(copy.body)}</p>`,
      ctaLabel: copy.cta,
      ctaUrl: sampleUrl,
      footerNote: 'This is a preview of the VOIDBORN activation email template.',
    }),
    text: [
      greetingFor(recipientName),
      '',
      copy.headline,
      copy.body,
      '',
      `${copy.cta}: ${sampleUrl}`,
    ].join('\n'),
  };
}

module.exports = {
  authVerifyBaseUrl,
  buildVerifyUrl,
  buildAuthEmail,
  buildEmailChangeMessages,
  buildSignupPreviewEmail,
  buildRecoveryPreviewEmail,
};
