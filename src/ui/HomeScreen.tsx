// Écran d'accueil à 3 modes (UX-DR13). Un seul mode jouable en V1 ; les deux
// autres sont marqués « Bientôt ». En bas, l'historique des carrières terminées.
import { useState } from 'react'
import { computeScore, careerTitle } from '../engine'
import type { ArchivedCareer } from '../store/game'
import { careerStatus } from './labels'

interface Mode {
  id: string
  title: string
  desc: string
  soon: boolean
}

const MODES: Mode[] = [
  { id: 'career', title: 'Faire ma carrière', desc: 'Crée ton combattant et écris ta légende, choix après choix.', soon: false },
  { id: 'replay', title: 'Revivre la carrière', desc: 'Incarne une icône du MMA et réécris sa légende.', soon: false },
  { id: 'daily', title: 'Mission du jour', desc: 'Un défi quotidien à graine partagée, un seul essai.', soon: false },
]

function CareerRow({
  career,
  onOpen,
  onDelete,
}: {
  career: ArchivedCareer
  onOpen: () => void
  onDelete: () => void
}) {
  const { game } = career
  const score = computeScore(game)
  const title = careerTitle(score)
  return (
    <li className="career-row">
      <button type="button" className="career-open" onClick={onOpen}>
        <span className="career-medal" aria-hidden="true">
          {title.icon}
        </span>
        <span className="career-info">
          <span className="career-name">{game.fighter.name}</span>
          <span className="career-sub">
            {game.record.wins} V – {game.record.losses} D · {game.fighter.age} ans · {careerStatus(game)}
          </span>
        </span>
        <span className="career-score">{score}</span>
      </button>
      <button type="button" className="career-del" onClick={onDelete} aria-label={`Supprimer la carrière de ${game.fighter.name}`}>
        ×
      </button>
    </li>
  )
}

export function HomeScreen({
  onStart,
  onReplay,
  onDaily,
  onResume,
  resumeName,
  dailyDoneScore,
  archive = [],
  onOpenCareer,
  onDeleteCareer,
}: {
  onStart: () => void
  onReplay?: () => void
  onDaily?: () => void
  /** Reprendre la carrière en pause (affiche une carte dédiée en tête). */
  onResume?: () => void
  /** Nom du combattant de la carrière en pause. */
  resumeName?: string
  /** Score de la Mission du jour déjà tentée aujourd'hui, sinon null. */
  dailyDoneScore?: number | null
  archive?: ArchivedCareer[]
  onOpenCareer?: (career: ArchivedCareer) => void
  onDeleteCareer?: (id: string) => void
}) {
  const [acked, setAcked] = useState<string | null>(null)
  const onMode = (id: string) =>
    id === 'replay' ? onReplay?.() : id === 'daily' ? onDaily?.() : onStart()

  return (
    <main className="center-screen home">
      <div className="home-head">
        <h1>MMA CHOICE</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Forge ta légende, choix après choix.</p>
      </div>
      {onResume ? (
        <button type="button" className="resume-card" onClick={onResume}>
          <span className="resume-icon" aria-hidden="true">▶</span>
          <span className="resume-body">
            <span className="resume-title">Reprendre ma carrière</span>
            <span className="resume-sub">{resumeName ?? 'Carrière en cours'}</span>
          </span>
        </button>
      ) : null}

      <div className="mode-list">
        {MODES.map((m) => {
          const dailyDone = m.id === 'daily' && dailyDoneScore != null
          if (m.soon || dailyDone) {
            return (
              <button
                key={m.id}
                type="button"
                className="mode-card is-soon"
                onClick={() => (m.soon ? setAcked(m.id) : undefined)}
                aria-disabled="true"
              >
                <span className="mode-title">
                  {m.title}{' '}
                  {dailyDone ? (
                    <span className="badge-soon">Terminée · {dailyDoneScore}</span>
                  ) : (
                    <span className="badge-soon">Bientôt</span>
                  )}
                </span>
                <span className="mode-desc">
                  {dailyDone
                    ? `Score du jour : ${dailyDoneScore}/100 — reviens demain pour un nouveau défi !`
                    : acked === m.id
                      ? 'Bientôt disponible — reviens vite !'
                      : m.desc}
                </span>
              </button>
            )
          }
          return (
            <button
              key={m.id}
              type="button"
              className={`mode-card ${m.id === 'career' ? 'is-primary' : ''}`}
              onClick={() => onMode(m.id)}
            >
              <span className="mode-title">{m.title}</span>
              <span className="mode-desc">{m.desc}</span>
            </button>
          )
        })}
      </div>

      {archive.length > 0 ? (
        <section className="careers">
          <h2 className="careers-title">Mes carrières</h2>
          <ul className="career-list">
            {archive.map((c) => (
              <CareerRow
                key={c.id}
                career={c}
                onOpen={() => onOpenCareer?.(c)}
                onDelete={() => onDeleteCareer?.(c.id)}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
