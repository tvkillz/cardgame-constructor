import { useCallback, useMemo, useRef, useState } from 'react'
import { createInstanceId, HERO_POOL, pickRandom, VILLAIN_POOL } from '@/data/roster'
import { scaleCardToUnit, spawnVillains } from '@/game/combat'
import { runConcurrentBattle } from '@/game/concurrentBattle'
import type { Phase, RosterCard, RoundResult, UnitInstance } from '@/game/types'
import { formUpUnits } from '@/vfx/combatFx'

const SHOP_SIZE = 5
const FORM_UP_SEC = 2.4

export function useAutobattler() {
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<Phase>('prep')
  const [result, setResult] = useState<RoundResult>(null)
  const [shop, setShop] = useState<RosterCard[]>(() => pickRandom(HERO_POOL, SHOP_SIZE))
  const [bench, setBench] = useState<RosterCard[]>([])
  const [heroes, setHeroes] = useState<UnitInstance[]>([])
  const [villains, setVillains] = useState<UnitInstance[]>([])
  const [approaching, setApproaching] = useState(false)
  const [status, setStatus] = useState(
    'Recruit to the bench, then drag (or click Deploy) onto the grid.',
  )

  const stageRef = useRef<HTMLDivElement | null>(null)
  const fxRef = useRef<HTMLDivElement | null>(null)
  const unitRefs = useRef<Map<string, HTMLElement>>(new Map())

  const deployCapacity = level
  const benchCapacity = Math.max(level + 2, 4)

  const refreshShop = useCallback(() => {
    setShop(pickRandom(HERO_POOL, SHOP_SIZE))
  }, [])

  const recruit = useCallback(
    (card: RosterCard) => {
      if (phase !== 'prep') return
      setBench((prev) => {
        if (prev.length >= benchCapacity) {
          setStatus(`Bench full (max ${benchCapacity}). Deploy some onto the grid first.`)
          return prev
        }
        if (prev.some((c) => c.slug === card.slug) || heroes.some((h) => h.card.slug === card.slug)) {
          setStatus(`${card.title} is already recruited.`)
          return prev
        }
        setStatus(
          `${card.title} (${card.attackType}) joined your bench — drop them onto the grid.`,
        )
        return [...prev, card]
      })
    },
    [benchCapacity, heroes, phase],
  )

  const removeFromBench = useCallback(
    (slug: string) => {
      if (phase !== 'prep') return
      setBench((prev) => prev.filter((c) => c.slug !== slug))
    },
    [phase],
  )

  const deployFromBench = useCallback(
    (slug: string) => {
      if (phase !== 'prep') return

      const card = bench.find((c) => c.slug === slug)
      if (!card) return

      if (heroes.length >= deployCapacity) {
        setStatus(`Grid full (max ${deployCapacity} at level ${level}).`)
        return
      }
      if (heroes.some((h) => h.card.slug === slug)) return

      const unit = scaleCardToUnit(card, 'hero', 1)
      unit.instanceId = createInstanceId('hero')
      setBench((prev) => prev.filter((c) => c.slug !== slug))
      setHeroes((prev) => [...prev, unit])
      setStatus(`${card.title} (${card.attackType}) deployed on the grid.`)
    },
    [bench, deployCapacity, heroes, level, phase],
  )

  const undeployToBench = useCallback(
    (instanceId: string) => {
      if (phase !== 'prep') return
      const unit = heroes.find((h) => h.instanceId === instanceId)
      if (!unit) return

      if (bench.length >= benchCapacity) {
        setStatus('Bench is full — remove a recruit first.')
        return
      }
      if (bench.some((c) => c.slug === unit.card.slug)) {
        setHeroes((prev) => prev.filter((h) => h.instanceId !== instanceId))
        return
      }

      setHeroes((prev) => prev.filter((h) => h.instanceId !== instanceId))
      setBench((prev) => [...prev, unit.card])
      setStatus(`${unit.card.title} returned to bench.`)
    },
    [bench, benchCapacity, heroes, phase],
  )

  const registerUnitNode = useCallback((id: string, node: HTMLElement | null) => {
    if (!node) {
      unitRefs.current.delete(id)
      return
    }
    unitRefs.current.set(id, node)
  }, [])

  const runBattle = useCallback(async (heroTeam: UnitInstance[], villainTeam: UnitInstance[]) => {
    const stage = stageRef.current
    const fx = fxRef.current
    if (!stage || !fx) return 'lose' as const

    setApproaching(true)
    setStatus('Melee closes in · ranged holds the back line…')
    await formUpUnits([...heroTeam, ...villainTeam], unitRefs.current, FORM_UP_SEC)
    setApproaching(false)

    return runConcurrentBattle({
      stage,
      fx,
      heroes: heroTeam,
      villains: villainTeam,
      unitRefs: unitRefs.current,
      onSync: (nextHeroes, nextVillains) => {
        setHeroes(nextHeroes)
        setVillains(nextVillains)
      },
      onStatus: setStatus,
    })
  }, [])

  const startRound = useCallback(async () => {
    if (phase !== 'prep') return
    if (!heroes.length) {
      setStatus('Deploy at least one fighter from the bench onto the grid.')
      return
    }

    const heroTeam = heroes.map((u) => ({ ...u }))
    const villainTeam = spawnVillains(round, heroTeam.length).map((u) => ({
      ...u,
      instanceId: createInstanceId('villain'),
    }))

    setVillains(villainTeam)
    setPhase('battling')
    setResult(null)
    setStatus(`Round ${round} — enemies appear on the far side.`)

    await wait(120)
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })

    const outcome = await runBattle(heroTeam, villainTeam)
    setResult(outcome)
    setPhase('result')

    if (outcome === 'win') {
      setStatus('Victory! Round progress +1.')
      setRound((r) => r + 1)
      setLevel((lv) => lv + 1)
    } else {
      setStatus('Defeat. Pull units back to bench or redeploy, then try again.')
    }
  }, [heroes, phase, round, runBattle])

  const continuePrep = useCallback(() => {
    setPhase('prep')
    setResult(null)
    setVillains([])
    setApproaching(false)
    setShop(pickRandom(HERO_POOL, SHOP_SIZE))
    if (result === 'lose') {
      setStatus('Prep — drag bench cards onto the grid, or click field units to undeploy.')
    } else {
      setBench([])
      setHeroes([])
      setStatus(`Level up — deploy up to ${level} on the grid.`)
    }
  }, [level, result])

  const poolInfo = useMemo(
    () => ({
      heroes: HERO_POOL.length,
      villains: VILLAIN_POOL.length,
    }),
    [],
  )

  return {
    level,
    round,
    phase,
    result,
    shop,
    bench,
    benchCapacity,
    deployCapacity,
    heroes,
    villains,
    approaching,
    status,
    poolInfo,
    stageRef,
    fxRef,
    recruit,
    removeFromBench,
    deployFromBench,
    undeployToBench,
    refreshShop,
    startRound,
    continuePrep,
    registerUnitNode,
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
