'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  appConfig,
  formatCredits,
  resolveAccountMenuHref,
} from '@/config'
import type { PortalSectionConfig } from '@/config/schema'
import PortalAuthGate from '@/components/auth/PortalAuthGate'
import PurchaseCreditsModal from '@/components/credits/PurchaseCreditsModal'
import { useAuth } from '@/components/providers/AuthProvider'
import { prefetchCardCatalog } from '@/hooks/useCardCatalog'
import { useWallet } from '@/hooks/useWallet'
import { Button } from '@/components/ui/Button/Button'
import './PortalShell.css'

function resolveSectionHref(section: PortalSectionConfig): string {
  return appConfig.domain.routes[section.route]
}

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { name, theme } = appConfig
  const { playerName: username, signOut } = useAuth()
  const portalCopy = appConfig.descriptions.portal
  const [menuOpen, setMenuOpen] = useState(false)
  const [creditsOpen, setCreditsOpen] = useState(false)

  const activeSection = useMemo(
    () =>
      appConfig.portal.sections.find(
        (section) => resolveSectionHref(section) === pathname,
      ) ?? appConfig.portal.sections[0],
    [pathname],
  )

  const { balanceCredits, loading: walletLoading, refresh: refreshWallet } = useWallet()
  const credits = walletLoading ? theme.player.defaultCredits : balanceCredits

  useEffect(() => {
    void prefetchCardCatalog()
  }, [])

  return (
    <PortalAuthGate>
      <div className="portal">
        <header className="portal__header">
          <Link href={appConfig.domain.routes.home} className="portal__brand">
            <img
              src={appConfig.logo.src}
              alt={appConfig.logo.alt}
              className="portal__logo"
            />
            <span className="portal__brand-name">{name.display}</span>
          </Link>

          <div className="portal__account">
            <div className="portal__account-info">
              <span className="portal__account-name">{username}</span>
              <span className="portal__account-credits">
                <span className="portal__credit-icon" aria-hidden="true" />
                {formatCredits(credits)}
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

        {menuOpen && (
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
                          setCreditsOpen(true)
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
        )}

        <nav className="portal__tabs" aria-label="Player portal">
          {appConfig.portal.sections.map((section) => {
            const href = resolveSectionHref(section)
            const isActive = pathname === href
            return (
              <Link
                key={section.id}
                href={href}
                className={`portal__tab${isActive ? ' portal__tab--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {section.label}
              </Link>
            )
          })}
        </nav>

        <div className="portal__toolbar">
          <div className="portal__toolbar-copy">
            <h1 className="portal__section-title">{activeSection.title}</h1>
            <p className="portal__section-subtitle">{activeSection.subtitle}</p>
          </div>
          <div className="portal__toolbar-actions">
            <span className="portal__toolbar-balance">
              <span className="portal__credit-icon" aria-hidden="true" />
              {formatCredits(credits)}
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              fantasy
              onClick={() => setCreditsOpen(true)}
            >
              {portalCopy.buyCredits}
            </Button>
            <Button type="button" variant="secondary" size="sm" disabled>
              {portalCopy.withdraw}
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled>
              {portalCopy.cart}
            </Button>
            <label className="portal__currency">
              <span className="visually-hidden">Currency</span>
              <select disabled defaultValue="AUD">
                <option value="AUD">{portalCopy.currencyLabel}</option>
              </select>
            </label>
          </div>
        </div>

        <main className="portal__main">{children}</main>
      </div>

      <PurchaseCreditsModal
        isOpen={creditsOpen}
        onClose={() => {
          setCreditsOpen(false)
          void refreshWallet()
        }}
      />
    </PortalAuthGate>
  )
}
