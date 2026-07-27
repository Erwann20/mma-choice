import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { applyChoice, isEligible } from '../engine'
import { reduce } from './reducer'
import { loadEvents } from '../schema'
import type { GameState } from './state'

const events = loadEvents()
const byId = (id: string) => {
  const e = events.find((x) => x.id === id)
  if (!e) throw new Error(`introuvable: ${id}`)
  return e
}

describe('réseaux sociaux (FR-12)', () => {
  it('le clash offre un fort gain de followers mais arme un bad buzz différé', () => {
    const clash = byId('evt-clash-conference')
    const g: GameState = { ...createInitialState(1), tier: 'regional' }
    const clashChoice = clash.choices[0] // « le clasher sans filtre »
    expect(clashChoice.effects.some((e) => e.target === 'followers' && e.value >= 2000)).toBe(true)

    const after = applyChoice(g, clash, clashChoice)
    expect(after.meta.followers).toBeGreaterThan(g.meta.followers)
    // Conséquence différée armée (FR-9), pas encore active.
    expect(after.pending.some((p) => p.flag === 'bad_buzz')).toBe(true)
    expect(after.flags['bad_buzz']).toBeUndefined()
    expect(isEligible(after, byId('evt-bad-buzz'))).toBe(false)
  })

  it("après le délai, l'événement bad buzz devient éligible", () => {
    const clash = byId('evt-clash-conference')
    let g: GameState = { ...createInitialState(1), tier: 'regional' }
    g = applyChoice(g, clash, clash.choices[0])
    g = reduce(g, { type: 'ADVANCE_YEAR' }) // +1 an ⇒ le flag bad_buzz s'active
    expect(g.flags['bad_buzz']).toBe(true)
    expect(isEligible(g, byId('evt-bad-buzz'))).toBe(true)
  })
})
