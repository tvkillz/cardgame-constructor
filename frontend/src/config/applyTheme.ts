import { appConfig } from './app.config'
import { getArenaBackground, getLobbyBackground } from './selectors'

/** CSS custom properties for :root — safe for SSR inline styles and client applyTheme(). */
export function buildThemeCssVars(): Record<string, string> {
  const { colors, landing } = appConfig
  const lobbyBg = getLobbyBackground()
  const arenaBg = getArenaBackground()
  const playLogo = appConfig.logo.playLogo
  const variant = landing?.variant ?? 'voidborn'

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
    '--font-fantasy': appConfig.theme.fonts.fantasy,
    '--font-ui': appConfig.theme.fonts.ui,
    '--headline-gradient': `linear-gradient(105deg, ${colors.accentPink} 0%, ${colors.ember} 22%, ${colors.accentPurple} 48%, ${colors.violetAccent} 72%, ${colors.purpleGlow} 100%)`,
    '--play-lobby-bg': `url(${lobbyBg})`,
    '--play-arena-bg': `url(${arenaBg})`,
    '--game-lobby-bg': `url(${lobbyBg})`,
    '--game-arena-bg': `url(${arenaBg})`,
    ...(playLogo ? { '--card-back-logo': `url(${playLogo})` } : {}),
  }

  if (variant === 'iyashikei') {
    vars['--surface-paper'] = colors.voidBlack
    vars['--surface-ink'] = colors.textPrimary
    vars['--hero-vignette-top'] = 'rgba(245, 240, 230, 0.72)'
    vars['--hero-vignette-mid'] = 'rgba(245, 240, 230, 0.2)'
    vars['--hero-vignette-bottom'] = 'rgba(245, 240, 230, 0.92)'
    vars['--iyashikei-heading-gradient'] =
      'linear-gradient(105deg, #4a6a4a 0%, #5a7a5a 35%, #6a9ec4 70%, #c9a87c 100%)'
    vars['--font-heading'] = "'Hiro Misake', 'Shippori Mincho', serif"
  }

  return vars
}

/** Injects brand palette and fonts as CSS custom properties on :root. */
export function applyTheme(): void {
  const root = document.documentElement
  const variant = appConfig.landing?.variant ?? 'voidborn'

  root.dataset.landingVariant = variant

  for (const [key, value] of Object.entries(buildThemeCssVars())) {
    root.style.setProperty(key, value)
  }

  document.title = appConfig.seo.title
}
