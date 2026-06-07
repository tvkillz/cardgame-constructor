'use client'

import { useEffect, useState } from 'react'

import { getMatchApiBaseUrl, getMatchApiLog, type MatchApiLogEntry } from '@/lib/matches/api'

type Props = {
  matchId: string | null
  revision: number
  serverOnline: boolean
  booting: boolean
}

export default function MatchApiHud({ matchId, revision, serverOnline, booting }: Props) {
  const [log, setLog] = useState<MatchApiLogEntry[]>([])
  const apiBase = getMatchApiBaseUrl()

  useEffect(() => {
    const tick = () => setLog(getMatchApiLog())
    tick()
    const timer = window.setInterval(tick, 800)
    return () => window.clearInterval(timer)
  }, [])

  if (booting) return null

  return (
    <div className="game-api-hud" aria-live="polite">
      <div className="game-api-hud__head">
        <strong>Match API</strong>
        <span className={serverOnline && matchId ? 'game-api-hud__ok' : 'game-api-hud__bad'}>
          {matchId ? `id ${matchId.slice(0, 8)}… rev ${revision}` : 'NO MATCH — not on server'}
        </span>
      </div>
      <p className="game-api-hud__hint">
        Calls go from your browser to {apiBase || '(env missing)'} — not pm2. Open DevTools → Network → filter{' '}
        <code>match</code>.
      </p>
      <ul className="game-api-hud__log">
        {log.length === 0 ? (
          <li className="game-api-hud__empty">No API calls yet — enter battle &amp; play a card.</li>
        ) : (
          log.slice(0, 6).map((entry, i) => (
            <li key={`${entry.at}-${i}`} className={entry.ok ? 'game-api-hud__line--ok' : 'game-api-hud__line--fail'}>
              <span>{entry.label}</span>
              <span>
                {entry.ok ? 'ok' : 'fail'} {entry.status ?? ''} {entry.ms}ms
                {entry.error ? ` · ${entry.error}` : ''}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
