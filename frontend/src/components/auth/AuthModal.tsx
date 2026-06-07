'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'
import { appConfig } from '@/config'
import { Button } from '@/components/ui/Button/Button'
import { useAuth, type AuthModalMode } from '@/components/providers/AuthProvider'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'
import { mapSignInError } from '@/lib/auth/errors'
import { toSiteAuthEmail } from '@/lib/auth/site-email'
import { getSiteId } from '@/lib/site'
import { isValidEmail, isValidPassword, isValidUsername } from '@/lib/auth/validation'
import './AuthModal.css'

export default function AuthModal() {
  const {
    modalOpen,
    modalMode,
    closeAuthModal,
    openAuthModal,
  } = useAuth()

  const copy = appConfig.descriptions.auth
  const titleId = useId()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isRegister = modalMode === 'register'

  useEffect(() => {
    if (!modalOpen) return
    setError(null)
    setInfo(null)
    setSubmitting(false)
  }, [modalOpen, modalMode])

  const switchMode = (mode: AuthModalMode) => {
    setError(null)
    setInfo(null)
    openAuthModal(mode)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!isSupabaseConfigured()) {
      setError(copy.errors.supabaseUnavailable)
      return
    }

    const trimmedEmail = email.trim()
    if (!isValidEmail(trimmedEmail)) {
      setError(copy.errors.invalidEmail)
      return
    }

    if (isRegister) {
      if (!isValidPassword(password)) {
        setError(copy.errors.invalidPassword)
        return
      }
      if (!isValidUsername(username)) {
        setError(copy.errors.invalidUsername)
        return
      }
      if (password !== confirmPassword) {
        setError(copy.errors.passwordMismatch)
        return
      }
    } else if (!password) {
      setError(copy.errors.signInEmptyPassword)
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setError(copy.errors.supabaseUnavailable)
      return
    }

    const siteId = getSiteId()
    const authEmail = toSiteAuthEmail(siteId, trimmedEmail)

    setSubmitting(true)

    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              username: username.trim(),
              site_id: siteId,
              display_email: trimmedEmail,
            },
          },
        })

        if (signUpError) {
          setError(signUpError.message || copy.errors.signUpFailed)
          return
        }

        if (data.session) {
          closeAuthModal()
          return
        }

        setInfo(copy.errors.emailConfirmation)
        switchMode('signIn')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      })

      if (signInError) {
        setError(mapSignInError(signInError.message))
        return
      }

      closeAuthModal()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={`auth-modal${modalOpen ? ' auth-modal--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-hidden={!modalOpen}
    >
      <button
        type="button"
        className="auth-modal__backdrop"
        aria-label={copy.closeLabel}
        onClick={closeAuthModal}
      />

      <div className="auth-modal__panel">
        <button
          type="button"
          className="auth-modal__close"
          aria-label={copy.closeLabel}
          onClick={closeAuthModal}
        >
          ×
        </button>

        <h2 id={titleId} className="auth-modal__title">
          {isRegister ? copy.registerTitle : copy.signInTitle}
        </h2>
        <p className="auth-modal__subtitle">
          {isRegister ? copy.registerSubtitle : copy.signInSubtitle}
        </p>

        <form className="auth-modal__form" onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <label className="auth-modal__field">
              <span className="auth-modal__label">{copy.usernameLabel}</span>
              <input
                className="auth-modal__input"
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
                disabled={submitting}
                required
              />
            </label>
          )}

          <label className="auth-modal__field">
            <span className="auth-modal__label">{copy.emailLabel}</span>
            <input
              className="auth-modal__input"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              disabled={submitting}
              required
            />
          </label>

          <label className="auth-modal__field">
            <span className="auth-modal__label">{copy.passwordLabel}</span>
            <input
              className="auth-modal__input"
              type="password"
              name="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              disabled={submitting}
              required
            />
            {isRegister && (
              <span className="auth-modal__hint">{copy.passwordHint}</span>
            )}
          </label>

          {isRegister && (
            <label className="auth-modal__field">
              <span className="auth-modal__label">{copy.confirmPasswordLabel}</span>
              <input
                className="auth-modal__input"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(ev) => setConfirmPassword(ev.target.value)}
                disabled={submitting}
                required
              />
            </label>
          )}

          {error && (
            <p className="auth-modal__message auth-modal__message--error" role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className="auth-modal__message auth-modal__message--info" role="status">
              {info}
            </p>
          )}

          <div className="auth-modal__actions">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fantasy
              disabled={submitting}
              className="auth-modal__submit"
            >
              {submitting
                ? copy.loading
                : isRegister
                  ? copy.registerSubmit
                  : copy.signInSubmit}
            </Button>
          </div>
        </form>

        <p className="auth-modal__switch">
          {isRegister ? (
            <button
              type="button"
              className="auth-modal__switch-btn"
              onClick={() => switchMode('signIn')}
              disabled={submitting}
            >
              {copy.switchToSignIn}
            </button>
          ) : (
            <button
              type="button"
              className="auth-modal__switch-btn"
              onClick={() => switchMode('register')}
              disabled={submitting}
            >
              {copy.switchToRegister}
            </button>
          )}
        </p>
      </div>
    </div>
  )
}
