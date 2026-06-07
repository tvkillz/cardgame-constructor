export default function RefundPolicyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Refund Policy</h1>
      <p>
        Digital credit purchases are generally non-refundable once credits are delivered. If a
        payment error occurs, contact support with your order ID. Refunds are processed in Stripe
        and wallet balances are adjusted via webhook (<code>charge.refunded</code>).
      </p>
    </main>
  )
}
