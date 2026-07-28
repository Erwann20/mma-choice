import { useEffect } from 'react'
import type { GameState } from '../engine'
import { fighterOverall, activeSequelae, SEQUELA_LABEL, signatureTactic, SIGNATURE_LABEL, sportDef } from '../engine'
import { StatBar } from './StatBar'
import { styleLabel, careerStatus, amateurTitles, formatCompact, formatMoney } from './labels'

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
          {game.fighter.age} ans · {styleLabel(game)} · {careerStatus(game)}
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
        {game.nemesis ? (
          <p className="fighter-meta sheet-nemesis" style={{ marginTop: 4 }}>
            ⚔️ Némésis : {game.nemesis.name} (face-à-face {game.nemesis.playerWins}-{game.nemesis.playerLosses})
          </p>
        ) : null}

        <div className="overline" style={{ margin: 'var(--space-3) 0 var(--space-2)' }}>
          {game.sport === 'basket' ? 'Attributs' : 'Combat'}
        </div>
        {sportDef(game.sport).statKeys.map((k) => (
          <StatBar key={k} label={sportDef(game.sport).statLabels[k] ?? k} value={game.stats[k] ?? 0} />
        ))}

        {signatureTactic(game) ? (
          <p className="fighter-meta sheet-signature" style={{ marginTop: 'var(--space-2)' }}>
            ⭐ {SIGNATURE_LABEL[signatureTactic(game)!]}
          </p>
        ) : null}

        <div className="overline" style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>
          Forme & réputation
        </div>
        <StatBar label="Forme" value={game.meta.health} />
        <StatBar label="Mental" value={game.meta.mental} />
        <StatBar label="Réputation" value={game.meta.reputation} />

        {activeSequelae(game).length > 0 ? (
          <p className="fighter-meta sheet-injuries" style={{ marginTop: 'var(--space-2)' }}>
            🩹 Séquelles : {activeSequelae(game).map((s) => SEQUELA_LABEL[s]).join(' · ')}
          </p>
        ) : null}

        <div className="sheet-numbers">
          <span>
            <b>{formatCompact(game.meta.followers)}</b> abonnés
          </span>
          <span>
            <b>{formatMoney(game.meta.money)}</b>
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
