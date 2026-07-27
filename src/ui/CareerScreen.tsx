import { useState } from 'react'
import { useGameStore } from '../store/game'
import { FighterHeader } from './FighterHeader'
import { DataChipRow } from './DataChipRow'
import { EventCard } from './EventCard'
import { ChoiceCard } from './ChoiceCard'
import { StatsSheet } from './StatsSheet'
import { OpponentCard } from './OpponentCard'
import { ResultBanner } from './ResultBanner'

export function CareerScreen() {
  const session = useGameStore((s) => s.session)
  const choose = useGameStore((s) => s.choose)
  const continueFight = useGameStore((s) => s.continueFight)
  const [statsOpen, setStatsOpen] = useState(false)
  if (!session || !session.current) return null
  const { game, current, opponent, lastResult } = session

  // Écran de résultat de combat (UX-DR9).
  if (lastResult) {
    return (
      <main className="screen">
        <FighterHeader game={game} />
        <ResultBanner result={lastResult} />
        <button className="btn-primary" type="button" onClick={continueFight}>
          Continuer
        </button>
        {statsOpen ? <StatsSheet game={game} onClose={() => setStatsOpen(false)} /> : null}
      </main>
    )
  }

  const isFight = !!current.fight && !!opponent
  return (
    <main className="screen">
      <FighterHeader game={game} />
      <DataChipRow game={game} onOpen={() => setStatsOpen(true)} />
      {isFight && opponent ? <OpponentCard opponent={opponent} /> : null}
      <EventCard event={current} />
      <div className="choice-list">
        {current.choices.map((c, i) => (
          <ChoiceCard key={i} choice={c} onClick={() => choose(i)} />
        ))}
      </div>
      {statsOpen ? <StatsSheet game={game} onClose={() => setStatsOpen(false)} /> : null}
    </main>
  )
}
