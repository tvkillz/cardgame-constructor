/** Per-site sendmail relay URLs for edge functions (auth hook router + commerce). */

export type MailRelay = {
  url: string
  apiKey: string
}

export type SendEmailHookPayload = {
  user?: {
    email?: string | null
    user_metadata?: Record<string, unknown>
  }
  email_data?: {
    redirect_to?: string | null
    email_action_type?: string
  }
}

const DOMAIN_TO_SITE: Record<string, string> = {
  'voidborn.fun': 'voidborn',
  'www.voidborn.fun': 'voidborn',
  'staging.voidborn.fun': 'voidborn',
  'komorebi.club': 'iyashikei',
  'www.komorebi.club': 'iyashikei',
  'staging.komorebi.club': 'iyashikei',
  'komorebi.voidborn.fun': 'iyashikei',
}

const AUTH_SUFFIX_TO_SITE: Record<string, string> = {
  komorebi: 'iyashikei',
}

function resolveAuthEmailSiteId(suffix: string | null | undefined): string | null {
  if (!suffix) return null
  if (suffix === 'komorebi') return 'iyashikei'
  return suffix
}

export function siteIdFromAuthEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const at = email.lastIndexOf('@')
  if (at <= 0) return null
  const local = email.slice(0, at).toLowerCase()
  const sepIdx = local.lastIndexOf('+')
  if (sepIdx <= 0) return null
  const parsed = local.slice(sepIdx + 1)
  return resolveAuthEmailSiteId(parsed || null)
}

export function siteIdFromRedirect(redirectTo: string | null | undefined): string | null {
  if (!redirectTo) return null
  try {
    const host = new URL(redirectTo).hostname.toLowerCase()
    return DOMAIN_TO_SITE[host] || null
  } catch {
    return null
  }
}

/** Resolve internal site id from GoTrue send-email hook payload. */
export function siteIdFromHookPayload(payload: SendEmailHookPayload): string {
  const user = payload.user
  const emailData = payload.email_data
  const metaSite = user?.user_metadata?.site_id
  if (typeof metaSite === 'string' && metaSite.trim()) {
    return metaSite.trim()
  }

  const fromRedirect = siteIdFromRedirect(emailData?.redirect_to ?? null)
  if (fromRedirect) return fromRedirect

  const fromEmail = siteIdFromAuthEmail(user?.email ?? null)
  if (fromEmail) return fromEmail

  return 'voidborn'
}

export function parseSendmailRelays(): Record<string, MailRelay> {
  const raw = Deno.env.get('SENDMAIL_RELAYS')?.trim()
  if (raw) {
    const parsed = JSON.parse(raw) as Record<string, { url?: string; apiKey?: string }>
    const relays: Record<string, MailRelay> = {}
    for (const [siteId, entry] of Object.entries(parsed)) {
      const url = entry?.url?.replace(/\/$/, '')
      const apiKey = entry?.apiKey?.trim()
      if (url && apiKey) relays[siteId] = { url, apiKey }
    }
    if (Object.keys(relays).length > 0) return relays
  }

  const legacyUrl = Deno.env.get('SENDMAIL_URL')?.replace(/\/$/, '')
  const legacyKey = Deno.env.get('MAIL_API_KEY')?.trim()
  if (legacyUrl && legacyKey) {
    return {
      voidborn: { url: legacyUrl, apiKey: legacyKey },
      default: { url: legacyUrl, apiKey: legacyKey },
    }
  }

  return {}
}

export function relayForSite(siteId: string | null | undefined): MailRelay | null {
  const relays = parseSendmailRelays()
  const normalized = (siteId || 'voidborn').trim()
  return relays[normalized] ?? relays.default ?? relays.voidborn ?? null
}

export function hookSecretRaw(): string {
  const configured = (
    Deno.env.get('SEND_EMAIL_HOOK_SECRET') ||
    Deno.env.get('GOTRUE_HOOK_SEND_EMAIL_SECRETS') ||
    ''
  ).trim()
  return configured.replace(/^v\d+,whsec_/, '')
}

export async function postToSendmailRelay(
  relay: MailRelay,
  path: string,
  init: RequestInit,
): Promise<Response> {
  const url = `${relay.url.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(init.headers)
  if (!headers.has('authorization')) {
    headers.set('authorization', `Bearer ${relay.apiKey}`)
  }
  return fetch(url, { ...init, headers })
}
