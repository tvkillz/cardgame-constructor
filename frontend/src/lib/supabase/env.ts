/** Public Supabase project URL (e.g. https://api.voidborn.fun). */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

/** Prefer opaque publishable key; fall back to legacy anon JWT. */
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ''

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
