import { useEffect } from 'react'
import type { GameState } from '../engine'
import { fighterOverall } from '../engine'
import { StatBar } from './StatBar'
import { STYLE_LABEL, careerStatus, amateurTitles } from './labels'

function ovrTier(o: number): string {
  if (o >= 85) return 'elite'
  if (o >= 75) return 'gold'
  if (o >= 65) return 'silver'
  if (o >= 50) return 'bronze'
  return 'rookie'
}

export function StatsSheet({
  game,
  onClose,
  onHome,
  onRetire,
  onAbandon,
}: {
  game: GameState
  onClose: () => void
  onHome?: () => void
  onRetire?: () => void
  onAbandon?: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Statistiques du combattant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grabber" aria-hidden="true" />
        <div className="sheet-ovr">
          <span className={`ovr ovr-${ovrTier(fighterOverall(game))}`}>
            <span className="ovr-value">{fighterOverall(game)}</span>
            <span className="ovr-label">OVR</span>
          </span>
          <span className="sheet-ovr-name">{game.fighter.name}</span>
        </div>
        <p className="fighter-meta" style={{ marginTop: 0 }}>
          {game.fighter.age} ans · {STYLE_LABEL[game.style]} · {careerStatus(game)}
          {game.belt ? ' · 🏆 Champion' : ''}
        </p>
        <p className="fighter-meta" style={{ marginTop: 4 }}>
          Palmarès : <b>{game.record.wins}</b> V – <b>{game.record.losses}</b> D
          {game.record.finishes > 0 ? ` (${game.record.finishes} avant la limite)` : ''}
        </p>
        {amateurTitles(game).length > 0 ? (
          <p className="fighter-meta" style={{ marginTop: 4, color: 'var(--color-accent)' }}>
            🏅 {amateurTitles(game).join(' · ')}
          </p>
        ) : null}

        <div className="overline" style={{ margin: 'var(--space-3) 0 var(--space-2)' }}>
          Combat
        </div>
        <StatBar label="Frappe" value={game.stats.striking} />
        <StatBar label="Lutte" value={game.stats.grappling} />
        <StatBar label="Sol" value={game.stats.ground} />
        <StatBar label="Cardio" value={game.stats.cardio} />

        <div className="overline" style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>
          Forme & réputation
        </div>
        <StatBar label="Forme" value={game.meta.health} />
        <StatBar label="Mental" value={game.meta.mental} />
        <StatBar label="Réputation" value={game.meta.reputation} />

        <div className="sheet-numbers">
          <span>
            <b>{game.meta.followers}</b> followers
          </span>
          <span>
            <b>{game.meta.money}</b> €
          </span>
        </div>

        <button className="btn-secondary" type="button" onClick={onClose} style={{ marginTop: 'var(--space-4)' }}>
          Fermer
        </button>
        {onHome ? (
          <button className="btn-ghost" type="button" onClick={onHome} style={{ marginTop: 'var(--space-2)' }}>
            🏠 Revenir à l'accueil
          </button>
        ) : null}
        {onRetire ? (
          <button
            className="btn-ghost btn-retire"
            type="button"
            onClick={onRetire}
            style={{ marginTop: 'var(--space-2)' }}
          >
            🥊 Raccrocher les gants
          </button>
        ) : null}
        {onAbandon ? (
          <button
            className="btn-ghost btn-retire"
            type="button"
            onClick={onAbandon}
            style={{ marginTop: 'var(--space-2)' }}
          >
            🗑️ Abandonner la carrière
          </button>
        ) : null}
      </div>
    </div>
  )
}
