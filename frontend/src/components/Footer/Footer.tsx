'use client'

import Link from 'next/link'
import { appConfig } from '@/config'
import { useCookieConsent } from '@/components/cookies/CookieConsentProvider'
import './Footer.css'

export default function Footer() {
  const { name, descriptions } = appConfig
  const { footer } = descriptions
  const { openSettings } = useCookieConsent()

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <h2 className="site-footer__brand-name">{name.display}</h2>
            <p className="site-footer__brand-tagline">{footer.brand.tagline}</p>
          </div>

          <div className="site-footer__column">
            <h3 className="site-footer__heading">Legal</h3>
            <ul className="site-footer__links" role="list">
              {footer.legal.map((link) => (
                <li key={link.id}>
                  <Link href={link.href} className="site-footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__column">
            <h3 className="site-footer__heading">Contact</h3>
            <ul className="site-footer__contact" role="list">
              <li>
                <span className="site-footer__contact-label">Company name:</span>{' '}
                {footer.contact.companyName}
              </li>
              <li>
                <span className="site-footer__contact-label">Company number:</span>{' '}
                {footer.contact.companyNumber}
              </li>
              <li>
                <span className="site-footer__contact-label">Registered address:</span>{' '}
                {footer.contact.address}
              </li>
              <li>
                <a href={`mailto:${footer.contact.email}`} className="site-footer__link">
                  {footer.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__sub">
          <p className="site-footer__copyright">{footer.copyright}</p>
          <p className="site-footer__crafted">{footer.crafted}</p>
          <button type="button" className="site-footer__cookie-btn" onClick={openSettings}>
            {footer.cookieSettingsLabel}
          </button>
        </div>

        <p className="site-footer__sub-copy">{footer.subCopyright}</p>
      </div>
    </footer>
  )
}
