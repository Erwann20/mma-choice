import { describe, it, expect } from 'vitest'
import type { EventDef } from '../schema'
import { startCareer, serializeSession, deserializeSession } from './session'

const ev = (id: string): EventDef => ({
  id,
  weight: 1,
  repeatable: true,
  overline: undefined,
  text: 't',
  choices: [{ label: 'ok', effects: [] }],
  conditions: [],
})
const EVENTS = [ev('a'), ev('b')]

describe('persistance (AD-7)', () => {
  it('sérialise le contenu par id, pas d’objet embarqué', () => {
    const s = startCareer(EVENTS, 1)
    const saved = serializeSession(s)
    expect(typeof saved.currentId).toBe('string')
    expect(saved).not.toHaveProperty('current')
    expect(saved).not.toHaveProperty('events')
  })

  it('round-trip : reprend sur le même état et le même Événement', () => {
    const s = startCareer(EVENTS, 42)
    const s2 = deserializeSession(serializeSession(s), EVENTS)
    expect(s2.game).toEqual(s.game)
    expect(s2.current?.id).toBe(s.current?.id)
    expect(s2.eventsThisYear).toBe(s.eventsThisYear)
  })
})
