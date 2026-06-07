import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { appConfig } from '@/config'
import { getArenaBackground, getLobbyBackground } from '@/config/selectors'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { rootFontClassName } from '@/lib/fonts'
import '@/index.css'
import '@/components/ui/Button/Button.css'

const lobbyBg = getLobbyBackground()
const arenaBg = getArenaBackground()

export const metadata: Metadata = {
  title: appConfig.name.documentTitle,
  description: appConfig.descriptions.hero.subheadline,
  icons: {
    icon: appConfig.logo.favicon,
  },
}

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
          '--play-lobby-bg': `url(${lobbyBg})`,
          '--play-arena-bg': `url(${arenaBg})`,
          '--game-lobby-bg': `url(${lobbyBg})`,
          '--game-arena-bg': `url(${arenaBg})`,
        } as CSSProperties
      }
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preload"
          href={appConfig.arts.introVideo}
          as="video"
          type="video/mp4"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
