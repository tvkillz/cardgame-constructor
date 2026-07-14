import { Game as IyashikeiGame } from './iyashikei/Game'
import { getGameplayVariant } from './resolve'
import { Game as VoidbornGame } from './voidborn/Game'

export { getGameplayVariant } from './resolve'
export type { GameplayVariant } from './resolve'
export type { GameProps } from './types'

/** Arena shell for the compiled project (`voidborn` | `iyashikei`). */
export const Game = getGameplayVariant() === 'iyashikei' ? IyashikeiGame : VoidbornGame

export default Game
