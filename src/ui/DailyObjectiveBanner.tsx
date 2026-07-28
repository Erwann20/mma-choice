// Bannière d'objectif de la Mission du jour, affichée pendant le sprint.
import type { GameState } from '../engine'
import { dailyObjective } from '../engine'

export function DailyObjectiveBanner({ game }: { game: GameState }) {
  const obj = dailyObjective(game.seed)
  const met = obj.met(game)
  return (
    <div className={`daily-objective${met ? ' met' : ''}`}>
      <span className="daily-objective-icon" aria-hidden="true">
        {met ? '✅' : '🎯'}
      </span>
      <span className="daily-objective-body">
        <span className="daily-objective-label">Objectif du jour</span>
        <span className="daily-objective-text">{obj.label}</span>
      </span>
      <span className="daily-objective-bonus">+{obj.bonus}</span>
    </div>
  )
}
