import type { Choice } from '../schema'
import type { GameState } from '../engine'
import { interpolate } from './labels'

// Les effets ne sont PLUS prévisualisés : on les découvre après le choix
// (écran de conséquences), à la manière de Destiny Eleven. Seul un indice
// qualitatif optionnel (`hint`) peut teaser sans chiffrer l'issue.
export function ChoiceCard({
  choice,
  onClick,
  index = 0,
  game,
}: {
  choice: Choice
  onClick: () => void
  index?: number
  /** État courant : sert à interpoler les libellés ({ville1}, {nemesis}…). */
  game?: GameState
}) {
  const label = game ? interpolate(choice.label, game) : choice.label
  const hint = choice.hint && game ? interpolate(choice.hint, game) : choice.hint
  return (
    <button
      className="choice-card"
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span className="choice-main">
        <span className="choice-label">{label}</span>
        {hint ? <span className="choice-hint">{hint}</span> : null}
      </span>
      <span className="choice-arrow" aria-hidden="true">
        ›
      </span>
    </button>
  )
}
