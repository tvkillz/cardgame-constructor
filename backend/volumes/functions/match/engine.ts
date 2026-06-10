/** Server-side match engine (mirrors voidborn-frontend/src/lib/game/match). */

export const BOARD_SLOT_COUNT = 4
export const INITIAL_HAND_SIZE = 4
export const VILLAIN_DECK_SIZE = 20
export const STARTING_PLAYER_HP = 25
export const STARTING_MANA = 5
export const STARTING_MAX_MANA = 5
export const MANA_PER_TURN = 1

export type MatchPhase = 'hero_main' | 'villain_main' | 'combat' | 'ended'
export type MatchSide = 'hero' | 'villain'

export interface MatchCardInstance {
  instanceId: string
  slug: string
  mana: number
  attack: number
  health: number
  maxHealth: number
  frozen?: boolean
}

export interface BoardUnit extends MatchCardInstance {
  slotIndex: number
  frozen?: boolean
}

const FREEZE_SLUGS = new Set(['thalassa_card_01_tidebound_priestess'])
const FREEZE_PROC_CHANCE = 0.5

export interface FreezeEvent {
  casterSide: MatchSide
  casterSlot: number
  targetSide: MatchSide
  targetSlot: number
  success: boolean
}

export interface PlayCardResult {
  state: MatchState
  freeze: FreezeEvent | null
}

function slugHasFreeze(slug: string): boolean {
  return FREEZE_SLUGS.has(slug)
}

function tryApplyFreezeOnPlay(
  state: MatchState,
  side: MatchSide,
  slotIndex: number,
): { state: MatchState; freeze: FreezeEvent | null } {
  const unit = (side === 'hero' ? state.hero : state.villain).board[slotIndex]
  if (!unit || !slugHasFreeze(unit.slug)) return { state, freeze: null }

  const targetSide: MatchSide = side === 'hero' ? 'villain' : 'hero'
  const enemy = targetSide === 'hero' ? state.hero : state.villain
  const targetSlot =
    enemy.board[slotIndex] != null ? slotIndex : enemy.board.findIndex((u) => u != null)

  const baseEvent: FreezeEvent = {
    casterSide: side,
    casterSlot: slotIndex,
    targetSide,
    targetSlot,
    success: false,
  }

  if (targetSlot === -1) return { state, freeze: baseEvent }

  if (Math.random() >= FREEZE_PROC_CHANCE) {
    return { state, freeze: { ...baseEvent, success: false } }
  }

  const target = enemy.board[targetSlot]
  if (!target) return { state, freeze: baseEvent }

  const next = cloneMatch(state)
  const lane = targetSide === 'hero' ? next.hero.board : next.villain.board
  lane[targetSlot] = { ...target, frozen: true }

  return {
    state: next,
    freeze: { ...baseEvent, targetSlot, success: true },
  }
}

function clearAllFrozen(state: MatchState): MatchState {
  const clear = (board: (BoardUnit | null)[]) =>
    board.map((u) => (u ? { ...u, frozen: false } : null))
  const next = cloneMatch(state)
  next.hero.board = clear(next.hero.board)
  next.villain.board = clear(next.villain.board)
  return next
}

export interface PlayerBattleState {
  hp: number
  mana: number
  maxMana: number
  hand: MatchCardInstance[]
  board: (BoardUnit | null)[]
  deck: MatchCardInstance[]
  graveyard: MatchCardInstance[]
}

export interface MatchState {
  turn: number
  phase: MatchPhase
  winner: MatchSide | null
  heroCombatDone?: boolean
  hero: PlayerBattleState
  villain: PlayerBattleState
}

export interface CombatStrike {
  attackerSide: MatchSide
  slotIndex: number
  damage: number
  targetSide: MatchSide
  targetSlot: number | null
  killed: boolean
  faceDamage: number
  attackerEliminated?: boolean
}

export interface CombatRoundResult {
  strikes: CombatStrike[]
  heroHp: number
  villainHp: number
}

function emptyBoard(): (BoardUnit | null)[] {
  return Array.from({ length: BOARD_SLOT_COUNT }, () => null)
}

function clonePlayer(player: PlayerBattleState): PlayerBattleState {
  return {
    ...player,
    hand: [...player.hand],
    board: [...player.board],
    deck: [...player.deck],
    graveyard: [...player.graveyard],
  }
}

function cloneMatch(state: MatchState): MatchState {
  return {
    ...state,
    hero: clonePlayer(state.hero),
    villain: clonePlayer(state.villain),
  }
}

