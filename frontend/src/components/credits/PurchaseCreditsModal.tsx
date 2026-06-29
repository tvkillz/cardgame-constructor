'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { appConfig } from '@/config'
import { creditsToEur, formatCredits } from '@/config/selectors'
import { useSyncedMarketCurrency } from '@/hooks/useMarketCurrency'
import { invokeCommerceAction } from '@/lib/commerce/api'
import { formatEurAmount, MARKET_CURRENCIES } from '@/lib/market/currency'
import { Button } from '@/components/ui/Button/Button'
import '@/styles/coin-stack-icon.css'
import './PurchaseCreditsModal.css'

type PurchaseCreditsModalProps = {
  isOpen: boolean
  onClose: () => void
}

function CoinIcon() {
  return <span className="coin-stack-icon" aria-hidden="true" />
}

export default function PurchaseCreditsModal({
  isOpen,
  onClose,
}: PurchaseCreditsModalProps) {
  const copy = appConfig.descriptions.credits
  const { packages, creditsPerEur } = appConfig.credits
  const titleId = useId()
  const { currency, setCurrency } = useSyncedMarketCurrency()

  const [selectedPackId, setSelectedPackId] = useState<string | null>(null)
  const [customCredits, setCustomCredits] = useState('')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const { legal } = appConfig.domain

  useEffect(() => {
    if (!isOpen) return
    setSelectedPackId(null)
    setCustomCredits('')
  }, [isOpen])

  const customAmount = useMemo(() => {
    const parsed = Number.parseInt(customCredits.replace(/\D/g, ''), 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }, [customCredits])

  const selectedPack = packages.find((p) => p.id === selectedPackId)

  const totalEur = useMemo(() => {
    if (selectedPack) return selectedPack.priceEur
    if (customAmount > 0) return creditsToEur(customAmount)
    return 0
  }, [selectedPack, customAmount])

  const handleSelectPack = (packId: string) => {
    setSelectedPackId(packId)
    setCustomCredits('')
  }

  const handleCustomChange = (value: string) => {
    setCustomCredits(value)
    setSelectedPackId(null)
  }

  const handleBuy = async () => {
    if (totalEur <= 0 || checkingOut) return
    setCheckoutError(null)
    setCheckingOut(true)

    try {
      const res = await invokeCommerceAction(
        selectedPack
          ? { type: 'checkout_create', packId: selectedPack.id, currency: currency.toLowerCase() }
          : {
              type: 'checkout_create',
              customCredits: customAmount,
              currency: currency.toLowerCase(),
            },
      )

      if (res.error || !res.checkoutUrl) {
        setCheckoutError(res.message ?? res.error ?? 'Checkout unavailable. Try again later.')
        return
      }

      window.location.href = res.checkoutUrl
    } catch {
      setCheckoutError('Could not start checkout.')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div
      className={`credits-modal${isOpen ? ' credits-modal--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="credits-modal__backdrop"
        aria-label={copy.closeLabel}
        onClick={onClose}
      />

      <div className="credits-modal__panel">
        <button
          type="button"
          className="credits-modal__close"
          aria-label={copy.closeLabel}
          onClick={onClose}
        >
          ×
        </button>

        <header className="credits-modal__header">
          <div className="credits-modal__title-row">
            <span className="credits-modal__title-coins" aria-hidden="true">
              <CoinIcon />
              <CoinIcon />
            </span>
            <h2 id={titleId} className="credits-modal__title">
              {copy.title}
            </h2>
          </div>
          <p className="credits-modal__subtitle">
            {creditsPerEur} credits = {formatEurAmount(1, currency)}
          </p>
          <label className="credits-modal__currency">
            <span className="credits-modal__currency-label">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as typeof currency)}
              aria-label="Display currency"
            >
              {MARKET_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
        </header>

        <div className="credits-modal__grid">
          {packages.map((pack) => (
            <button
              key={pack.id}
              type="button"
              className={`credits-modal__pack${
                selectedPackId === pack.id ? ' credits-modal__pack--selected' : ''
              }${pack.popular ? ' credits-modal__pack--popular' : ''}`}
              onClick={() => handleSelectPack(pack.id)}
            >
              {pack.popular && (
                <span className="credits-modal__popular">{copy.popularBadge}</span>
              )}
              <div className="credits-modal__pack-top">
                <span className="credits-modal__pack-credits">
                  <CoinIcon />
                  {formatCredits(pack.credits)}
                </span>
                <span className="credits-modal__pack-price">
                  {formatEurAmount(pack.priceEur, currency)}
                </span>
              </div>
              <span className="credits-modal__pack-rate">{copy.standardRate}</span>
            </button>
          ))}
        </div>

        <div className="credits-modal__custom">
          <p className="credits-modal__custom-label">{copy.customAmount}</p>
          <div className="credits-modal__custom-row">
            <label className="credits-modal__custom-field">
              <span className="credits-modal__custom-field-label">{copy.amountToBuy}</span>
              <div className="credits-modal__custom-input-wrap">
                <CoinIcon />
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="credits-modal__custom-input"
                  placeholder={copy.amountPlaceholder}
                  value={customCredits}
                  onChange={(e) => handleCustomChange(e.target.value)}
                />
              </div>
            </label>
            <div className="credits-modal__total">
              <span className="credits-modal__total-label">{copy.totalLabel}</span>
              <strong className="credits-modal__total-value">
                {formatEurAmount(totalEur, currency)}
              </strong>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              fantasy
              className="credits-modal__buy"
              disabled={totalEur <= 0 || checkingOut}
              onClick={() => void handleBuy()}
            >
              {checkingOut ? 'Redirecting…' : copy.buy}
            </Button>
          </div>
          {customAmount > 0 && (
            <p className="credits-modal__custom-hint">
              {formatCredits(customAmount)} credits @ {creditsPerEur} / {formatEurAmount(1, currency)}
            </p>
          )}
        </div>

        {checkoutError && (
          <p className="credits-modal__error" role="alert">
            {checkoutError}
          </p>
        )}

        <p className="credits-modal__legal">
          By purchasing you agree to our{' '}
          <a href={legal.termsUrl} target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>
          ,{' '}
          <a href={legal.refundPolicyUrl} target="_blank" rel="noopener noreferrer">
            Cancellation & Refund Policy
          </a>{' '}
          and{' '}
          <a href={legal.privacyUrl} target="_blank" rel="noopener noreferrer">
            Privacy Notice
          </a>
          . Payments are processed securely via Stripe (cards, Link; Apple Pay / Google Pay when
          enabled in your Stripe dashboard).
        </p>
      </div>
    </div>
  )
}
