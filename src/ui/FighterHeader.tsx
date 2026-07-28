import type { GameState } from '../engine'
import { fighterOverall } from '../engine'
import { styleLabel, careerStatus, formatCompact, formatMoney, clubCity } from './labels'

/** Palier de couleur de la note (façon carte FIFA). */
function ovrTier(o: number): string {
  if (o >= 85) return 'elite'
  if (o >= 75) return 'gold'
  if (o >= 65) return 'silver'
  if (o >= 50) return 'bronze'
  return 'rookie'
}

export function FighterHeader({ game, onOpen }: { game: GameState; onOpen?: () => void }) {
  const { fighter } = game
  const overall = fighterOverall(game)
  const tier = ovrTier(overall)
  const city = clubCity(game)

  return (
    <header className="fighter-header">
      <button
        className="ovr-card"
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        aria-label={`Note générale ${overall}. Voir le détail des statistiques.`}
      >
        <span className={`ovr ovr-${tier}`}>
          <span className="ovr-value" key={overall}>
            {overall}
          </span>
          <span className="ovr-label">OVR</span>
        </span>
        <span className="ovr-id">
          <span className="fighter-name">{fighter.name}</span>
          <span className="fighter-meta">
            {fighter.age} ans · {styleLabel(game)} · {careerStatus(game)}
          </span>
        </span>
        {onOpen ? (
          <span className="ovr-chevron" aria-hidden="true">
            ›
          </span>
        ) : null}
      </button>
      <div className="header-res">
        {city ? (
          <span className="res-item">
            <span className="res-icon" aria-hidden="true">📍</span>
            <span className="res-value">{city}</span>
          </span>
        ) : null}
        <span className="res-item">
          <span className="res-icon" aria-hidden="true">💰</span>
          <span className="res-value" key={game.meta.money}>{formatMoney(game.meta.money)}</span>
        </span>
        <span className="res-item">
          <span className="res-icon" aria-hidden="true">📣</span>
          <span className="res-value" key={game.meta.followers}>
            {formatCompact(game.meta.followers)} <span className="res-unit">abonnés</span>
          </span>
        </span>
      </div>
    </header>
  )
}
