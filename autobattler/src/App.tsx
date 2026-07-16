import { useAutobattler } from '@/game/useAutobattler'
import Arena from '@/components/Arena'
import Bench from '@/components/Bench'
import ShopPanel from '@/components/ShopPanel'
import './App.css'
import './vfx/fireball.css'

export default function App() {
  const game = useAutobattler()
  const prep = game.phase === 'prep'
  const battling = game.phase === 'battling'

  return (
    <div className="ab-shell">
      <header className="ab-top">
        <div className="ab-top__brand">
          <strong>VOIDBORN</strong>
          <span>Autobattler MVP</span>
        </div>
        <div className="ab-top__meta">
          <span>Round {game.round}</span>
          <span>Level {game.level}</span>
          <span>
            Deployed {game.heroes.length}/{game.deployCapacity}
          </span>
          <span>
            Bench {game.bench.length}/{game.benchCapacity}
          </span>
          <span className="ab-top__pools">
            Pool {game.poolInfo.heroes}H / {game.poolInfo.villains}V
          </span>
        </div>
        {prep ? (
          <button type="button" className="ab-btn ab-btn--primary" onClick={() => void game.startRound()}>
            Start Round
          </button>
        ) : null}
        {game.phase === 'result' ? (
          <button type="button" className="ab-btn ab-btn--primary" onClick={game.continuePrep}>
            {game.result === 'win' ? 'Next Prep' : 'Retry Prep'}
          </button>
        ) : null}
        {battling ? (
          <span className="ab-top__fighting">
            {game.approaching ? 'Advancing…' : 'Fighting…'}
          </span>
        ) : null}
      </header>

      <p className="ab-status" role="status">
        {game.status}
      </p>

      <div className="ab-layout">
        <main className="ab-main">
          <Arena
            heroes={game.heroes}
            villains={game.villains}
            phase={game.phase}
            approaching={game.approaching}
            deployCapacity={game.deployCapacity}
            stageRef={game.stageRef}
            fxRef={game.fxRef}
            registerUnitNode={game.registerUnitNode}
            onDropFromBench={game.deployFromBench}
            onUndeploy={game.undeployToBench}
          />
          <Bench
            cards={game.bench}
            capacity={game.benchCapacity}
            disabled={!prep}
            onRemove={game.removeFromBench}
            onDeploy={game.deployFromBench}
          />
        </main>
        <ShopPanel
          cards={game.shop}
          disabled={!prep}
          onRecruit={game.recruit}
          onReroll={game.refreshShop}
        />
      </div>
    </div>
  )
}
