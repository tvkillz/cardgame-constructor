const fs = require('fs');
const path = require('path');

/** Hostname → registry site id (extend when adding frontends). */
const DOMAIN_TO_SITE = {
  'voidborn.fun': 'voidborn',
  'www.voidborn.fun': 'voidborn',
  'staging.voidborn.fun': 'voidborn',
  'komorebi.club': 'iyashikei',
  'www.komorebi.club': 'iyashikei',
  'staging.komorebi.club': 'iyashikei',
  'komorebi.voidborn.fun': 'iyashikei',
  'helixsignal.online': 'helix',
  'www.helixsignal.online': 'helix',
  'helix.voidborn.fun': 'helix',
  'finalwhistle.games': 'final_whistle',
  'www.finalwhistle.games': 'final_whistle',
};

const VOIDBORN_PALETTE = {
  bg: '#0a0a0c',
  text: '#e8dcc8',
  title: '#f1e6c8',
  muted: 'rgba(232, 220, 200, 0.55)',
  body: '#ffffff',
  accent: '#c9a227',
  accentBright: '#f3d878',
  border: 'rgba(123, 77, 255, 0.2)',
  headerTop: '#0e1018',
  headerBottom: '#0a0a0c',
  colorScheme: 'dark',
  ctaBg: 'rgba(201,162,39,0.15)',
  ctaBorder: 'rgba(201,162,39,0.45)',
};

const IYASHIKEI_PALETTE = {
  bg: '#f5f0e6',
  text: '#2c3e2d',
  title: '#2c3e2d',
  muted: 'rgba(44, 62, 45, 0.72)',
  body: '#3d5240',
  accent: '#6aab72',
  accentBright: '#4a8f55',
  border: 'rgba(154, 138, 184, 0.28)',
  headerTop: '#faf6ee',
  headerBottom: '#f0ebe0',
  colorScheme: 'light',
  ctaBg: 'rgba(106, 171, 114, 0.14)',
  ctaBorder: 'rgba(106, 171, 114, 0.45)',
};

/** Soft-sci-fi lab HUD — mirrors projects/helix/theme/colors.json */
const HELIX_PALETTE = {
  bg: '#0c1016',
  text: '#e8eef4',
  title: '#e8eef4',
  muted: 'rgba(232, 238, 244, 0.55)',
  body: '#f0f4f8',
  accent: '#c4a35a',
  accentBright: '#3db8d4',
  border: 'rgba(61, 184, 212, 0.28)',
  headerTop: '#101820',
  headerBottom: '#0c1016',
  colorScheme: 'dark',
  ctaBg: 'rgba(61, 184, 212, 0.14)',
  ctaBorder: 'rgba(61, 184, 212, 0.5)',
};

/** Stadium night — mirrors projects/final_whistle/theme/colors.json */
const FINAL_WHISTLE_PALETTE = {
  bg: '#0a1210',
  text: '#f2f0e8',
  title: '#f2f0e8',
  muted: 'rgba(242, 240, 232, 0.72)',
  body: '#f2f0e8',
  accent: '#e8c96a',
  accentBright: '#7aab78',
  border: 'rgba(61, 122, 74, 0.35)',
  headerTop: '#0e1814',
  headerBottom: '#0a1210',
  panelBg: 'rgba(20, 32, 24, 0.72)',
  invoicePaper: '#f5f2ea',
  invoiceBorder: '#c4b898',
  colorScheme: 'dark',
  ctaBg: 'rgba(232, 201, 106, 0.14)',
  ctaBorder: 'rgba(232, 201, 106, 0.45)',
};

/** Map auth email suffix → internal site id (must match backend auth_email_resolve_site_id). */
const AUTH_SUFFIX_TO_SITE = {
  komorebi: 'iyashikei',
};

