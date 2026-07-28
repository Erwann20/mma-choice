// Bannière de résultat de combat graduée (UX-DR9) : couleur sémantique selon
// le Degré (victoire nette / médiocre / défaite / upset) + deltas déclarés.
import type { FightResult, FightOutcome } from '../engine'
import { SEQUELA_LABEL } from '../engine'
import { changeChip } from './labels'

const OUTCOME: Record<FightOutcome, { title: string; tone: string }> = {
  clean: { title: 'Victoire nette', tone: 'win' },
  poor: { title: 'Victoire médiocre', tone: 'poor' },
  upset: { title: 'UPSET !', tone: 'upset' },
  loss: { title: 'Défaite', tone: 'loss' },
}

export function ResultBanner({ result, beltNoun = 'titre' }: { result: FightResult; beltNoun?: string }) {
  const meta = OUTCOME[result.outcome]
  return (
    <section className={`result-banner tone-${meta.tone}`} role="status" aria-live="polite">
      <p className="overline">
        {result.nemesis ? '⚔️ Rivalité' : result.titleFight ? 'Combat de titre' : 'Résultat du combat'}
      </p>
      <h2 className="result-title">{meta.title}</h2>
      <p className="result-method">
        {result.detail
          ? `${result.detail} · face à ${result.opponentName} (${result.opponentRecord})`
          : `${result.win ? 'Victoire' : 'Défaite'} par ${result.method} · face à ${result.opponentName} (${result.opponentRecord})`}
      </p>
      {result.wonBelt ? <p className="result-belt">🏆 Tu remportes {beltNoun === 'ceinture' ? 'la' : beltNoun === 'bague' ? 'la' : 'le'} {beltNoun} !</p> : null}
      {result.lostBelt ? <p className="result-belt">Tu perds {beltNoun === 'ceinture' || beltNoun === 'bague' ? 'ta' : 'ton'} {beltNoun}.</p> : null}
      {result.newInjury ? (
        <p className="result-injury">🩹 Blessure durable : {SEQUELA_LABEL[result.newInjury]}</p>
      ) : null}
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
