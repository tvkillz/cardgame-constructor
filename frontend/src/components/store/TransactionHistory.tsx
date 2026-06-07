'use client'

import { useEffect, useState } from 'react'

import { invokeCommerceAction, type WalletTransaction } from '@/lib/commerce/api'

type OrderRow = {
  id: string
  status: string
  total_cents: number
  currency: string
  credits_granted: number
  created_at: string
  refund_status?: string | null
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [txRes, ordRes] = await Promise.all([
        invokeCommerceAction({ type: 'transactions_list', limit: 50 }),
        invokeCommerceAction({ type: 'orders_list' }),
      ])
      if (cancelled) return
      setTransactions(txRes.transactions ?? [])
      setOrders((ordRes.orders as OrderRow[]) ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p>Loading transaction history…</p>

  return (
    <div className="store-page">
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table className="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Credits</th>
              <th>Refund</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td>
                  <span className={`tx-status--${o.status}`}>{o.status}</span>
                </td>
                <td>
                  {(o.total_cents / 100).toFixed(2)} {o.currency.toUpperCase()}
                </td>
                <td>{o.credits_granted}</td>
                <td>{o.refund_status ?? (o.status === 'refunded' ? 'refunded' : '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Wallet activity</h2>
      {transactions.length === 0 ? (
        <p>No wallet transactions yet.</p>
      ) : (
        <table className="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Balance after</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
                <td>{tx.type}</td>
                <td>
                  <span className={`tx-status--${tx.status}`}>{tx.status}</span>
                </td>
                <td>
                  {tx.amount_credits > 0 ? '+' : ''}
                  {tx.amount_credits}
                </td>
                <td>{tx.balance_after ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
