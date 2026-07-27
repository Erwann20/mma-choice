import type { GameState } from '../engine'
import { computeScore, allTimeRank } from '../engine'
import { loadDivisions } from '../schema'

const STYLE_LABEL: Record<GameState['style'], string> = {
  striker: 'Puncheur',
  wrestler: 'Lutteur',
  grappler: 'Grappler',
  allrounder: 'Polyvalent',
}

function highlights(game: GameState): string[] {
  const div = loadDivisions().find((d) => d.id === game.division)
  const lines: string[] = []
  lines.push(`Combattant ${STYLE_LABEL[game.style]} de ${game.fighter.country}`)
  if (div) lines.push(`Division : ${div.label} (${div.weight})`)
  if (game.flags['a_combattu_immaf']) lines.push('A fait ses armes sur le circuit IMMAF')
  if (game.meta.reputation >= 40) lines.push('Un nom respecté dans le milieu')
  if (game.meta.followers >= 1000) lines.push(`${game.meta.followers} followers au compteur`)
  return lines
}

export function RecapScreen({ game, onNew }: { game: GameState; onNew: () => void }) {
  const score = computeScore(game)
  const rank = allTimeRank(score)
  return (
    <section className="center-screen recap">
      <p className="overline">Fin de carrière</p>
      <div className="score-big">
        {score}
        <span className="score-max">/100</span>
      </div>
      <p className="rank-line">{rank}ᵉ meilleur combattant de tous les temps</p>
      <ul className="highlights">
        {highlights(game).map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <p style={{ color: 'var(--color-text-muted)' }}>
        {game.fighter.name} a raccroché les gants à {game.fighter.age} ans.
      </p>
      <button className="btn-primary" type="button" onClick={onNew}>
        Nouvelle carrière
      </button>
    </section>
  )
}
