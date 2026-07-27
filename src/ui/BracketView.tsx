// Affichage du tableau (bracket) d'un tournoi : une colonne par tour, les
// vainqueurs mis en avant, le joueur repéré. Défile horizontalement sur mobile.
import type { Tournament } from '../store/tournament'
import { roundNames } from '../store/tournament'

function Fighter({
  id,
  name,
  playerId,
  winnerId,
}: {
  id: string
  name: string
  playerId: string
  winnerId: string | null
}) {
  const isPlayer = id === playerId
  const decided = winnerId !== null
  const won = decided && winnerId === id
  const lost = decided && winnerId !== id
  return (
    <div className={`bracket-fighter${isPlayer ? ' is-player' : ''}${won ? ' won' : ''}${lost ? ' lost' : ''}`}>
      <span className="bracket-name">{name}</span>
      {won ? <span className="bracket-check" aria-hidden="true">✓</span> : null}
    </div>
  )
}

export function BracketView({ tournament }: { tournament: Tournament }) {
  const names = roundNames(tournament.size)
  return (
    <div className="bracket-scroll">
      <div className="bracket" role="img" aria-label="Tableau du tournoi">
        {tournament.bracket.map((matches, r) => (
          <div className="bracket-round" key={r}>
            <p className="bracket-round-name">{names[r]}</p>
            <div className="bracket-matches">
              {matches.map((m, i) => (
                <div className={`bracket-match${m.isPlayer ? ' has-player' : ''}`} key={i}>
                  <Fighter id={m.aId} name={m.aName} playerId={tournament.playerId} winnerId={m.winnerId} />
                  <Fighter id={m.bId} name={m.bName} playerId={tournament.playerId} winnerId={m.winnerId} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
