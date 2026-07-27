import type { EventDef } from '../schema'
import { eventCategory, CATEGORY_META } from './labels'

export function EventCard({ event }: { event: EventDef }) {
  const cat = eventCategory(event)
  const meta = CATEGORY_META[cat]
  return (
    <article className={`event-card cat-${cat}`}>
      <div className="event-cat">
        <span className="event-cat-icon" aria-hidden="true">
          {meta.icon}
        </span>
        <span>{event.overline ?? meta.label}</span>
      </div>
      <p className="event-text">{event.text}</p>
    </article>
  )
}
