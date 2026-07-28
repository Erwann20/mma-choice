import { useEffect } from 'react'
import type { GameState } from '../engine'
import { StatBar } from './StatBar'
import { STYLE_LABEL, careerStatus, amateurTitles } from './labels'

export function StatsSheet({
  game,
  onClose,
  onRetire,
}: {
  game: GameState
  onClose: () => void
  onRetire?: () => void
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
      </div>
    </div>
  )
}
