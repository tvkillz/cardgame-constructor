import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './env'

let browserClient: SupabaseClient | null = null

/** Browser Supabase client; null when env vars are not set. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null

  browserClient ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
    },
  })

  return browserClient
}
