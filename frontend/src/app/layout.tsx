import type { CSSProperties } from 'react'
import { appConfig } from '@/config'
import { getArenaBackground, getLobbyBackground } from '@/config/selectors'
import { buildSiteMetadata } from '@/lib/seo/siteMetadata'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { CookieConsentProvider } from '@/components/cookies/CookieConsentProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { rootFontClassName } from '@/lib/fonts'
import '@/index.css'
import '@/components/ui/Button/Button.css'

const lobbyBg = getLobbyBackground()
const arenaBg = getArenaBackground()
const playLogo = appConfig.logo.playLogo
const { fonts } = appConfig.theme
const googleFontsUrl = fonts.googleFontsUrl
const isIyashikei = appConfig.landing?.variant === 'iyashikei'

export const metadata = buildSiteMetadata(appConfig)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={rootFontClassName}
      style={
        {
          '--font-fantasy': fonts.fantasy,
          '--font-ui': fonts.ui,
          ...(isIyashikei
            ? { '--font-heading': "'Hiro Misake', 'Shippori Mincho', serif" }
            : {}),
          '--play-lobby-bg': `url(${lobbyBg})`,
          '--play-arena-bg': `url(${arenaBg})`,
          '--game-lobby-bg': `url(${lobbyBg})`,
          '--game-arena-bg': `url(${arenaBg})`,
          ...(playLogo ? { '--card-back-logo': `url(${playLogo})` } : {}),
        } as CSSProperties
      }
      suppressHydrationWarning
    >
      <head>
        {googleFontsUrl ? (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link rel="stylesheet" href={googleFontsUrl} />
          </>
        ) : null}
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <CookieConsentProvider>{children}</CookieConsentProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
