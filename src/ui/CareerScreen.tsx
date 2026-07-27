import { useGameStore } from '../store/game'
import { FighterHeader } from './FighterHeader'
import { DataChipRow } from './DataChipRow'
import { EventCard } from './EventCard'
import { ChoiceCard } from './ChoiceCard'

export function CareerScreen({ onOpenStats }: { onOpenStats?: () => void }) {
  const session = useGameStore((s) => s.session)
  const choose = useGameStore((s) => s.choose)
  if (!session || !session.current) return null
  const { game, current } = session
  return (
    <main className="screen">
      <FighterHeader game={game} />
      <DataChipRow game={game} onOpen={onOpenStats} />
      <EventCard event={current} />
      <div className="choice-list">
        {current.choices.map((c, i) => (
          <ChoiceCard key={i} choice={c} onClick={() => choose(i)} />
        ))}
      </div>
    </main>
  )
}
