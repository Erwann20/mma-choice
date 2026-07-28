// Écran d'accueil à 3 modes (UX-DR13). Un seul mode jouable en V1 ; les deux
// autres sont marqués « Bientôt ». En bas, l'historique des carrières terminées.
import { useState } from 'react'
import { computeScore, careerTitle, sportDef } from '../engine'
import type { SportId } from '../engine'
import type { ArchivedCareer, DailyResult } from '../store/game'
import { careerStatus } from './labels'

interface Mode {
  id: string
  title: string
  desc: string
  soon: boolean
}

/** Modes du hub d'un sport (la Mission du jour n'apparaît que si `withDaily`). */
function modesFor(sport: SportId, withDaily: boolean): Mode[] {
  const noun = sportDef(sport).athleteNoun
  const modes: Mode[] = [
    { id: 'career', title: 'Faire ma carrière', desc: `Crée ton ${noun} et écris ta légende, choix après choix.`, soon: false },
    { id: 'replay', title: 'Revivre la carrière', desc: `Incarne une légende et réécris son histoire.`, soon: false },
  ]
  if (withDaily) {
    modes.push({ id: 'daily', title: 'Mission du jour', desc: 'Un défi quotidien à graine partagée, un seul essai.', soon: false })
  }
  return modes
}

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
  sport = 'mma',
  onBack,
  onStart,
  onReplay,
  onDaily,
  onResume,
  resumeName,
  dailyDoneScore,
  dailyStreak = 0,
  dailyHistory = [],
  archive = [],
  onOpenCareer,
  onDeleteCareer,
}: {
  /** Sport du hub (titre + libellés). */
  sport?: SportId
  /** Revenir à la page de choix du sport. */
  onBack?: () => void
  onStart: () => void
  onReplay?: () => void
  onDaily?: () => void
  /** Reprendre la carrière en pause (affiche une carte dédiée en tête). */
  onResume?: () => void
  /** Nom du combattant de la carrière en pause. */
  resumeName?: string
  /** Score de la Mission du jour déjà tentée aujourd'hui, sinon null. */
  dailyDoneScore?: number | null
  /** Série de jours consécutifs (0 si la série est rompue). */
  dailyStreak?: number
  /** Historique des Missions du jour (plus récentes en tête). */
  dailyHistory?: DailyResult[]
  archive?: ArchivedCareer[]
  onOpenCareer?: (career: ArchivedCareer) => void
  onDeleteCareer?: (id: string) => void
}) {
  const [acked, setAcked] = useState<string | null>(null)
  const MODES = modesFor(sport, !!onDaily)
  const onMode = (id: string) =>
    id === 'replay' ? onReplay?.() : id === 'daily' ? onDaily?.() : onStart()

  return (
    <main className="center-screen home">
      {onBack ? (
        <button type="button" className="home-back" onClick={onBack}>
          ← Tous les sports
        </button>
      ) : null}
      <div className="home-head">
        <h1>{sportDef(sport).icon} {sportDef(sport).label}</h1>
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

      {dailyHistory.length > 0 ? (
        <section className="daily-recap">
          {dailyStreak > 0 ? (
            <p className="daily-streak">
              🔥 Série : {dailyStreak} jour{dailyStreak > 1 ? 's' : ''} d'affilée
            </p>
          ) : null}
          <div className="daily-history" aria-label="Historique des missions du jour">
            {dailyHistory.slice(0, 10).map((d) => (
              <span key={d.date} className="daily-dot" title={`${d.date} · ${d.score}/100`}>
                {d.score}
              </span>
            ))}
          </div>
        </section>
      ) : null}

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
