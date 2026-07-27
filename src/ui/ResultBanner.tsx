// Bannière de résultat de combat graduée (UX-DR9) : couleur sémantique selon
// le Degré (victoire nette / médiocre / défaite / upset) + deltas déclarés.
import type { FightResult, FightOutcome } from '../engine'
import { changeChip } from './labels'

const OUTCOME: Record<FightOutcome, { title: string; tone: string }> = {
  clean: { title: 'Victoire nette', tone: 'win' },
  poor: { title: 'Victoire médiocre', tone: 'poor' },
  upset: { title: 'UPSET !', tone: 'upset' },
  loss: { title: 'Défaite', tone: 'loss' },
}

export function ResultBanner({ result }: { result: FightResult }) {
  const meta = OUTCOME[result.outcome]
  return (
    <section className={`result-banner tone-${meta.tone}`} role="status" aria-live="polite">
      <p className="overline">{result.titleFight ? 'Combat de titre' : 'Résultat du combat'}</p>
      <h2 className="result-title">{meta.title}</h2>
      <p className="result-method">
        {result.win ? 'Victoire' : 'Défaite'} par {result.method} · face à {result.opponentName} (
        {result.opponentRecord})
      </p>
      {result.wonBelt ? <p className="result-belt">🏆 Tu remportes la ceinture !</p> : null}
      {result.lostBelt ? <p className="result-belt">Tu perds ta ceinture.</p> : null}
      <div className="deltas">
        {result.changes.map((c) => {
          const chip = changeChip(c.target, c.value)
          return (
            <span key={c.target} className={`delta ${chip.dir}`}>
              {chip.label}
            </span>
          )
        })}
      </div>
    </section>
  )
}
