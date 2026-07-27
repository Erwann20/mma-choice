import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/game'
import { FighterHeader } from './FighterHeader'
import { DataChipRow } from './DataChipRow'
import { EventCard } from './EventCard'
import { ChoiceCard } from './ChoiceCard'
import { StatsSheet } from './StatsSheet'
import { OpponentCard } from './OpponentCard'
import { ResultBanner } from './ResultBanner'
import { ChoiceReveal } from './ChoiceReveal'
import { YearReviewScreen } from './YearReviewScreen'
import { describeStatChanges } from './a11y'
import { eventCategory } from './labels'
import { Skeleton } from './Skeleton'
import type { GameState } from '../engine'

export function CareerScreen() {
  const session = useGameStore((s) => s.session)
  const choose = useGameStore((s) => s.choose)
  const advance = useGameStore((s) => s.advance)
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

  // Bilan de fin d'année (FR-8) : écran de récap entre deux années.
  if (session && session.yearReview && session.game.phase === 'career') {
    return <YearReviewScreen review={session.yearReview} game={session.game} onContinue={advance} />
  }

  // Repli : session en cours mais événement pas encore prêt (transition).
  if (
    session &&
    !session.current &&
    !session.lastResult &&
    !session.lastReveal &&
    !session.yearReview &&
    session.game.phase === 'career'
  ) {
    return <Skeleton />
  }
  if (!session || !session.current) return null
  const { game, current, opponent, lastResult, lastReveal } = session

  // Écran de résultat de combat (UX-DR9).
  if (lastResult) {
    return (
      <main className="screen">
        <FighterHeader game={game} />
        <ResultBanner result={lastResult} />
        <button className="btn-primary" type="button" onClick={advance}>
          Continuer
        </button>
        {statsOpen ? <StatsSheet game={game} onClose={() => setStatsOpen(false)} /> : null}
      </main>
    )
  }

  // Écran de conséquences d'un choix narratif : on découvre les effets (Destiny-like).
  if (lastReveal) {
    return (
      <main className={`screen cat-${eventCategory(current)}`}>
        <FighterHeader game={game} />
        <DataChipRow game={game} onOpen={() => setStatsOpen(true)} />
        <EventCard event={current} />
        <ChoiceReveal changes={lastReveal.changes} />
        <button className="btn-primary" type="button" onClick={advance}>
          Continuer
        </button>
        {statsOpen ? <StatsSheet game={game} onClose={() => setStatsOpen(false)} /> : null}
      </main>
    )
  }

  const isFight = !!current.fight && !!opponent
  return (
    <main className={`screen cat-${eventCategory(current)}`}>
      <FighterHeader game={game} />
      <DataChipRow game={game} onOpen={() => setStatsOpen(true)} />
      {isFight && opponent ? <OpponentCard key={`opp-${current.id}`} opponent={opponent} /> : null}
      <EventCard key={current.id} event={current} />
      <div className="choice-list">
        {current.choices.map((c, i) => (
          <ChoiceCard key={`${current.id}-${i}`} index={i} choice={c} onClick={() => choose(i)} />
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>
      {statsOpen ? <StatsSheet game={game} onClose={() => setStatsOpen(false)} /> : null}
    </main>
  )
}
