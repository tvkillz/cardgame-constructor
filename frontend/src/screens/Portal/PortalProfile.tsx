'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'
import { appConfig } from '@/config'
import { Button } from '@/components/ui/Button/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { isValidPassword, isValidPhone } from '@/lib/auth/validation'
import {
  EMPTY_BILLING_PROFILE,
  fetchBillingProfile,
  saveBillingProfile,
  type BillingProfile,
} from '@/lib/profile/billing'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'
import './PortalProfile.css'

type BillingField = keyof BillingProfile

function ProfileField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
}) {
  return (
    <label className="portal-profile__field" htmlFor={id}>
      <span className="portal-profile__label">{label}</span>
      <input
        id={id}
        className="portal-profile__input"
        type="text"
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export default function PortalProfile() {
  const formId = useId()
  const { user } = useAuth()
  const authCopy = appConfig.descriptions.auth

  const [billing, setBilling] = useState<BillingProfile>(EMPTY_BILLING_PROFILE)
  const [billingLoading, setBillingLoading] = useState(true)
  const [billingSaving, setBillingSaving] = useState(false)
  const [billingError, setBillingError] = useState<string | null>(null)
  const [billingSuccess, setBillingSuccess] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    if (!user?.id) {
      setBillingLoading(false)
      return
    }

    let cancelled = false
    void fetchBillingProfile(user.id).then((saved) => {
      if (cancelled) return
      if (saved) setBilling(saved)
      setBillingLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const setBillingField = (field: BillingField, value: string) => {
    setBilling((prev) => ({ ...prev, [field]: value }))
    setBillingSuccess(null)
  }

  const handleSaveBilling = async (event: FormEvent) => {
    event.preventDefault()
    setBillingError(null)
    setBillingSuccess(null)

    if (!user?.id) {
      setBillingError('Sign in to save billing info.')
      return
    }

    if (!isValidPhone(billing.phone)) {
      setBillingError('Enter a valid phone number (at least 8 characters).')
      return
    }

    setBillingSaving(true)
    try {
      const result = await saveBillingProfile(user.id, billing)
      if (!result.ok) {
        setBillingError(result.message)
        return
      }
      setBillingSuccess('Billing info saved.')
    } finally {
      setBillingSaving(false)
    }
  }

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!isSupabaseConfigured() || !user?.email) {
      setPasswordError(authCopy.errors.supabaseUnavailable)
      return
    }

    if (!currentPassword) {
      setPasswordError(authCopy.errors.signInEmptyPassword)
      return
    }

    if (!isValidPassword(newPassword)) {
      setPasswordError(authCopy.errors.invalidPassword)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(authCopy.errors.passwordMismatch)
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setPasswordError(authCopy.errors.supabaseUnavailable)
      return
    }

    setPasswordSaving(true)
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (verifyError) {
        setPasswordError('Current password is incorrect.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setPasswordError(updateError.message || authCopy.errors.signUpFailed)
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Password updated.')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="portal-profile">
      <form className="portal-profile__card portal-profile__card--billing" onSubmit={handleSaveBilling}>
        <h2 className="portal-profile__card-title">Billing Profile</h2>

        {billingLoading ? (
          <p className="portal-profile__status">{authCopy.loading}</p>
        ) : (
          <>
            <div className="portal-profile__card-body">
              <div className="portal-profile__grid portal-profile__grid--pair">
              <ProfileField
                id={`${formId}-first-name`}
                label="First Name"
                value={billing.firstName}
                autoComplete="given-name"
                onChange={(value) => setBillingField('firstName', value)}
              />
              <ProfileField
                id={`${formId}-last-name`}
                label="Last Name"
                value={billing.lastName}
                autoComplete="family-name"
                onChange={(value) => setBillingField('lastName', value)}
              />
            </div>

            <ProfileField
              id={`${formId}-address-1`}
              label="Address Line 1"
              value={billing.addressLine1}
              autoComplete="address-line1"
              onChange={(value) => setBillingField('addressLine1', value)}
            />
            <ProfileField
              id={`${formId}-address-2`}
              label="Address Line 2"
              value={billing.addressLine2}
              autoComplete="address-line2"
              onChange={(value) => setBillingField('addressLine2', value)}
            />

            <div className="portal-profile__grid portal-profile__grid--pair">
              <ProfileField
                id={`${formId}-city`}
                label="City"
                value={billing.city}
                autoComplete="address-level2"
                onChange={(value) => setBillingField('city', value)}
              />
              <ProfileField
                id={`${formId}-state`}
                label="State / Province"
                value={billing.stateProvince}
                autoComplete="address-level1"
                onChange={(value) => setBillingField('stateProvince', value)}
              />
            </div>

            <div className="portal-profile__grid portal-profile__grid--pair">
              <ProfileField
                id={`${formId}-postal`}
                label="Postal Code"
                value={billing.postalCode}
                autoComplete="postal-code"
                onChange={(value) => setBillingField('postalCode', value)}
              />
              <ProfileField
                id={`${formId}-country`}
                label="Country"
                value={billing.country}
                autoComplete="country-name"
                onChange={(value) => setBillingField('country', value)}
              />
            </div>

            <ProfileField
              id={`${formId}-phone`}
              label="Phone"
              value={billing.phone}
              autoComplete="tel"
              onChange={(value) => setBillingField('phone', value)}
            />
            </div>

            <div className="portal-profile__card-footer">
            {billingError ? (
              <p className="portal-profile__message portal-profile__message--error" role="alert">
                {billingError}
              </p>
            ) : null}
            {billingSuccess ? (
              <p className="portal-profile__message portal-profile__message--success" role="status">
                {billingSuccess}
              </p>
            ) : null}

            <div className="portal-profile__actions">
              <Button
                type="submit"
                variant="secondary"
                size="md"
                fantasy
                disabled={billingSaving || billingLoading}
              >
                {billingSaving ? 'Saving…' : 'Save Billing Info'}
              </Button>
            </div>
            </div>
          </>
        )}
      </form>

      <div className="portal-profile__side">
        <section className="portal-profile__card portal-profile__card--compact portal-profile__card--payment">
          <div className="portal-profile__card-header">
            <h2 className="portal-profile__card-title">Payment Cards</h2>
            <Button type="button" variant="secondary" size="sm" fantasy>
              Add Card
            </Button>
          </div>
          <p className="portal-profile__empty">
            No cards found. Use Add Card to open processor stub.
          </p>
        </section>

        <form
          className="portal-profile__card portal-profile__card--compact portal-profile__card--password"
          onSubmit={handleChangePassword}
        >
          <h2 className="portal-profile__card-title">Change Password</h2>

          <div className="portal-profile__card-body">
          <label className="portal-profile__field" htmlFor={`${formId}-current-password`}>
            <span className="portal-profile__label">Current Password</span>
            <input
              id={`${formId}-current-password`}
              className="portal-profile__input"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </label>

          <label className="portal-profile__field" htmlFor={`${formId}-new-password`}>
            <span className="portal-profile__label">New Password</span>
            <input
              id={`${formId}-new-password`}
              className="portal-profile__input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>

          <label className="portal-profile__field" htmlFor={`${formId}-confirm-password`}>
            <span className="portal-profile__label">Confirm New Password</span>
            <input
              id={`${formId}-confirm-password`}
              className="portal-profile__input"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          <p className="portal-profile__hint">{authCopy.passwordHint}</p>
          </div>

          <div className="portal-profile__card-footer">
          {passwordError ? (
            <p className="portal-profile__message portal-profile__message--error" role="alert">
              {passwordError}
            </p>
          ) : null}
          {passwordSuccess ? (
            <p className="portal-profile__message portal-profile__message--success" role="status">
              {passwordSuccess}
            </p>
          ) : null}

          <div className="portal-profile__actions portal-profile__actions--center">
            <Button type="submit" variant="secondary" size="md" fantasy disabled={passwordSaving}>
              {passwordSaving ? 'Updating…' : 'Change Password'}
            </Button>
          </div>
          </div>
        </form>
      </div>
    </div>
  )
}
