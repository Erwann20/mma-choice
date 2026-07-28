// Écran de fin de tournoi : bandeau vainqueur/éliminé + tableau final complet.
import type { GameState } from '../engine'
import type { Tournament } from '../store/tournament'
import { roundNames } from '../store/tournament'
import { BracketView } from './BracketView'
import { titleFlagLabel } from './labels'

/** Nom du tour où le joueur a été éliminé (dernier match perdu). */
function eliminatedRound(t: Tournament): string {
  const names = roundNames(t.size)
  for (let r = 0; r < t.bracket.length; r++) {
    const lost = t.bracket[r].some((m) => m.isPlayer && m.winnerId !== null && m.winnerId !== t.playerId)
    if (lost) return names[r]
  }
  return names[t.bracket.length - 1] ?? ''
}

export function TournamentEndScreen({
  tournament,
  game,
  onContinue,
}: {
  tournament: Tournament
  game: GameState
  onContinue: () => void
}) {
  const won = tournament.status === 'won'
  const titleLabel = tournament.winFlag ? titleFlagLabel(tournament.winFlag, game) : null

  return (
    <main className="screen tournament-end">
      <p className="overline">{tournament.overline}</p>

      <section className={`tournament-banner ${won ? 'won' : 'out'}`}>
        {won ? (
          <>
            <span className="tournament-trophy" aria-hidden="true">🏆</span>
            <p className="tournament-headline">{game.fighter.name} remporte le tournoi !</p>
            {titleLabel ? <p className="tournament-title">{titleLabel}</p> : null}
          </>
        ) : (
          <>
            <span className="tournament-trophy dim" aria-hidden="true">🥊</span>
            <p className="tournament-headline">Éliminé en {eliminatedRound(tournament).toLowerCase()}</p>
            <p className="tournament-title dim">Le titre attendra la prochaine fois.</p>
          </>
        )}
      </section>

      <BracketView tournament={tournament} />

      <button className="btn-primary" type="button" onClick={onContinue}>
        Continuer
      </button>
    </main>
  )
}
