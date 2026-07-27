// Écran de conséquences d'un choix narratif (Destiny-like) : les effets sont
// DÉCOUVERTS ici, après coup, jamais prévisualisés sur la carte de choix.
import type { FightChange } from '../engine'
import { changeChip } from './labels'

export function ChoiceReveal({ changes }: { changes: FightChange[] }) {
  return (
    <section className="reveal-card" role="status" aria-live="polite">
      <p className="overline">Conséquences</p>
      <div className="deltas">
        {changes.map((c, i) => {
          const chip = changeChip(c.target, c.value)
          return (
            <span
              key={c.target}
              className={`delta delta-pop ${chip.dir}`}
              style={{ animationDelay: `${120 + i * 90}ms` }}
            >
              {chip.label}
            </span>
          )
        })}
      </div>
    </section>
  )
}
