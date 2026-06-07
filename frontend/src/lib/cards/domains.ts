import type { ElementCategory } from '@/config/schema'

import gameConfig from '@project/game-config'

export type CardDomain = 'terra' | 'aqua' | 'ignis' | 'zephyr'

export const DOMAIN_TO_CATEGORY = gameConfig.domainToCategory as Record<
  CardDomain,
  ElementCategory
>

export const DOMAIN_GLOW = gameConfig.domainGlow as Record<CardDomain, string>

/** Landing realm id → featured card slug (one per location). */
export const FEATURED_CARD_BY_LOCATION = gameConfig.featuredByLocation as Record<
  string,
  string
>

export const LOCATION_ORDER = gameConfig.locationOrder as readonly string[]

export const KEYWORDS_GLOSSARY = gameConfig.keywords as Record<string, string>
