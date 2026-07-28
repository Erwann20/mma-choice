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
import { BracketView } from './BracketView'
import { TournamentEndScreen } from './TournamentEndScreen'
import { ConfirmDialog } from './ConfirmDialog'
import { DailyObjectiveBanner } from './DailyObjectiveBanner'
import { describeStatChanges } from './a11y'
import { eventCategory } from './labels'
import { Skeleton } from './Skeleton'
import type { GameState } from '../engine'

export function CareerScreen() {
  const session = useGameStore((s) => s.session)
  const choose = useGameStore((s) => s.choose)
  const advance = useGameStore((s) => s.advance)
  const retire = useGameStore((s) => s.retire)
  const [statsOpen, setStatsOpen] = useState(false)
  const [confirmRetire, setConfirmRetire] = useState(false)
  const [announce, setAnnounce] = useState('')
  const prevGame = useRef<GameState | null>(null)

  // Dialogue de retraite volontaire (FR-14), partagé par tous les écrans.
  const retireDialog = confirmRetire ? (
    <ConfirmDialog
      title="Raccrocher les gants ?"
      body="Ta carrière s'arrête ici et tu passes directement au bilan final. Ce choix est définitif."
      confirmLabel="Prendre ma retraite"
      onConfirm={() => {
        setConfirmRetire(false)
        setStatsOpen(false)
        retire()
      }}
      onCancel={() => setConfirmRetire(false)}
    />
  ) : null

  const gameForEffect = session?.game ?? null
  // Annonce les variations de stats aux lecteurs d'écran après chaque changement (UX-DR17).
  useEffect(() => {
    if (gameForEffect && prevGame.current) {
      const msg = describeStatChanges(prevGame.current, gameForEffect)
      if (msg) setAnnounce(msg)
    }
    prevGame.current = gameForEffect
  }, [gameForEffect])

  // Fin de tournoi (FR-10) : tableau final + sacre ou élimination.
  if (session && session.tournament && session.tournament.status !== 'fighting') {
    return (
      <TournamentEndScreen tournament={session.tournament} game={session.game} onContinue={advance} />
    )
  }

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
    !session.tournament &&
    session.game.phase === 'career'
  ) {
    return <Skeleton />
  }
  if (!session || !session.current) return null
  const { game, current, opponent, lastResult, lastReveal, tournament, daily } = session

  // Écran de résultat de combat (UX-DR9) ; en tournoi, on montre le tableau.
  if (lastResult) {
    return (
      <main className="screen">
        <FighterHeader game={game} />
        <ResultBanner result={lastResult} />
        {tournament ? <BracketView tournament={tournament} /> : null}
        <button className="btn-primary" type="button" onClick={advance}>
          Continuer
        </button>
        {statsOpen ? (
          <StatsSheet
            game={game}
            onClose={() => setStatsOpen(false)}
            onRetire={() => setConfirmRetire(true)}
          />
        ) : null}
        {retireDialog}
      </main>
    )
  }

  // Écran de conséquences d'un choix narratif : on découvre les effets (Destiny-like).
  if (lastReveal) {
    return (
      <main className={`screen cat-${eventCategory(current)}`}>
        <FighterHeader game={game} />
        <DataChipRow game={game} onOpen={() => setStatsOpen(true)} />
        <EventCard event={current} game={game} />
        <ChoiceReveal changes={lastReveal.changes} />
        <button className="btn-primary" type="button" onClick={advance}>
          Continuer
        </button>
        {statsOpen ? (
          <StatsSheet
            game={game}
            onClose={() => setStatsOpen(false)}
            onRetire={() => setConfirmRetire(true)}
          />
        ) : null}
        {retireDialog}
      </main>
    )
  }

  const isFight = !!current.fight && !!opponent
  return (
    <main className={`screen cat-${eventCategory(current)}`}>
      <FighterHeader game={game} />
      <DataChipRow game={game} onOpen={() => setStatsOpen(true)} />
      {daily ? <DailyObjectiveBanner game={game} /> : null}
      {isFight && opponent ? <OpponentCard key={`opp-${current.id}`} opponent={opponent} /> : null}
      {tournament ? <BracketView tournament={tournament} /> : null}
      <EventCard key={current.id} event={current} game={game} />
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