const SITE_BRANDS = {
  voidborn: {
    id: 'voidborn',
    brandName: 'VOIDBORN',
    siteUrl: 'https://voidborn.fun',
    logoPath: '/assets/brand/header.webp',
    palette: VOIDBORN_PALETTE,
    greetingName: (name) => (name ? `Greetings, ${name}.` : 'Greetings, traveler.'),
    subjects: {
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
    },
    actionCopy: {
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
        body: 'Use the link or code below to verify your identity and continue into the realm.',
        cta: 'Verify Now',
      },
      reauthentication: {
        headline: 'Prove It Is You',
        body:
          'For your protection, we need to confirm your identity before this sensitive action can proceed.',
        cta: 'Confirm Identity',
      },
    },
    securityCopy: {
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
    },
    previewFooter: {
      signup: 'This is a preview of the VOIDBORN activation email template.',
      recovery: 'This is a preview of the VOIDBORN password reset email template.',
    },
  },

  iyashikei: {
    id: 'iyashikei',
    brandName: 'KOMOREBI',
    siteUrl: 'https://komorebi.club',
    logoPath: '/assets/brand/gamelogo.webp',
    logoPaths: [
      '/assets/brand/gamelogo.webp',
      '/assets/brand/gamelogo.png',
      '/assets/brand/header.webp',
      '/assets/brand/header.png',
    ],
    typography: {
      headingFamily:
        "'Hiro Misake', 'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', Georgia, serif",
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&display=swap',
      customFontFamily: 'Hiro Misake',
      customFontUrl: '/fonts/hiro-misake/HiroMisakeJapaneseGraffiti-5yG0a.otf',
    },
    palette: IYASHIKEI_PALETTE,
    greetingName: (name) => (name ? `Hello, ${name}.` : 'Hello.'),
    subjects: {
      signup: 'Confirm your KOMOREBI account',
      invite: 'You are invited to KOMOREBI',
      magiclink: 'Your KOMOREBI sign-in link',
      recovery: 'Reset your KOMOREBI password',
      email_change: 'Confirm your KOMOREBI email change',
      email: 'Your KOMOREBI verification code',
      reauthentication: 'Confirm it is you — KOMOREBI',
      password_changed_notification: 'Your KOMOREBI password was changed',
      email_changed_notification: 'Your KOMOREBI email was changed',
      phone_changed_notification: 'Your KOMOREBI phone number was changed',
      identity_linked_notification: 'A sign-in method was linked to your KOMOREBI account',
      identity_unlinked_notification: 'A sign-in method was removed from your KOMOREBI account',
      mfa_factor_enrolled_notification: 'MFA was enabled on your KOMOREBI account',
      mfa_factor_unenrolled_notification: 'MFA was disabled on your KOMOREBI account',
    },
    actionCopy: {
      signup: {
        headline: 'Welcome to the Wards',
        body:
          'A quiet corner of the countryside awaits. Confirm your account to collect gentle cards, tend your deck, and wander the wards at your own pace.',
        cta: 'Confirm Account',
      },
      invite: {
        headline: 'An Invitation to the Wards',
        body:
          'Someone thought you might enjoy the calm paths between cedar groves and coastal piers. Accept below to begin.',
        cta: 'Accept Invitation',
      },
      magiclink: {
        headline: 'Your Sign-In Link',
        body:
          'Your secure link back to the wards is ready. Tap below to sign in — no password needed this time.',
        cta: 'Sign In',
      },
      recovery: {
        headline: 'Reset Your Password',
        body:
          'We received a request to reset your password. If this was you, choose a new one with the link below. It expires soon for your safety.',
        cta: 'Reset Password',
      },
      email_change: {
        headline: 'Confirm Your New Email',
        body:
          'You asked to update the email on your account. Please confirm the new address to keep your access secure.',
        cta: 'Confirm Email',
      },
      email: {
        headline: 'Verify Your Email',
        body: 'Use the link or code below to verify your identity and continue.',
        cta: 'Verify Now',
      },
      reauthentication: {
        headline: 'Please Confirm It Is You',
        body: 'For your protection, we need to confirm your identity before this action can continue.',
        cta: 'Confirm Identity',
      },
    },
    securityCopy: {
      password_changed_notification: {
        headline: 'Password Changed',
        body: 'Your account password was changed. If this was not you, please secure your account right away.',
      },
      email_changed_notification: {
        headline: 'Email Address Changed',
        body: 'The email on your account was updated. If this was unexpected, contact support.',
      },
      phone_changed_notification: {
        headline: 'Phone Number Changed',
        body: 'A phone number linked to your account was updated.',
      },
      identity_linked_notification: {
        headline: 'Sign-In Method Linked',
        body: 'A new sign-in method was linked to your account.',
      },
      identity_unlinked_notification: {
        headline: 'Sign-In Method Removed',
        body: 'A sign-in method was removed from your account.',
      },
      mfa_factor_enrolled_notification: {
        headline: 'Extra Protection Enabled',
        body: 'Multi-factor authentication is now active on your account.',
      },
      mfa_factor_unenrolled_notification: {
        headline: 'Extra Protection Removed',
        body: 'Multi-factor authentication was disabled on your account.',
      },
    },
    previewFooter: {
      signup: 'This is a preview of the KOMOREBI activation email template.',
      recovery: 'This is a preview of the KOMOREBI password reset email template.',
    },
  },

  helix: {
    id: 'helix',
    brandName: 'HELIX',
    siteUrl: 'https://helixsignal.online',
    logoPath: '/assets/brand/header.png',
    logoPaths: [
      '/assets/brand/header.webp',
      '/assets/brand/header.png',
      '/assets/brand/gamelogo.webp',
      '/assets/brand/gamelogo.png',
    ],
    typography: {
      headingFamily: "'Orbitron', 'Rajdhani', Arial, Helvetica, sans-serif",
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700&family=Rajdhani:wght@500;600;700&display=swap',
    },
    palette: HELIX_PALETTE,
    greetingName: (name) => (name ? `Operator ${name}.` : 'Operator.'),
    subjects: {
      signup: 'Confirm your HELIX account',
      invite: 'You are invited to HELIX',
      magiclink: 'Your HELIX sign-in link',
      recovery: 'Reset your HELIX password',
      email_change: 'Confirm your HELIX email change',
      email: 'Your HELIX verification code',
      reauthentication: 'Confirm it is you — HELIX',
      password_changed_notification: 'Your HELIX password was changed',
      email_changed_notification: 'Your HELIX email was changed',
      phone_changed_notification: 'Your HELIX phone number was changed',
      identity_linked_notification: 'A sign-in method was linked to your HELIX account',
      identity_unlinked_notification: 'A sign-in method was removed from your HELIX account',
      mfa_factor_enrolled_notification: 'MFA was enabled on your HELIX account',
      mfa_factor_unenrolled_notification: 'MFA was disabled on your HELIX account',
    },
    actionCopy: {
      signup: {
        headline: 'Signal Locked In',
        body:
          'Welcome aboard the Spire. Confirm your account to field Frames, keep the Relay Grid clear of Static, and link up across Hab, Cryo, Reactor, and Relay.',
        cta: 'Activate Link',
      },
      invite: {
        headline: 'Grid Access Granted',
        body:
          'An operator invited you onto the HELIX grid. Accept below to enter the portal and begin your first link.',
        cta: 'Accept Invitation',
      },
      magiclink: {
        headline: 'Secure Channel Ready',
        body:
          'Your passwordless sign-in channel is open. Use the link below to reconnect to the portal.',
        cta: 'Sign In to HELIX',
      },
      recovery: {
        headline: 'Restore Access Credentials',
        body:
          'We received a request to reset your password. If this was you, forge a new credential with the link below. The channel closes soon for your protection.',
        cta: 'Reset Password',
      },
      email_change: {
        headline: 'Confirm New Contact Channel',
        body:
          'You asked to change the email bound to your HELIX account. Confirm the new address to keep grid access secure.',
        cta: 'Confirm Email Change',
      },
      email: {
        headline: 'Verify Operator Identity',
        body: 'Use the link or code below to verify your identity and continue on the grid.',
        cta: 'Verify Now',
      },
      reauthentication: {
        headline: 'Re-Authenticate',
        body:
          'For your protection, confirm your identity before this sensitive action can proceed.',
        cta: 'Confirm Identity',
      },
    },
    securityCopy: {
      password_changed_notification: {
        headline: 'Password Changed',
        body: 'Your HELIX password was changed. If you did not make this change, secure your account immediately.',
      },
      email_changed_notification: {
        headline: 'Email Address Changed',
        body: 'The email on your HELIX account was updated. If this was unexpected, contact support and review your security.',
      },
      phone_changed_notification: {
        headline: 'Phone Number Changed',
        body: 'A phone number linked to your HELIX account was updated.',
      },
      identity_linked_notification: {
        headline: 'Sign-In Method Linked',
        body: 'A new sign-in method was linked to your HELIX account.',
      },
      identity_unlinked_notification: {
        headline: 'Sign-In Method Removed',
        body: 'A sign-in method was removed from your HELIX account.',
      },
      mfa_factor_enrolled_notification: {
        headline: 'Extra Auth Layer Enabled',
        body: 'Multi-factor authentication is now active on your HELIX account.',
      },
      mfa_factor_unenrolled_notification: {
        headline: 'Extra Auth Layer Removed',
        body: 'Multi-factor authentication was disabled on your HELIX account.',
      },
    },
    previewFooter: {
      signup: 'This is a preview of the HELIX activation email template.',
      recovery: 'This is a preview of the HELIX password reset email template.',
    },
  },

  final_whistle: {
    id: 'final_whistle',
    brandName: 'Final Whistle',
    siteUrl: 'https://finalwhistle.games',
    /** Use public logo URL in HTML — no HTTP fetch on auth hook (keeps GoTrue under 5s). */
    logoInlineUrl: true,
    logoPath: '/assets/brand/header.webp',
    logoPaths: [
      '/assets/brand/header.webp',
      '/assets/brand/header.png',
      '/assets/brand/gamelogo.webp',
      '/assets/brand/gamelogo.png',
    ],
    typography: {
      headingFamily: "'Bebas Neue', 'DM Sans', Arial, Helvetica, sans-serif",
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@500;600;700&display=swap',
    },
    palette: FINAL_WHISTLE_PALETTE,
    greetingName: (name) => (name ? `Manager ${name}.` : 'Manager.'),
    subjects: {
      signup: 'Confirm your Final Whistle account',
      invite: 'You are invited to Final Whistle',
      magiclink: 'Your Final Whistle sign-in link',
      recovery: 'Reset your Final Whistle password',
      email_change: 'Confirm your Final Whistle email change',
      email: 'Your Final Whistle verification code',
      reauthentication: 'Confirm it is you — Final Whistle',
      password_changed_notification: 'Your Final Whistle password was changed',
      email_changed_notification: 'Your Final Whistle email was changed',
      phone_changed_notification: 'Your Final Whistle phone number was changed',
      identity_linked_notification: 'A sign-in method was linked to your Final Whistle account',
      identity_unlinked_notification: 'A sign-in method was removed from your Final Whistle account',
      mfa_factor_enrolled_notification: 'MFA was enabled on your Final Whistle account',
      mfa_factor_unenrolled_notification: 'MFA was disabled on your Final Whistle account',
    },
    actionCopy: {
      signup: {
        headline: 'Welcome to the Pitch',
        body:
          'Your Final Whistle account is ready. Confirm below to build your squad, claim the board, and leave a legacy under the floodlights.',
        cta: 'Activate Account',
      },
      invite: {
        headline: 'You Are Called Up',
        body:
          'A manager invited you onto Final Whistle. Accept below to enter the portal and start your first matchday.',
        cta: 'Accept Invitation',
      },
      magiclink: {
        headline: 'Tunnel Access Ready',
        body:
          'Your passwordless sign-in is ready. Use the link below to return to the portal.',
        cta: 'Sign In to Final Whistle',
      },
      recovery: {
        headline: 'Reset Match Credentials',
        body:
          'We received a request to reset your password. If this was you, set a new one with the link below. The window closes soon for your protection.',
        cta: 'Reset Password',
      },
      email_change: {
        headline: 'Confirm New Contact Channel',
        body:
          'You asked to change the email on your Final Whistle account. Confirm the new address to keep access secure.',
        cta: 'Confirm Email Change',
      },
      email: {
        headline: 'Verify Identity',
        body: 'Use the link or code below to verify your identity and continue.',
        cta: 'Verify Now',
      },
      reauthentication: {
        headline: 'Re-Authenticate',
        body:
          'For your protection, confirm your identity before this sensitive action can proceed.',
        cta: 'Confirm Identity',
      },
    },
    securityCopy: {
      password_changed_notification: {
        headline: 'Password Changed',
        body: 'Your Final Whistle password was changed. If this was not you, reset it immediately.',
      },
      email_changed_notification: {
        headline: 'Email Changed',
        body: 'The email on your Final Whistle account was changed.',
      },
      phone_changed_notification: {
        headline: 'Phone Changed',
        body: 'The phone number on your Final Whistle account was changed.',
      },
      identity_linked_notification: {
        headline: 'Sign-In Method Linked',
        body: 'A new sign-in method was linked to your account.',
      },
      identity_unlinked_notification: {
        headline: 'Sign-In Method Removed',
        body: 'A sign-in method was removed from your account.',
      },
      mfa_factor_enrolled_notification: {
        headline: 'Extra Protection Enabled',
        body: 'Multi-factor authentication is now active on your account.',
      },
      mfa_factor_unenrolled_notification: {
        headline: 'Extra Protection Removed',
        body: 'Multi-factor authentication was disabled on your account.',
      },
    },
    previewFooter: {
      signup: 'This is a preview of the Final Whistle activation email template.',
      recovery: 'This is a preview of the Final Whistle password reset email template.',
    },
  },
};

