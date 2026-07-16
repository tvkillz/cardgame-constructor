import { useState } from 'react'
import type { UnitInstance } from '@/game/types'
import type { RefObject } from 'react'
import UnitToken from '@/components/UnitToken'

export const BENCH_DRAG_MIME = 'application/x-autobattler-bench-slug'

type ArenaProps = {
  heroes: UnitInstance[]
  villains: UnitInstance[]
  phase: 'prep' | 'battling' | 'result'
  approaching: boolean
  deployCapacity: number
  stageRef: RefObject<HTMLDivElement | null>
  fxRef: RefObject<HTMLDivElement | null>
  registerUnitNode: (id: string, node: HTMLElement | null) => void
  onDropFromBench: (slug: string) => void
  onUndeploy: (instanceId: string) => void
}

export default function Arena({
  heroes,
  villains,
  phase,
  approaching,
  deployCapacity,
  stageRef,
  fxRef,
  registerUnitNode,
  onDropFromBench,
  onUndeploy,
}: ArenaProps) {
  const [dragOver, setDragOver] = useState(false)
  const canDrop = phase === 'prep'

  return (
    <div
      className={[
        'ab-arena',
        approaching ? 'ab-arena--approaching' : '',
        phase === 'battling' || phase === 'result' ? 'ab-arena--engaged' : '',
        dragOver ? 'ab-arena--drop-target' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      ref={stageRef}
      onDragOver={(event) => {
        if (!canDrop) return
        if (![...event.dataTransfer.types].includes(BENCH_DRAG_MIME)) return
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        if (!canDrop) return
        event.preventDefault()
        setDragOver(false)
        const slug = event.dataTransfer.getData(BENCH_DRAG_MIME)
        if (slug) onDropFromBench(slug)
      }}
    >
      <div className="ab-arena__midline" aria-hidden="true" />

      <div className="ab-arena__board">
        <div className="ab-arena__lane ab-arena__lane--heroes" aria-label="Hero lane">
          <p className="ab-arena__lane-label">Heroes · {heroes.length}/{deployCapacity}</p>
          <div className="ab-arena__stack ab-arena__stack--heroes">
            {heroes.map((unit, index) => (
              <UnitToken
                key={unit.instanceId}
                unit={unit}
                laneIndex={index}
                laneCount={heroes.length}
                interactive={phase === 'prep'}
                register={registerUnitNode}
                onClick={phase === 'prep' ? () => onUndeploy(unit.instanceId) : undefined}
              />
            ))}
            {phase === 'prep' && heroes.length === 0 ? (
              <div className="ab-arena__drop-hint">
                Drop bench cards here
              </div>
            ) : null}
          </div>
        </div>

        <div className="ab-arena__lane ab-arena__lane--villains" aria-label="Villain lane">
          <p className="ab-arena__lane-label">Villains</p>
          <div className="ab-arena__stack ab-arena__stack--villains">
            {villains.map((unit, index) => (
              <UnitToken
                key={unit.instanceId}
                unit={unit}
                laneIndex={index}
                laneCount={villains.length}
                interactive={false}
                register={registerUnitNode}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="ab-arena__fx" ref={fxRef} aria-hidden="true" />
    </div>
  )
}
