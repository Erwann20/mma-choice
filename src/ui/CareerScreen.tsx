import { useState } from 'react'
import { useGameStore } from '../store/game'
import { FighterHeader } from './FighterHeader'
import { DataChipRow } from './DataChipRow'
import { EventCard } from './EventCard'
import { ChoiceCard } from './ChoiceCard'
import { StatsSheet } from './StatsSheet'

export function CareerScreen() {
  const session = useGameStore((s) => s.session)
  const choose = useGameStore((s) => s.choose)
  const [statsOpen, setStatsOpen] = useState(false)
  if (!session || !session.current) return null
  const { game, current } = session
  return (
    <main className="screen">
      <FighterHeader game={game} />
      <DataChipRow game={game} onOpen={() => setStatsOpen(true)} />
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
