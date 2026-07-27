import { useState } from 'react'
import type { GameState } from '../engine'
import { computeScore, allTimeRank } from '../engine'
import { loadDivisions } from '../schema'
import { STYLE_LABEL, TIER_LABEL } from './labels'
import { shareScore } from './share'
import { Toast } from './Toast'

function highlights(game: GameState): string[] {
  const div = loadDivisions().find((d) => d.id === game.division)
  const { record } = game
  const lines: string[] = []
  lines.push(`Combattant ${STYLE_LABEL[game.style]} de ${game.fighter.country}`)
  if (div) lines.push(`Division : ${div.label} (${div.weight})`)
  lines.push(`Palmarès : ${record.wins} victoires – ${record.losses} défaites`)
  if (game.belt) {
    lines.push(
      game.titleDefenses > 0
        ? `Champion (${game.titleDefenses} défense${game.titleDefenses > 1 ? 's' : ''} du titre)`
        : 'A décroché la ceinture de sa division',
    )
  }
  lines.push(`Plus haut palier atteint : ${TIER_LABEL[game.tier]}`)
  if (game.meta.reputation >= 40) lines.push('Un nom respecté dans le milieu')
  if (game.meta.followers >= 1000) lines.push(`${game.meta.followers} followers au compteur`)
  return lines
}

export function RecapScreen({
  game,
  onNew,
  onHome,
}: {
  game: GameState
  onNew: () => void
  onHome?: () => void
}) {
  const score = computeScore(game)
  const rank = allTimeRank(score)
  const [shareMsg, setShareMsg] = useState<string | null>(null)

  const onShare = async () => {
    const outcome = await shareScore(game)
    if (outcome === 'copied') setShareMsg('Score copié dans le presse-papiers.')
    else if (outcome === 'failed') setShareMsg('Partage indisponible sur cet appareil.')
    else setShareMsg(null)
    if (outcome !== 'shared') setTimeout(() => setShareMsg(null), 2500)
  }

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
      <button className="btn-secondary" type="button" onClick={onShare}>
        Partager mon score
      </button>
      {onHome ? (
        <button className="btn-ghost" type="button" onClick={onHome}>
          Retour à l'accueil
        </button>
      ) : null}
      {shareMsg ? <Toast message={shareMsg} /> : null}
    </section>
  )
}
