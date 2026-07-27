import type { Choice } from '../schema'
import { effectChip } from './labels'

export function ChoiceCard({ choice, onClick }: { choice: Choice; onClick: () => void }) {
  return (
    <button className="choice-card" type="button" onClick={onClick}>
      <span className="choice-label">{choice.label}</span>
      {choice.hint ? <span className="choice-hint">{choice.hint}</span> : null}
      {choice.effects.length > 0 ? (
        <span className="deltas">
          {choice.effects.map((e, i) => {
            const chip = effectChip(e)
            return (
              <span className={`delta ${chip.dir}`} key={i}>
                {chip.label}
              </span>
            )
          })}
        </span>
      ) : null}
    </button>
  )
}