export function createMatch(
  heroDeckShuffled: MatchCardInstance[],
  villainDeckShuffled: MatchCardInstance[],
): MatchState {
  const heroDraw = [...heroDeckShuffled]
  const villainDraw = [...villainDeckShuffled]
  const heroHand = heroDraw.splice(0, INITIAL_HAND_SIZE)
  const villainHand = villainDraw.splice(0, INITIAL_HAND_SIZE)

  return {
    turn: 1,
    phase: 'hero_main',
    winner: null,
    hero: {
      hp: STARTING_PLAYER_HP,
      mana: STARTING_MANA,
      maxMana: STARTING_MAX_MANA,
      hand: heroHand,
      board: emptyBoard(),
      deck: heroDraw,
      graveyard: [],
    },
    villain: {
      hp: STARTING_PLAYER_HP,
      mana: STARTING_MANA,
      maxMana: STARTING_MAX_MANA,
      hand: villainHand,
      board: emptyBoard(),
      deck: villainDraw,
      graveyard: [],
    },
  }
}

export function firstEmptySlot(board: (BoardUnit | null)[]): number | null {
  const idx = board.findIndex((s) => s === null)
  return idx === -1 ? null : idx
}

export function playCardToBoard(
  state: MatchState,
  side: MatchSide,
  instanceId: string,
  slotIndex: number,
): PlayCardResult | null {
  if (slotIndex < 0 || slotIndex >= BOARD_SLOT_COUNT) return null
  const player = side === 'hero' ? state.hero : state.villain
  if (player.board[slotIndex] !== null) return null
  const handIndex = player.hand.findIndex((c) => c.instanceId === instanceId)
  if (handIndex === -1) return null
  const card = player.hand[handIndex]
  if (player.mana < card.mana) return null

  const next = cloneMatch(state)
  const p = side === 'hero' ? next.hero : next.villain
  const [played] = p.hand.splice(handIndex, 1)
  p.mana -= played.mana
  p.board[slotIndex] = { ...played, slotIndex }
  const { state: afterFreeze, freeze } = tryApplyFreezeOnPlay(next, side, slotIndex)
  return { state: afterFreeze, freeze }
}

function drawCard(player: PlayerBattleState): void {
  if (player.deck.length === 0) return
  const [card] = player.deck.splice(0, 1)
  player.hand.push(card)
}

export function grantSideTurnStart(player: PlayerBattleState): void {
  player.maxMana += MANA_PER_TURN
  player.mana = player.maxMana
}

export function startVillainTurn(state: MatchState): MatchState {
  const next = cloneMatch(state)
  grantSideTurnStart(next.villain)
  return next
}

export function drawAtTurnStart(state: MatchState, side: MatchSide): MatchState {
  const next = cloneMatch(state)
  if (side === 'hero') drawCard(next.hero)
  else drawCard(next.villain)
  return next
}

export function pickVillainPlays(state: MatchState): { instanceId: string; slotIndex: number }[] {
  const plays: { instanceId: string; slotIndex: number }[] = []
  const hand = [...state.villain.hand]
  const board = state.villain.board.map((u) => u)
  let mana = state.villain.mana
  const shuffled = hand.sort(() => Math.random() - 0.5)

  for (const card of shuffled) {
    if (mana < card.mana) continue
    const slot = firstEmptySlot(board)
    if (slot === null) break
    plays.push({ instanceId: card.instanceId, slotIndex: slot })
    mana -= card.mana
    board[slot] = { ...card, slotIndex: slot }
  }
  return plays
}

export type CombatSidesMode = 'both' | 'hero' | 'villain'

