import type { SupabaseClient } from '@supabase/supabase-js'
import { getAuthEmailSuffix, getSiteId } from '@/lib/site'
import { toSiteAuthEmail } from '@/lib/auth/site-email'

function authEmailSuffixCandidates(): string[] {
  const primary = getAuthEmailSuffix()
  const legacy = getSiteId()
  return primary === legacy ? [primary] : [primary, legacy]
}

function isInvalidCredentialsError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('user not found')
  )
}

/** Sign in using display email; tries auth suffix then legacy siteId when they differ. */
export async function signInWithSiteCredentials(
  supabase: SupabaseClient,
  displayEmail: string,
  password: string,
) {
  const suffixes = authEmailSuffixCandidates()
  let lastError: { message: string } | null = null

  for (let i = 0; i < suffixes.length; i++) {
    const email = toSiteAuthEmail(suffixes[i], displayEmail)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) return { error: null }
    lastError = error
    const hasMore = i < suffixes.length - 1
    if (!hasMore || !isInvalidCredentialsError(error.message)) break
  }

  return { error: lastError }
}
