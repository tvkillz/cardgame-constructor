'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  appConfig,
  formatCredits,
  resolveAccountMenuHref,
} from '@/config'
import PurchaseCreditsModal from '@/components/credits/PurchaseCreditsModal'
import { useAuth } from '@/components/providers/AuthProvider'
import { useWallet } from '@/hooks/useWallet'
import '@/styles/coin-stack-icon.css'

type PortalHeaderProps = {
  /** When set, purchase-credits actions delegate to the parent (portal toolbar). */
  onPurchaseCredits?: () => void
}

export default function PortalHeader({ onPurchaseCredits }: PortalHeaderProps) {
  const { name, theme } = appConfig
  const { playerName: username, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [localCreditsOpen, setLocalCreditsOpen] = useState(false)

  const { balanceCredits, loading: walletLoading, refresh: refreshWallet } = useWallet()
  const creditsLabel = walletLoading ? '…' : formatCredits(balanceCredits)

  const openCredits = () => {
    if (onPurchaseCredits) onPurchaseCredits()
    else setLocalCreditsOpen(true)
  }

  return (
    <>
      <header className="portal__header">
        <Link href={appConfig.domain.routes.home} className="portal__brand">
          <img src={appConfig.logo.src} alt={appConfig.logo.alt} className="portal__logo" />
          <span className="portal__brand-name">{name.display}</span>
        </Link>

        <div className="portal__account">
          <div className="portal__account-info">
            <span className="portal__account-name">{username}</span>
            <span className="portal__account-credits">
              <span className="coin-stack-icon coin-stack-icon--sm" aria-hidden="true" />
              {creditsLabel}
            </span>
          </div>
          <button
            type="button"
            className={`portal__menu-toggle${menuOpen ? ' portal__menu-toggle--open' : ''}`}
            aria-expanded={menuOpen}
            aria-label="Account menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <nav className="portal__account-menu" aria-label="Account menu">
          <ul className="portal__account-menu-list">
            {theme.accountMenu.map((item) => {
              if (item.action === 'signOut') {
                return (
                  <li key={item.id} className="portal__account-menu-item--sign-out">
                    <button
                      type="button"
                      onClick={() => {
                        void signOut()
                        setMenuOpen(false)
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                )
              }
              if (item.action === 'purchaseCredits') {
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        openCredits()
                        setMenuOpen(false)
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                )
              }
              if (item.route) {
                return (
                  <li key={item.id}>
                    <Link
                      href={resolveAccountMenuHref(item.route)}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              }
              return null
            })}
          </ul>
        </nav>
      ) : null}

      {!onPurchaseCredits ? (
        <PurchaseCreditsModal
          isOpen={localCreditsOpen}
          onClose={() => {
            setLocalCreditsOpen(false)
            void refreshWallet()
          }}
        />
      ) : null}
    </>
  )
}