export function resolveCombatSides(
  state: MatchState,
  sides: CombatSidesMode,
): { state: MatchState; combat: CombatRoundResult } {
  const next = cloneMatch(state)
  const strikes: CombatStrike[] = []
  const heroAttacks = sides === 'both' || sides === 'hero'
  const villainAttacks = sides === 'both' || sides === 'villain'

  for (let slot = 0; slot < BOARD_SLOT_COUNT; slot += 1) {
    const heroUnit = next.hero.board[slot]
    const villainUnit = next.villain.board[slot]

    if (heroUnit && villainUnit) {
      if (heroAttacks) villainUnit.health -= heroUnit.attack
      if (villainAttacks) heroUnit.health -= villainUnit.attack
      if (villainUnit.health > 0) villainUnit.health = Math.max(0, villainUnit.health)
      if (heroUnit.health > 0) heroUnit.health = Math.max(0, heroUnit.health)
      const villainKilled = villainUnit.health <= 0
      const heroKilled = heroUnit.health <= 0

      if (heroAttacks && !heroUnit.frozen) {
        strikes.push({
          attackerSide: 'hero',
          slotIndex: slot,
          damage: heroUnit.attack,
          targetSide: 'villain',
          targetSlot: slot,
          killed: villainKilled,
          faceDamage: 0,
          attackerEliminated: villainAttacks ? heroKilled : false,
        })
      }
      if (villainAttacks && !villainUnit.frozen) {
        strikes.push({
          attackerSide: 'villain',
          slotIndex: slot,
          damage: villainUnit.attack,
          targetSide: 'hero',
          targetSlot: slot,
          killed: heroKilled,
          faceDamage: 0,
          attackerEliminated: heroAttacks ? villainKilled : false,
        })
      }
      if (villainKilled) {
        next.villain.graveyard.push(villainUnit)
        next.villain.board[slot] = null
      }
      if (heroKilled) {
        next.hero.graveyard.push(heroUnit)
        next.hero.board[slot] = null
      }
    } else if (heroUnit && !villainUnit && heroAttacks && !heroUnit.frozen) {
      const dmg = heroUnit.attack
      next.villain.hp = Math.max(0, next.villain.hp - dmg)
      strikes.push({
        attackerSide: 'hero',
        slotIndex: slot,
        damage: dmg,
        targetSide: 'villain',
        targetSlot: null,
        killed: false,
        faceDamage: dmg,
      })
    } else if (villainUnit && !heroUnit && villainAttacks && !villainUnit.frozen) {
      const dmg = villainUnit.attack
      next.hero.hp = Math.max(0, next.hero.hp - dmg)
      strikes.push({
        attackerSide: 'villain',
        slotIndex: slot,
        damage: dmg,
        targetSide: 'hero',
        targetSlot: null,
        killed: false,
        faceDamage: dmg,
      })
    }
  }

  return {
    state: next,
    combat: { strikes, heroHp: next.hero.hp, villainHp: next.villain.hp },
  }
}

export function resolveCombat(state: MatchState): { state: MatchState; combat: CombatRoundResult } {
  return resolveCombatSides(state, 'both')
}

export function checkWinner(state: MatchState): MatchSide | null {
  if (state.hero.hp <= 0) return 'villain'
  if (state.villain.hp <= 0) return 'hero'
  return null
}

export function startNextHeroTurn(state: MatchState): MatchState {
  const next = clearAllFrozen(cloneMatch(state))
  next.turn += 1
  next.phase = 'hero_main'
  next.heroCombatDone = false
  grantSideTurnStart(next.hero)
  drawCard(next.hero)
  return next
}

export function runEndTurnSequence(state: MatchState) {
  if (state.phase !== 'hero_main' || state.winner) return null

  const villainManaBefore = { mana: state.villain.mana, maxMana: state.villain.maxMana }
  let next = startVillainTurn(state)
  if (next.turn > 1) next = drawAtTurnStart(next, 'villain')

  const afterMana: MatchState = { ...cloneMatch(next), phase: 'villain_main' }
  const pickedPlays = pickVillainPlays(next)
  const villainPlays: { instanceId: string; slotIndex: number; freeze?: FreezeEvent | null }[] = []
  let working = cloneMatch(next)
  working.phase = 'villain_main'

  for (const play of pickedPlays) {
    const played = playCardToBoard(working, 'villain', play.instanceId, play.slotIndex)
    if (played) {
      villainPlays.push({ ...play, freeze: played.freeze ?? undefined })
      working = played.state
    }
  }

  const afterVillain = cloneMatch(working)
  afterVillain.phase = 'combat'

  const combatSides: CombatSidesMode = state.heroCombatDone ? 'villain' : 'both'
  const { state: afterCombat, combat } = resolveCombatSides(working, combatSides)
  afterCombat.heroCombatDone = false

  return { afterMana, afterVillain, villainPlays, state: afterCombat, combat, villainManaBefore }
}

export function runBattleSequence(state: MatchState) {
  if (state.phase !== 'hero_main' || state.winner || state.heroCombatDone) return null
  const { state: afterCombat, combat } = resolveCombatSides(state, 'hero')
  afterCombat.phase = 'hero_main'
  afterCombat.heroCombatDone = true
  return { state: afterCombat, combat }
}

export function shuffleDeck<T>(deck: T[]): T[] {
  const copy = [...deck]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
