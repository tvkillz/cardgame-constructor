'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { appConfig, formatCredits } from '@/config'
import BillingProfileForm from '@/components/profile/BillingProfileForm'
import { Button } from '@/components/ui/Button/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  MAX_CUSTOM_CREDITS,
  MIN_CUSTOM_CREDITS,
} from '@/lib/commerce/creditCheckoutLimits'
import { invokeCommerceAction } from '@/lib/commerce/api'
import {
  formatEurAmount,
  isMarketCurrency,
  type MarketCurrency,
} from '@/lib/market/currency'
import {
  EMPTY_BILLING_PROFILE,
  CHECKOUT_REQUIRED_BILLING_FIELDS,
  fetchBillingProfile,
  saveBillingProfile,
  validateBillingProfileForCheckout,
  type BillingProfile,
} from '@/lib/profile/billing'
import './CheckoutPage.css'

function CheckoutPageWrap({ children }: { children: React.ReactNode }) {
  return <div className="checkout-page-wrap">{children}</div>
}

type CheckoutOrder = {
  orderId: string
  credits: number
  title: string
  totalCents: number
  vatCents: number
  currency: string
  status?: string
}

function formatOrderMoney(totalCents: number, currencyCode: string): string {
  const upper = currencyCode.toUpperCase()
  if (isMarketCurrency(upper)) {
    return formatEurAmount(totalCents / 100, upper)
  }
  return `${(totalCents / 100).toFixed(2)} ${upper}`
}

function CheckoutDisclaimer() {
  const { footer } = appConfig.descriptions
  const { legal } = appConfig.domain
  const company = footer.contact.companyName
  const supportMail = footer.contact.email

  return (
    <div className="checkout-page__disclaimer">
      <h3 className="checkout-page__disclaimer-title">Order Fulfillment</h3>
      <p>
        The moment your payment clears, your digital goodies—whether it&apos;s a balance top-up, a
        loot box, or a virtual card—are processed and delivered instantly.
      </p>
      <ul>
        <li>
          <strong>Account Balances:</strong> Added straight to your profile.
        </li>
        <li>
          <strong>Boxes &amp; Packs:</strong> Dropped into your account immediately.
        </li>
        <li>
          <strong>Virtual Cards:</strong> Sent directly to your in-game inventory for instant use.
        </li>
      </ul>
      <p>As soon as the items hit your dashboard or inventory, the order is officially complete.</p>
      <ul>
        <li>
          Got a delivery glitch? Drop us a line within 14 calendar days if your items didn&apos;t show
          up, and our team will dig into it.
        </li>
      </ul>

      <h3 className="checkout-page__disclaimer-title">Our Refund Policy</h3>
      <p>
        Because digital assets are delivered instantly, all sales are typically final once they hit
        your account. That said, we want to play fair. We will look into a refund if:
      </p>
      <ul>
        <li>A system glitch blocked your items from actually arriving.</li>
        <li>You were accidentally billed twice for the same order.</li>
        <li>There was unauthorized activity or fraudulent charges on your account.</li>
        <li>The total amount taken from your account didn&apos;t match the checkout price.</li>
      </ul>
      <p>
        Every claim is looked at individually. For the nitty-gritty legal details, feel free to read
        our full{' '}
        <Link href={legal.refundPolicyUrl} className="checkout-page__link">
          Refund Policy
        </Link>
        .
      </p>

      <h3 className="checkout-page__disclaimer-title">Payments &amp; Cash-Outs</h3>
      <p>To keep your money safe, all payments go through secure, third-party processors. If you are making a withdrawal from your account, please note:</p>
      <ul>
        <li>For security, we only send funds back to the exact same payment method you used to deposit.</li>
        <li>Cash-outs may trigger routine security reviews and might carry small processing fees.</li>
        <li>Withdrawing your balance is handled differently than a standard purchase refund.</li>
      </ul>
      <p>
        {company} reserves the right to hold or deny any transaction if we flag it for security
        risks, fraud prevention, or compliance issues.
      </p>

      <h3 className="checkout-page__disclaimer-title">Get in Touch</h3>
      <p>
        Stuck on a payment, missing an item, or having account trouble? Hit up the support crew at:{' '}
        <a href={`mailto:${supportMail}`} className="checkout-page__link">
          {supportMail}
        </a>
      </p>
      <p>
        We work through tickets as fast as we can and aim to get back to you within 72 business
        hours.
      </p>
    </div>
  )
}

