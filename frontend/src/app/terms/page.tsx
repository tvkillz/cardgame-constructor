import { appConfig } from '@/config'

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Terms of Service</h1>
      <p>
        VOIDBORN ({appConfig.domain.siteUrl}) — placeholder terms for checkout compliance.
        Replace with counsel-reviewed text before production go-live.
      </p>
    </main>
  )
}
