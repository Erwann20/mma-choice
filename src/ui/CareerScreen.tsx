import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/game'
import { FighterHeader } from './FighterHeader'
import { DataChipRow } from './DataChipRow'
import { EventCard } from './EventCard'
import { ChoiceCard } from './ChoiceCard'
import { StatsSheet } from './StatsSheet'
import { OpponentCard } from './OpponentCard'
import { ResultBanner } from './ResultBanner'
import { describeStatChanges } from './a11y'
import type { GameState } from '../engine'

export function CareerScreen() {
  const session = useGameStore((s) => s.session)
  const choose = useGameStore((s) => s.choose)
  const continueFight = useGameStore((s) => s.continueFight)
  const [statsOpen, setStatsOpen] = useState(false)
  const [announce, setAnnounce] = useState('')
  const prevGame = useRef<GameState | null>(null)

  const gameForEffect = session?.game ?? null
  // Annonce les variations de stats aux lecteurs d'écran après chaque changement (UX-DR17).
  useEffect(() => {
    if (gameForEffect && prevGame.current) {
      const msg = describeStatChanges(prevGame.current, gameForEffect)
      if (msg) setAnnounce(msg)
    }
    prevGame.current = gameForEffect
  }, [gameForEffect])

  if (!session || !session.current) return null
  const { game, current, opponent, lastResult } = session

  // Écran de résultat de combat (UX-DR9).
  if (lastResult) {
    return (
      <main className="screen">
        <FighterHeader game={game} />
        <ResultBanner result={lastResult} />
        <button className="btn-primary" type="button" onClick={continueFight}>
          Continuer
        </button>
        {statsOpen ? <StatsSheet game={game} onClose={() => setStatsOpen(false)} /> : null}
      </main>
    )
  }

  const isFight = !!current.fight && !!opponent
  return (
    <main className="screen">
      <FighterHeader game={game} />
      <DataChipRow game={game} onOpen={() => setStatsOpen(true)} />
      {isFight && opponent ? <OpponentCard opponent={opponent} /> : null}
      <EventCard event={current} />
      <div className="choice-list">
        {current.choices.map((c, i) => (
          <ChoiceCard key={i} choice={c} onClick={() => choose(i)} />
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>
      {statsOpen ? <StatsSheet game={game} onClose={() => setStatsOpen(false)} /> : null}
    </main>
  )
}
