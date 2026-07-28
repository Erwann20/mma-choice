import type { GameState } from '../engine'
import { fighterOverall } from '../engine'
import { STYLE_LABEL, careerStatus } from './labels'

/** Palier de couleur de la note (façon carte FIFA). */
function ovrTier(o: number): string {
  if (o >= 85) return 'elite'
  if (o >= 75) return 'gold'
  if (o >= 65) return 'silver'
  if (o >= 50) return 'bronze'
  return 'rookie'
}

export function FighterHeader({ game, onOpen }: { game: GameState; onOpen?: () => void }) {
  const { fighter, style } = game
  const overall = fighterOverall(game)
  const tier = ovrTier(overall)

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
            {fighter.age} ans · {STYLE_LABEL[style]} · {careerStatus(game)}
          </span>
        </span>
        {onOpen ? (
          <span className="ovr-chevron" aria-hidden="true">
            ›
          </span>
        ) : null}
      </button>
    </header>
  )
}
