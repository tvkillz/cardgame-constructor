'use client'

/**
 * Dev-only: full play stack inside Next (HMR, single server).
 * Not imported during hybrid production builds (SITE_HYBRID=1) — see scripts/build-web.mjs.
 */
import AuthGate from '@/components/auth/AuthGate'
import PlayPage from '@/screens/PlayPage/PlayPage'

export default function PlayPageDev() {
  return (
    <AuthGate>
      <PlayPage />
    </AuthGate>
  )
}
