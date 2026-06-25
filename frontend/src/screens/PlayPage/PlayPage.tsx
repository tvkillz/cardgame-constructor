'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { appConfig, gameAnimationsConfig, getArenaBackground } from '@/config'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button/Button'
import { useCardCatalog } from '@/hooks/useCardCatalog'
import { usePlayerDecks } from '@/hooks/usePlayerDecks'
import { deckCardCount, resolveDeckToDisplay, savePlayerDeck } from '@/lib/decks'
import { preloadWithMinDelay } from '@/lib/cards'
import { invokeMatchAction } from '@/lib/matches'
import type { HandDeckEntry } from '@/lib/decks/buildHand'
import BattleTransition from './BattleTransition'
import DeckSelectModal from './DeckSelectModal'
import './styles.css'

const { loadingDurationMs } = gameAnimationsConfig.battleTransition

type GameModeId = (typeof appConfig.theme.playModes)[number]['id']
type BattlePhase = 'idle' | 'loading' | 'arena'

export default function PlayPage() {
  const router = useRouter()
  const { descriptions, theme } = appConfig
  const { playerName, user, openAuthModal, loading: authLoading } = useAuth()
  const { cards: catalog, loading: catalogLoading } = useCardCatalog()
  const { summaries: deckSummaries, decks, loading: decksLoading } = usePlayerDecks()
  const [deckEntries, setDeckEntries] = useState<HandDeckEntry[]>([])
  const [showModes, setShowModes] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [deckModalOpen, setDeckModalOpen] = useState(false)
  const [activeMode, setActiveMode] = useState<GameModeId | null>(null)
  const [selectedDeckId, setSelectedDeckId] = useState('')
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('idle')
  const [arenaDeckId, setArenaDeckId] = useState('')
  const [enteringBattle, setEnteringBattle] = useState(false)
  const [enterBattleError, setEnterBattleError] = useState<string | null>(null)
  const [resumeMatchId, setResumeMatchId] = useState<string | null>(null)
  const [activeMatch, setActiveMatch] = useState<{
    id: string
    deckId: string
    turn: number
  } | null>(null)

  const activeModeLabel =
    theme.playModes.find((o) => o.id === activeMode)?.title ?? ''

  const exitArenaToLobby = () => {
    setBattlePhase('idle')
    setResumeMatchId(null)
    setArenaDeckId('')
    setDeckEntries([])
    setActiveMatch(null)
    setShowModes(true)
    setDeckModalOpen(false)
    setActiveMode(null)
    setSelectedDeckId('')
  }

  const handleNewGameFromArena = () => {
    exitArenaToLobby()
    setShowModes(true)
  }

  const handleFullscreenToggle = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch {
      // Fullscreen may fail due to browser restrictions.
    }
  }

  const openDeckModal = (mode: GameModeId) => {
    if (mode === 'tutorial') return
    setActiveMode(mode)
    setSelectedDeckId('')
    setDeckModalOpen(true)
  }

  const closeDeckModal = () => {
    setDeckModalOpen(false)
    setActiveMode(null)
    setSelectedDeckId('')
  }

  useEffect(() => {
    void invokeMatchAction({ type: 'get_active' }).then((res) => {
      const row = res.match
      if (row?.player_deck_id) {
        setActiveMatch({
          id: row.id,
          deckId: row.player_deck_id,
          turn: row.turn,
        })
      }
    })
  }, [])

  const handleEnterBattle = async () => {
    if (!selectedDeckId || enteringBattle || authLoading) return

    if (!user?.id) {
      setEnterBattleError('Sign in to enter battle.')
      openAuthModal('signIn')
      return
    }

    const deck = decks.find((d) => d.id === selectedDeckId)
    if (!deck) {
      setEnterBattleError('Deck not found. Try again or pick another deck.')
      return
    }

    if (deckCardCount(deck) < 1) {
      setEnterBattleError('Add at least one card to this deck in Collection.')
      return
    }

    setEnteringBattle(true)
    setEnterBattleError(null)

    try {
      const saved = await savePlayerDeck(user.id, deck)
      const cardTotal = deckCardCount(saved)
      if (cardTotal < 1) {
        setEnterBattleError(
          'Deck could not be saved to the server. Seed the card catalog, then save the deck in Collection.',
        )
        return
      }

      setResumeMatchId(null)
      setArenaDeckId(saved.id)
      setDeckEntries(resolveDeckToDisplay(saved, catalog))
      setDeckModalOpen(false)

      const img = new Image()
      img.src = getArenaBackground()
      setBattlePhase('loading')
    } finally {
      setEnteringBattle(false)
    }
  }

  const handleResumeMatch = () => {
    if (!activeMatch || catalogLoading) return
    const deck = decks.find((d) => d.id === activeMatch.deckId)
    if (!deck) return

    const resolved = resolveDeckToDisplay(deck, catalog)
    if (resolved.length === 0) return

    setSelectedDeckId(activeMatch.deckId)
    setResumeMatchId(activeMatch.id)
    setDeckEntries(resolved)
    setActiveMatch(null)

    const img = new Image()
    img.src = getArenaBackground()
    setBattlePhase('loading')
  }

  useEffect(() => {
    if (battlePhase !== 'loading' || deckEntries.length === 0 || catalogLoading) return

    let cancelled = false
    void preloadWithMinDelay([], loadingDurationMs).then(() => {
      if (!cancelled) setBattlePhase('arena')
    })

    return () => {
      cancelled = true
    }
  }, [battlePhase, deckEntries, catalogLoading, loadingDurationMs])

  const inArena = battlePhase === 'arena'
  const inBattle = battlePhase !== 'idle'

  return (
    <section
      className={`play-page${inArena ? ' play-page--arena' : ''}`}
      aria-label={descriptions.play.screenLabel}
    >
      {!inBattle && (
        <>
          <div className="play-page__overlay" />

          <div className="play-page__top">
            <button type="button" className="play-page__player" onClick={() => {}}>
              <span>{playerName}</span>
              <strong> ⭐ {theme.player.defaultCredits}</strong>
            </button>

            <button
              type="button"
              className="play-page__action"
              onClick={() => router.push(appConfig.domain.routes.portalProfile)}
            >
              Exit
            </button>
          </div>

          <div className="play-page__center">
            <h1 className="play-page__title">
              {descriptions.play.titleLine}
              {descriptions.play.titleAccent ? (
                <span>{descriptions.play.titleAccent}</span>
              ) : null}
            </h1>

            <div className="play-page__panel">
              {activeMatch && !showModes && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  fantasy
                  className="play-page__resume-btn"
                  onClick={handleResumeMatch}
                >
                  Resume match (turn {activeMatch.turn})
                </Button>
              )}

              <Button
                type="button"
                variant="primary"
                size="lg"
                fantasy
                className={`play-page__play-btn${showModes ? ' play-page__play-btn--hidden' : ''}`}
                onClick={() => setShowModes(true)}
              >
                Play
              </Button>

              <div
                className={`play-page__modes-wrap${showModes ? ' play-page__modes-wrap--visible' : ''}`}
              >
                <div className="play-page__modes" role="list" aria-label="Game modes">
                  {theme.playModes.map((option) => (
                    <Button
                      key={option.id}
                      type="button"
                      variant="primary"
                      size="md"
                      fantasy
                      className="play-page__mode"
                      onClick={() => openDeckModal(option.id)}
                    >
                      <span className="play-page__mode-icon" aria-hidden="true">
                        {option.icon}
                      </span>
                      <span className="play-page__mode-text">
                        <strong>{option.title}</strong>
                        <small>{option.subtitle}</small>
                      </span>
                    </Button>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  fantasy
                  className="play-page__back-btn"
                  onClick={() => setShowModes(false)}
                >
                  Back
                </Button>
              </div>
            </div>
          </div>

          <div className="play-page__bottom">
            <button type="button" className="play-page__action" onClick={() => {}}>
              Music
            </button>
            <button
              type="button"
              className="play-page__action"
              onClick={handleFullscreenToggle}
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </>
      )}

      <DeckSelectModal
        isOpen={deckModalOpen}
        modeLabel={activeModeLabel}
        decks={deckSummaries}
        decksLoading={decksLoading}
        selectedDeckId={selectedDeckId}
        onSelectDeck={setSelectedDeckId}
        onCancel={closeDeckModal}
        onEnterBattle={() => void handleEnterBattle()}
        enterBattleError={enterBattleError}
        enteringBattle={enteringBattle}
      />

      {battlePhase === 'loading' && <BattleTransition phase="loading" />}
      {battlePhase === 'arena' && (
        <BattleTransition
          phase="arena"
          deckEntries={deckEntries}
          deckId={arenaDeckId || selectedDeckId}
          mode={activeMode ?? 'casual'}
          resumeMatchId={resumeMatchId}
          onNewGame={handleNewGameFromArena}
          onMenu={exitArenaToLobby}
        />
      )}
    </section>
  )
}