function siteIdFromAuthSuffix(suffix) {
  if (!suffix) return null;
  if (SITE_BRANDS[suffix]) return suffix;
  return AUTH_SUFFIX_TO_SITE[suffix] || null;
}

function parseSiteIdFromEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at <= 0) return null;
  const local = normalized.slice(0, at);
  const plus = local.lastIndexOf('+');
  if (plus <= 0) return null;
  const suffix = local.slice(plus + 1);
  return siteIdFromAuthSuffix(suffix);
}

function parseSiteIdFromRedirect(redirectTo) {
  if (!redirectTo) return null;
  try {
    const host = new URL(redirectTo).hostname.toLowerCase();
    return DOMAIN_TO_SITE[host] || null;
  } catch {
    return null;
  }
}

function getBrand(siteId) {
  return SITE_BRANDS[siteId] || SITE_BRANDS.voidborn;
}

/**
 * Pick site branding from hook context — redirect URL, user metadata, or +site email.
 */
function resolveSiteBrand({ user, emailData, redirectTo } = {}) {
  const metaRaw =
    typeof user?.user_metadata?.site_id === 'string'
      ? user.user_metadata.site_id.trim().toLowerCase()
      : '';
  const fromMeta = metaRaw ? siteIdFromAuthSuffix(metaRaw) || (SITE_BRANDS[metaRaw] ? metaRaw : null) : null;

  const siteId =
    fromMeta ||
    parseSiteIdFromRedirect(redirectTo || emailData?.redirect_to) ||
    parseSiteIdFromEmail(user?.email) ||
    'voidborn';

  return getBrand(siteId);
}

