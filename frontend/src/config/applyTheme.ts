import { appConfig } from './app.config'
import { getArenaBackground, getLobbyBackground } from './selectors'

/** Injects brand palette and fonts as CSS custom properties on :root. */
export function applyTheme(): void {
  const { colors } = appConfig
  const lobbyBg = getLobbyBackground()
  const arenaBg = getArenaBackground()
  const root = document.documentElement

  const vars: Record<string, string> = {
    '--void-black': colors.voidBlack,
    '--gold': colors.gold,
    '--purple-glow': colors.purpleGlow,
    '--cyan-glow': colors.cyanGlow,
    '--ember': colors.ember,
    '--violet-accent': colors.violetAccent,
    '--text-primary': colors.textPrimary,
    '--text-muted': colors.textMuted,
    '--accent-pink': colors.accentPink,
    '--accent-purple': colors.accentPurple,
    '--play-cyan': colors.playCyan,
    '--play-gold': colors.playGold,
    '--trigger-orange': colors.triggerOrange,
    '--trigger-green': colors.triggerGreen,
    '--trigger-blue': colors.triggerBlue,
    '--play-lobby-bg': `url(${lobbyBg})`,
    '--play-arena-bg': `url(${arenaBg})`,
    '--game-lobby-bg': `url(${lobbyBg})`,
    '--game-arena-bg': `url(${arenaBg})`,
  }

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }

  document.title = appConfig.seo.title
}
