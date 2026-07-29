import type { EventDef } from '../schema'
import type { GameState } from '../engine'
import { sportDef } from '../engine'
import { eventCategory, CATEGORY_META, interpolate } from './labels'

export function EventCard({ event, game }: { event: EventDef; game?: GameState }) {
  const cat = eventCategory(event)
  const meta = CATEGORY_META[cat]
  const overline = event.overline ?? meta.label
  // L'icône « affrontement » dépend du sport (gant de boxe / ballon).
  const icon = cat === 'combat' && game ? sportDef(game.sport).categoryIcon : meta.icon
  return (
    <article className={`event-card cat-${cat}`}>
      <div className="event-cat">
        <span className="event-cat-icon" aria-hidden="true">
          {icon}
        </span>
        <span>{game ? interpolate(overline, game) : overline}</span>
      </div>
      <p className="event-text">{game ? interpolate(event.text, game) : event.text}</p>
    </article>
  )
}
