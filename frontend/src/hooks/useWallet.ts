'use client'

import { useCallback, useEffect, useState } from 'react'

import { invokeCommerceAction, type Wallet, type WalletTransaction } from '@/lib/commerce/api'
import { useAuth } from '@/components/providers/AuthProvider'

export function useWallet() {
  const { user, session } = useAuth()
  const userId = user?.id ?? session?.user?.id
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setWallet(null)
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const [walletRes, txRes] = await Promise.all([
      invokeCommerceAction({ type: 'wallet_get' }),
      invokeCommerceAction({ type: 'transactions_list', limit: 20 }),
    ])

    if (walletRes.error) setError(walletRes.error)
    else setWallet(walletRes.wallet ?? null)

    if (!txRes.error) setTransactions(txRes.transactions ?? [])

    setLoading(false)
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    wallet,
    balanceCredits: wallet?.balance_credits ?? 0,
    transactions,
    loading,
    error,
    refresh,
  }
}
