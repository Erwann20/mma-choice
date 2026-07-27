import type { GameState } from '../engine'
import { STYLE_LABEL, careerStatus } from './labels'

export function FighterHeader({ game }: { game: GameState }) {
  const { fighter, style } = game
  const initials = fighter.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <header className="fighter-header">
      <div className="fighter-avatar" aria-hidden="true">
        {initials || '?'}
      </div>
      <div>
        <h1 className="fighter-name">{fighter.name}</h1>
        <p className="fighter-meta">
          {fighter.age} ans · {STYLE_LABEL[style]} · {careerStatus(game)}
        </p>
      </div>
    </header>
  )
}
