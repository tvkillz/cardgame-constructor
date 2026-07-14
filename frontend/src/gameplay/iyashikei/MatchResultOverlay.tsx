'use client'

import { Button } from '@/components/ui/Button/Button'
import './MatchResultOverlay.css'

interface MatchResultOverlayProps {
  won: boolean
  onNewGame: () => void
  onMenu: () => void
}

export default function MatchResultOverlay({ won, onNewGame, onMenu }: MatchResultOverlayProps) {
  return (
    <div className="match-result" role="dialog" aria-modal="true" aria-live="assertive">
      <div className="match-result__panel">
        <h2 className="match-result__title">{won ? 'A quiet victory' : 'Until next time'}</h2>
        <p className="match-result__text">
          {won
            ? 'The light stays with you. Rest a moment, then play again when you are ready.'
            : 'Every match is a breath. Return to the garden when you wish.'}
        </p>
        <div className="match-result__actions">
          <Button type="button" variant="primary" size="md" fantasy onClick={onNewGame}>
            Play again
          </Button>
          <Button type="button" variant="secondary" size="md" onClick={onMenu}>
            Menu
          </Button>
        </div>
      </div>
    </div>
  )
}