function bundledLogoCandidates(brand) {
  const siteId = brand.id;
  const libDir = path.join(__dirname);
  const fileNames = [
    'gamelogo.webp',
    'header.webp',
    'gamelogo.png',
    'header.png',
    'gamelogo.jpg',
    'header.jpg',
  ];
  const dirs = [
    path.join(libDir, `../../assets/brand/${siteId}`),
    path.join(libDir, `../../../frontend/.build/${siteId}/assets/brand`),
    path.join(libDir, `../../../projects/${siteId}/assets/brand`),
  ];

  const candidates = [];
  for (const dir of dirs) {
    for (const name of fileNames) {
      candidates.push(path.join(dir, name));
    }
  }

  if (siteId === 'voidborn') {
    candidates.push(
      path.join(libDir, '../../assets/brand/header.png'),
      path.join(libDir, '../../../frontend/.build/voidborn/assets/brand/header.png'),
    );
  }

  return candidates.filter((candidate, index, list) => list.indexOf(candidate) === index);
}

function bundledLogoFile(brand) {
  return bundledLogoCandidates(brand).find((file) => fs.existsSync(file)) ?? null;
}

/** Brands that embed logo via https URL in HTML (voidborn default, final_whistle always). */
function brandUsesInlineLogoUrl(brand) {
  if (brand?.logoInlineUrl) return true;
  if (brand?.id === 'voidborn' && process.env.MAIL_LOGO_FETCH !== '1') return true;
  return false;
}

module.exports = {
  DOMAIN_TO_SITE,
  AUTH_SUFFIX_TO_SITE,
  SITE_BRANDS,
  getBrand,
  resolveSiteBrand,
  siteIdFromAuthSuffix,
  parseSiteIdFromEmail,
  parseSiteIdFromRedirect,
  bundledLogoFile,
  bundledLogoCandidates,
  brandUsesInlineLogoUrl,
};
