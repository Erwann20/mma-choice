import { useState } from 'react'
import type { GameState } from '../engine'
import { computeScore, allTimeRank, careerTitle, careerAchievements } from '../engine'
import { loadDivisions } from '../schema'
import { TIER_LABEL, organizationLabel } from './labels'
import { shareScore } from './share'
import { Toast } from './Toast'

interface Cell {
  label: string
  value: string
}

function palmares(game: GameState): Cell[] {
  const div = loadDivisions().find((d) => d.id === game.division)
  const { record, meta } = game
  const org = organizationLabel(game.organization)
  return [
    { label: 'Victoires', value: String(record.wins) },
    { label: 'Défaites', value: String(record.losses) },
    { label: 'Finitions', value: String(record.finishes) },
    { label: 'Réputation', value: String(meta.reputation) },
    { label: 'Followers', value: meta.followers.toLocaleString('fr-FR') },
    { label: 'Gains', value: `${meta.money.toLocaleString('fr-FR')} €` },
    { label: 'Division', value: div ? div.label : '—' },
    { label: 'Organisation', value: org ?? TIER_LABEL[game.tier] },
  ]
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
  const title = careerTitle(score)
  const trophies = careerAchievements(game)
  const [shareMsg, setShareMsg] = useState<string | null>(null)

  const onShare = async () => {
    const outcome = await shareScore(game)
    if (outcome === 'copied') setShareMsg('Score copié dans le presse-papiers.')
    else if (outcome === 'failed') setShareMsg('Partage indisponible sur cet appareil.')
    else setShareMsg(null)
    if (outcome !== 'shared') setTimeout(() => setShareMsg(null), 2500)
  }

  return (
    <main className="screen recap">
      <p className="overline">Fin de carrière</p>

      <section className={`recap-hero tone-${title.tone}`}>
        <div className="recap-score">
          <span className="score-big">{score}</span>
          <span className="score-max">/100</span>
        </div>
        <p className="recap-title">
          <span className="recap-title-icon" aria-hidden="true">
            {title.icon}
          </span>
          {title.label}
        </p>
        <p className="rank-line">{rank}ᵉ meilleur combattant de tous les temps</p>
      </section>

      <h2 className="recap-section-title">Palmarès</h2>
      <div className="palmares-grid">
        {palmares(game).map((c) => (
          <div className="palmares-cell" key={c.label}>
            <span className="palmares-value">{c.value}</span>
            <span className="palmares-label">{c.label}</span>
          </div>
        ))}
      </div>

      <h2 className="recap-section-title">
        Trophées {trophies.length > 0 ? <span className="recap-count">{trophies.length}</span> : null}
      </h2>
      {trophies.length > 0 ? (
        <ul className="trophy-list">
          {trophies.map((t) => (
            <li className="trophy" key={t.id}>
              <span className="trophy-icon" aria-hidden="true">
                {t.icon}
              </span>
              <span className="trophy-text">
                <span className="trophy-label">{t.label}</span>
                <span className="trophy-desc">{t.desc}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="trophy-empty">Aucun trophée cette fois — la légende attendra la prochaine carrière.</p>
      )}

      <p className="recap-outro">
        {game.fighter.name} a raccroché les gants à {game.fighter.age} ans.
      </p>

      <div className="recap-actions">
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
      </div>
      {shareMsg ? <Toast message={shareMsg} /> : null}
    </main>
  )
}
