import { Game as FinalWhistleGame } from './final_whistle/Game'
import { Game as HelixGame } from './helix/Game'
import { Game as IyashikeiGame } from './iyashikei/Game'
import { getGameplayVariant } from './resolve'
import { Game as VoidbornGame } from './voidborn/Game'

export { getGameplayVariant } from './resolve'
export type { GameplayVariant } from './resolve'
export type { GameProps } from './types'

const gameplayVariant = getGameplayVariant()

/** Arena shell for the compiled project (`voidborn` | `iyashikei` | `helix` | `final_whistle`). */
export const Game =
  gameplayVariant === 'iyashikei'
    ? IyashikeiGame
    : gameplayVariant === 'helix'
      ? HelixGame
      : gameplayVariant === 'final_whistle'
        ? FinalWhistleGame
        : VoidbornGame

export default Game
