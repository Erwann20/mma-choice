import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { isEligible } from './events'
import { loadEvents } from '../schema'
import type { GameState } from './state'

const events = loadEvents()
const byId = (id: string) => {
  const e = events.find((x) => x.id === id)
  if (!e) throw new Error(`événement introuvable: ${id}`)
  return e
}

function withMeta(patch: Partial<GameState['meta']>): GameState {
  const g = createInitialState(1)
  return { ...g, meta: { ...g.meta, ...patch } }
}

describe('économie (FR-11)', () => {
  it('un sponsor exige réputation ET followers (débloqué par les deux)', () => {
    const sponsor = byId('evt-sponsor-marque')
    expect(isEligible(withMeta({ reputation: 30, followers: 100 }), sponsor)).toBe(false)
    expect(isEligible(withMeta({ reputation: 5, followers: 2000 }), sponsor)).toBe(false)
    expect(isEligible(withMeta({ reputation: 30, followers: 2000 }), sponsor)).toBe(true)
  })

  it("le réinvestissement dans le camp exige de l'argent disponible", () => {
    const camp = byId('evt-camp-elite')
    expect(isEligible(withMeta({ money: 500 }), camp)).toBe(false)
    expect(isEligible(withMeta({ money: 8000 }), camp)).toBe(true)
  })
})
