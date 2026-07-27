import type { GameState } from '../engine'

const STYLE_LABEL: Record<GameState['style'], string> = {
  striker: 'Puncheur',
  wrestler: 'Lutteur',
  grappler: 'Grappler',
  allrounder: 'Polyvalent',
}

export function FighterHeader({ game }: { game: GameState }) {
  const { fighter, division, style } = game
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
          {fighter.age} ans · {division} · {STYLE_LABEL[style]} · circuit amateur
        </p>
      </div>
    </header>
  )
}
