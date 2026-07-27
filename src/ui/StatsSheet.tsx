import { useEffect } from 'react'
import type { GameState } from '../engine'
import { StatBar } from './StatBar'

const STYLE_LABEL: Record<GameState['style'], string> = {
  striker: 'Puncheur',
  wrestler: 'Lutteur',
  grappler: 'Grappler',
  allrounder: 'Polyvalent',
}

export function StatsSheet({ game, onClose }: { game: GameState; onClose: () => void }) {
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
          {game.fighter.age} ans · {STYLE_LABEL[game.style]} · circuit amateur
        </p>

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
      </div>
    </div>
  )
}
