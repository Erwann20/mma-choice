// Bilan de fin d'année (FR-8) : récap des progrès et du palmarès de l'année,
// affiché entre deux années de carrière (une respiration + une récompense).
import type { GameState, FightChange } from '../engine'
import type { YearReview } from '../store/session'
import { changeChip, TITLE_FLAG_LABEL } from './labels'

const SKILL_CHANNELS = ['striking', 'grappling', 'ground', 'cardio'] as const
const isSkill = (c: FightChange) => (SKILL_CHANNELS as readonly string[]).includes(c.target)

function DeltaChips({ changes }: { changes: FightChange[] }) {
  return (
    <div className="deltas">
      {changes.map((c, i) => {
        const chip = changeChip(c.target, c.value)
        return (
          <span
            key={c.target}
            className={`delta delta-pop ${chip.dir}`}
            style={{ animationDelay: `${120 + i * 70}ms` }}
          >
            {chip.label}
          </span>
        )
      })}
    </div>
  )
}

export function YearReviewScreen({
  review,
  game,
  onContinue,
}: {
  review: YearReview
  game: GameState
  onContinue: () => void
}) {
  const skills = review.changes.filter(isSkill)
  const others = review.changes.filter((c) => !isSkill(c))
  const fights = review.wins + review.losses

  return (
    <main className="screen year-review">
      <p className="overline">Bilan · Année {review.year}</p>
      <h2 className="year-title">
        {game.fighter.name}, {review.age} ans
      </h2>

      {review.newTitleFlags.length > 0 || review.wonBelt ? (
        <section className="year-titles">
          {review.wonBelt ? <p className="year-title-line">🏆 Champion — ceinture conquise !</p> : null}
          {review.newTitleFlags.map((f) => (
            <p className="year-title-line" key={f}>
              {TITLE_FLAG_LABEL[f] ?? f}
            </p>
          ))}
        </section>
      ) : null}

      <section className="year-record">
        <div className="year-record-main">
          <span className="year-record-val">{review.wins}</span>
          <span className="year-record-sep">V</span>
          <span className="year-record-val">{review.losses}</span>
          <span className="year-record-sep">D</span>
        </div>
        <p className="year-record-sub">
          {fights === 0
            ? 'Aucun combat cette année'
            : `${fights} combat${fights > 1 ? 's' : ''} cette année${
                review.finishes > 0 ? ` · ${review.finishes} avant la limite` : ''
              }`}
        </p>
      </section>

      {skills.length > 0 ? (
        <section className="year-block">
          <p className="overline">Progression</p>
          <DeltaChips changes={skills} />
        </section>
      ) : null}

      {others.length > 0 ? (
        <section className="year-block">
          <p className="overline">Carrière</p>
          <DeltaChips changes={others} />
        </section>
      ) : null}

      {skills.length === 0 && others.length === 0 ? (
        <p className="year-flat">Une année de transition, sans grand bouleversement.</p>
      ) : null}

      <button className="btn-primary" type="button" onClick={onContinue}>
        Continuer
      </button>
    </main>
  )
}