export default function CheckoutPage() {
  const formId = useId()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const packId = searchParams.get('packId')
  const creditsParam = searchParams.get('credits')
  const orderIdParam = searchParams.get('orderId')
  const currencyParam = searchParams.get('currency')?.toUpperCase() ?? 'EUR'
  const currency: MarketCurrency = isMarketCurrency(currencyParam) ? currencyParam : 'EUR'

  const [order, setOrder] = useState<CheckoutOrder | null>(null)
  const [billing, setBilling] = useState<BillingProfile>(EMPTY_BILLING_PROFILE)
  const [loading, setLoading] = useState(true)
  const [billingSaving, setBillingSaving] = useState(false)
  const [paying, setPaying] = useState(false)
  const [testing, setTesting] = useState<'success' | 'failure' | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [billingMessage, setBillingMessage] = useState<string | null>(null)

  const initParams = useMemo(() => {
    if (orderIdParam) return null
    if (packId) {
      return { packId, currency: currency.toLowerCase() } as const
    }
    const credits = Number.parseInt(creditsParam ?? '', 10)
    if (Number.isFinite(credits) && credits > 0) {
      return { customCredits: credits, currency: currency.toLowerCase() } as const
    }
    return null
  }, [orderIdParam, packId, creditsParam, currency])

  const loadOrder = useCallback(async () => {
    setError(null)
    setLoading(true)

    try {
      const [profileRes, orderRes] = await Promise.all([
        invokeCommerceAction({ type: 'profile_get' }),
        orderIdParam
          ? invokeCommerceAction({ type: 'checkout_get', orderId: orderIdParam })
          : initParams
            ? invokeCommerceAction({ type: 'checkout_init', ...initParams })
            : Promise.resolve({ error: 'invalid_checkout' as const }),
      ])

      setIsAdmin(Boolean(profileRes.isAdmin))

      if (orderRes.error || !orderRes.orderId) {
        const err = orderRes.error
        if (err === 'credits_below_minimum') {
          setError(
            `Minimum purchase is ${formatCredits(orderRes.minCredits ?? MIN_CUSTOM_CREDITS)} credits.`,
          )
        } else if (err === 'credits_above_maximum') {
          setError(
            `Maximum custom purchase is ${formatCredits(orderRes.maxCredits ?? MAX_CUSTOM_CREDITS)} credits.`,
          )
        } else if (err === 'http_500') {
          setError('Checkout is temporarily unavailable. Please try again in a moment.')
        } else {
          setError(orderRes.message ?? err ?? 'Could not start checkout.')
        }
        setOrder(null)
        return
      }

      setOrder({
        orderId: orderRes.orderId,
        credits: orderRes.credits ?? 0,
        title: orderRes.title ?? 'VOIDBORN Credits',
        totalCents: orderRes.totalCents ?? 0,
        vatCents: orderRes.vatCents ?? orderRes.totalCents ?? 0,
        currency: orderRes.currency ?? currency.toLowerCase(),
        status: orderRes.status,
      })
    } catch {
      setError('Could not load checkout.')
    } finally {
      setLoading(false)
    }
  }, [currency, initParams, orderIdParam])

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    let cancelled = false
    void fetchBillingProfile(user.id).then((saved) => {
      if (cancelled) return
      if (saved) setBilling(saved)
    })

    void loadOrder().then(() => {
      if (cancelled) return
    })

    return () => {
      cancelled = true
    }
  }, [user?.id, loadOrder])

  const saveBilling = async (): Promise<boolean> => {
    setBillingMessage(null)
    setError(null)

    if (!user?.id) {
      setError('Sign in to save your information.')
      return false
    }

    const validation = validateBillingProfileForCheckout(billing)
    if (!validation.ok) {
      setError(validation.message)
      return false
    }

    setBillingSaving(true)
    try {
      const result = await saveBillingProfile(user.id, billing)
      if (!result.ok) {
        setError(result.message)
        return false
      }
      setBillingMessage('Information saved.')
      return true
    } finally {
      setBillingSaving(false)
    }
  }

  const handleSaveBilling = () => {
    void saveBilling()
  }

  const handlePay = async () => {
    if (!order || paying) return
    setPaying(true)
    setError(null)

    try {
      const saved = await saveBilling()
      if (!saved) return

      const res = await invokeCommerceAction({ type: 'checkout_pay', orderId: order.orderId })
      if (res.error) {
        setError(res.message ?? res.error)
        return
      }

      if (res.gatewayUrl) {
        window.location.href = res.gatewayUrl
        return
      }
    } catch {
      setError('Payment could not be started.')
    } finally {
      setPaying(false)
    }
  }

  const handleTest = async (outcome: 'success' | 'failure') => {
    if (!order || testing) return
    setTesting(outcome)
    setError(null)

    try {
      if (outcome === 'success') {
        const saved = await saveBilling()
        if (!saved) return
      }

      const res = await invokeCommerceAction({
        type: 'checkout_test',
        orderId: order.orderId,
        outcome,
      })

      if (res.error) {
        setError(res.message ?? res.error)
        return
      }

      if (outcome === 'success') {
        if (res.invoiceSent === false) {
          const reason = res.invoiceReason ?? 'unknown'
          const hint =
            reason === 'mail_not_configured'
              ? 'Order paid, but invoice email is not configured on the API server (SENDMAIL_URL / MAIL_API_KEY).'
              : reason === 'no_email'
                ? 'Order paid, but no receipt email is on file for this account.'
                : reason === 'send_failed' || reason === 'request_error'
                  ? 'Order paid, but the invoice email could not be sent. Check sendmail logs.'
                  : 'Order paid. Invoice was not sent (may already have been sent).'
          setError(hint)
          return
        }
        router.push(appConfig.domain.routes.checkoutSuccess)
        return
      }

      router.push(appConfig.domain.routes.checkoutCancel)
    } catch {
      setError('Test payment could not be completed.')
    } finally {
      setTesting(null)
    }
  }

  if (!user) {
    return (
      <CheckoutPageWrap>
        <div className="checkout-page">
          <p>Sign in to complete your purchase.</p>
        </div>
      </CheckoutPageWrap>
    )
  }

  if (!orderIdParam && !initParams) {
    return (
      <CheckoutPageWrap>
        <div className="checkout-page">
          <h1>Checkout</h1>
          <p>No credits package selected.</p>
          <Link href={appConfig.domain.routes.portal} className="checkout-page__link">
            Back to portal
          </Link>
        </div>
      </CheckoutPageWrap>
    )
  }

  if (loading) {
    return (
      <CheckoutPageWrap>
        <div className="checkout-page">
          <p>Preparing checkout…</p>
        </div>
      </CheckoutPageWrap>
    )
  }

  if (!order) {
    return (
      <CheckoutPageWrap>
        <div className="checkout-page">
          <h1>Checkout</h1>
          <p className="checkout-page__error" role="alert">
            {error ?? 'Checkout unavailable.'}
          </p>
          <Link href={appConfig.domain.routes.portal} className="checkout-page__link">
            Back to portal
          </Link>
        </div>
      </CheckoutPageWrap>
    )
  }

  const money = formatOrderMoney(order.totalCents, order.currency)
  const isPaid = order.status === 'paid'

  return (
    <CheckoutPageWrap>
    <div className="checkout-page">
      <header className="checkout-page__header">
        <h1>Checkout</h1>
        <p className="checkout-page__lead">Review your order and payment details before paying.</p>
      </header>

      <div className="checkout-page__layout">
        <section className="checkout-page__card checkout-page__card--order" aria-label="Order information">
          <h2 className="checkout-page__card-title">Order information</h2>
          <dl className="checkout-page__summary">
            <div>
              <dt>Item</dt>
              <dd>Credits</dd>
            </div>
            <div>
              <dt>Quantity</dt>
              <dd>{formatCredits(order.credits)}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{money}</dd>
            </div>
            <div>
              <dt>Total incl. VAT</dt>
              <dd>{money}</dd>
            </div>
          </dl>
        </section>

        <section className="checkout-page__card checkout-page__card--billing" aria-label="Payment information">
          <div className="checkout-page__card-head">
            <h2 className="checkout-page__card-title">Payment information</h2>
            <Link href={appConfig.domain.routes.portalProfile} className="checkout-page__link">
              Edit in profile
            </Link>
          </div>

          <BillingProfileForm
            formId={formId}
            billing={billing}
            requiredFields={CHECKOUT_REQUIRED_BILLING_FIELDS}
            onChange={(field, value) => {
              setBilling((prev) => ({ ...prev, [field]: value }))
              setBillingMessage(null)
            }}
          />

          <div className="checkout-page__billing-actions">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={billingSaving}
              onClick={() => void handleSaveBilling()}
            >
              {billingSaving ? 'Saving…' : 'Save information'}
            </Button>
            {billingMessage ? (
              <p className="checkout-page__success" role="status">
                {billingMessage}
              </p>
            ) : null}
          </div>

          <div className="checkout-page__pay-block">
            <Button
              type="button"
              variant="gold"
              size="lg"
              fantasy
              className="checkout-page__pay-btn"
              disabled={paying || isPaid}
              onClick={() => void handlePay()}
            >
              {isPaid ? 'Paid' : paying ? 'Processing…' : 'Pay'}
            </Button>
            {paying ? (
              <p className="checkout-page__pay-message" role="status" aria-live="polite">
                You will be redirected to a secure payment page to complete your purchase.
              </p>
            ) : (
              <p className="checkout-page__secure-note">
                You will be redirected to a secure payment page to complete your purchase.
              </p>
            )}
          </div>

          {isAdmin ? (
            <div className="checkout-page__admin-tests" aria-label="Admin payment tests">
              <p className="checkout-page__admin-label">Admin test payments</p>
              <div className="checkout-page__admin-actions">
                <Button
                  type="button"
                  variant="trigger-green"
                  size="sm"
                  disabled={Boolean(testing) || isPaid}
                  onClick={() => void handleTest('success')}
                >
                  {testing === 'success' ? 'Processing…' : 'Payment success (test)'}
                </Button>
                <Button
                  type="button"
                  variant="trigger-orange"
                  size="sm"
                  disabled={Boolean(testing) || isPaid}
                  onClick={() => void handleTest('failure')}
                >
                  {testing === 'failure' ? 'Processing…' : 'Payment failure (test)'}
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {error ? (
        <p className="checkout-page__error" role="alert">
          {error}
        </p>
      ) : null}

      <CheckoutDisclaimer />
    </div>
    </CheckoutPageWrap>
  )
}
