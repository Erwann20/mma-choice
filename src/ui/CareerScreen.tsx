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
  const continueFight = useGameStore((s) => s.continueFight)
  const [statsOpen, setStatsOpen] = useState(false)
  if (!session || !session.current) return null
  const { game, current, opponent, lastResult } = session

  // Écran résultat de combat (affiné en Story 2.3).
  if (lastResult) {
    return (
      <main className="screen">
        <FighterHeader game={game} />
        <div className="event-card">
          <p className="overline">
            {lastResult.win ? 'Victoire' : 'Défaite'} · {lastResult.method}
          </p>
          <p className="event-text">
            Face à {lastResult.opponentName}, tu {lastResult.win ? "l'emportes" : "t'inclines"} (
            {lastResult.outcome}).
          </p>
        </div>
        <button className="btn-primary" type="button" onClick={continueFight}>
          Continuer
        </button>
        {statsOpen ? <StatsSheet game={game} onClose={() => setStatsOpen(false)} /> : null}
      </main>
    )
  }

  return (
    <main className="screen">
      <FighterHeader game={game} />
      <DataChipRow game={game} onOpen={() => setStatsOpen(true)} />
      {opponent ? (
        <p className="fighter-meta" style={{ margin: 0 }}>
          Face à toi : <b>{opponent.name}</b> ({opponent.label}, {opponent.record})
        </p>
      ) : null}
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
