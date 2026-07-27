import type { Choice } from '../schema'

// Les effets ne sont PLUS prévisualisés : on les découvre après le choix
// (écran de conséquences), à la manière de Destiny Eleven. Seul un indice
// qualitatif optionnel (`hint`) peut teaser sans chiffrer l'issue.
export function ChoiceCard({ choice, onClick }: { choice: Choice; onClick: () => void }) {
  return (
    <button className="choice-card" type="button" onClick={onClick}>
      <span className="choice-label">{choice.label}</span>
      {choice.hint ? <span className="choice-hint">{choice.hint}</span> : null}
    </button>
  )
}
