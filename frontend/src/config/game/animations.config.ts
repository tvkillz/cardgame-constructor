import { getGameplayVariant } from '@/gameplay/resolve'
import { gameAnimationsConfig as iyashikeiAnimations } from '@/gameplay/iyashikei/animations.config'
import { gameAnimationsConfig as voidbornAnimations } from '@/gameplay/voidborn/animations.config'

/** Per-project arena animation tuning — edit under `src/gameplay/{variant}/`. */
export const gameAnimationsConfig =
  getGameplayVariant() === 'iyashikei' ? iyashikeiAnimations : voidbornAnimations
