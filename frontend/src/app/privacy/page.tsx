import { appConfig } from '@/config'

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Privacy Policy</h1>
      <p>
        We process account data via Supabase and payments via Stripe. Email receipts are sent to
        your account email when configured on the server.
      </p>
      <p>Site: {appConfig.domain.siteUrl}</p>
    </main>
  )
}
