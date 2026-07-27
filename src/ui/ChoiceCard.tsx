import type { Choice } from '../schema'

// Les effets ne sont PLUS prévisualisés : on les découvre après le choix
// (écran de conséquences), à la manière de Destiny Eleven. Seul un indice
// qualitatif optionnel (`hint`) peut teaser sans chiffrer l'issue.
export function ChoiceCard({
  choice,
  onClick,
  index = 0,
}: {
  choice: Choice
  onClick: () => void
  index?: number
}) {
  return (
    <button
      className="choice-card"
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span className="choice-main">
        <span className="choice-label">{choice.label}</span>
        {choice.hint ? <span className="choice-hint">{choice.hint}</span> : null}
      </span>
      <span className="choice-arrow" aria-hidden="true">
        ›
      </span>
    </button>
  )
}
