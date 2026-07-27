import type { EventDef } from '../schema'

export function EventCard({ event }: { event: EventDef }) {
  return (
    <article className="event-card">
      {event.overline ? <div className="overline">{event.overline}</div> : null}
      <p className="event-text">{event.text}</p>
    </article>
  )
}
