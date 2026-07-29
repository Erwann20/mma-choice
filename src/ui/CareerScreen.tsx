import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/game'
import { FighterHeader } from './FighterHeader'
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

export function CareerScreen({
  onExitToHome,
  onAbandon,
}: {
  /** Revenir à l'accueil sans terminer la carrière (reprise possible). */
  onExitToHome?: () => void
  /** Abandonner définitivement la carrière en cours. */
  onAbandon?: () => void
} = {}) {
  const session = useGameStore((s) => s.session)
  const choose = useGameStore((s) => s.choose)
  const advance = useGameStore((s) => s.advance)
  const retire = useGameStore((s) => s.retire)
  const [statsOpen, setStatsOpen] = useState(false)
  const [confirmRetire, setConfirmRetire] = useState(false)
  const [confirmAbandon, setConfirmAbandon] = useState(false)
  const [announce, setAnnounce] = useState('')
  const prevGame = useRef<GameState | null>(null)

  // Dialogues (retraite / abandon), partagés par tous les écrans.
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
  const abandonDialog = confirmAbandon ? (
    <ConfirmDialog
      title="Abandonner cette carrière ?"
      body="La carrière en cours sera définitivement perdue, sans bilan ni palmarès."
      confirmLabel="Abandonner"
      onConfirm={() => {
        setConfirmAbandon(false)
        setStatsOpen(false)
        onAbandon?.()
      }}
      onCancel={() => setConfirmAbandon(false)}
    />
  ) : null
  const menuDialogs = (
    <>
      {retireDialog}
      {abandonDialog}
    </>
  )

  // Barre du haut : retour à l'accueil (la carrière reste reprenable). Toujours
  // visible pour ne jamais se sentir « bloqué » dans une carrière.
  const topBar = onExitToHome ? (
    <div className="career-topbar">
      <button type="button" className="home-back" onClick={onExitToHome}>
        ← Accueil
      </button>
    </div>
  ) : null

  // Feuille de stats avec le menu complet (accueil / retraite / abandon).
  const statsSheet = (game: GameState) =>
    statsOpen ? (
      <StatsSheet
        game={game}
        onClose={() => setStatsOpen(false)}
        onHome={onExitToHome ? () => { setStatsOpen(false); onExitToHome() } : undefined}
        onRetire={() => setConfirmRetire(true)}
        onAbandon={onAbandon ? () => setConfirmAbandon(true) : undefined}
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
        {topBar}
        <FighterHeader game={game} onOpen={() => setStatsOpen(true)} />
        <ResultBanner result={lastResult} beltNoun={game.sport === 'basket' ? 'bague' : 'ceinture'} />
        {tournament ? <BracketView tournament={tournament} /> : null}
        <button className="btn-primary" type="button" onClick={advance}>
          Continuer
        </button>
        {statsOpen ? (
          <StatsSheet
            game={game}
            onClose={() => setStatsOpen(false)}
            onHome={onExitToHome ? () => { setStatsOpen(false); onExitToHome() } : undefined}
            onRetire={() => setConfirmRetire(true)}
            onAbandon={onAbandon ? () => setConfirmAbandon(true) : undefined}
          />
        ) : null}
        {menuDialogs}
      </main>
    )
  }

  // Écran de conséquences d'un choix narratif : on découvre les effets (Destiny-like).
  if (lastReveal) {
    return (
      <main className={`screen cat-${eventCategory(current)}`}>
        {topBar}
        <FighterHeader game={game} onOpen={() => setStatsOpen(true)} />
        <EventCard event={current} game={game} />
        <ChoiceReveal changes={lastReveal.changes} />
        <button className="btn-primary" type="button" onClick={advance}>
          Continuer
        </button>
        {statsOpen ? (
          <StatsSheet
            game={game}
            onClose={() => setStatsOpen(false)}
            onHome={onExitToHome ? () => { setStatsOpen(false); onExitToHome() } : undefined}
            onRetire={() => setConfirmRetire(true)}
            onAbandon={onAbandon ? () => setConfirmAbandon(true) : undefined}
          />
        ) : null}
        {menuDialogs}
      </main>
    )
  }

  const isFight = !!current.fight && !!opponent
  return (
    <main className={`screen cat-${eventCategory(current)}`}>
      {topBar}
      <FighterHeader game={game} onOpen={() => setStatsOpen(true)} />
      {daily ? <DailyObjectiveBanner game={game} /> : null}
      {isFight && opponent ? <OpponentCard key={`opp-${current.id}`} opponent={opponent} /> : null}
      {tournament ? <BracketView tournament={tournament} /> : null}
      <EventCard key={current.id} event={current} game={game} />
      <div className="choice-list">
        {current.choices.map((c, i) => (
          <ChoiceCard key={`${current.id}-${i}`} index={i} choice={c} game={game} onClick={() => choose(i)} />
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>
      {statsSheet(game)}
      {menuDialogs}
    </main>
  )
}
