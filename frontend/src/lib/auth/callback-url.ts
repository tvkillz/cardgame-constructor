import { getSitePublicUrl } from '@/lib/site'

/** Where GoTrue redirects after email confirm / password recovery. */
export function getAuthCallbackUrl(): string {
  const base = getSitePublicUrl().replace(/\/$/, '')
  return `${base}/auth/callback`
}
