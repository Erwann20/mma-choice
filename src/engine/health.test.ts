import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { applyChoice, isEligible, evalCondition } from '../engine'
import { loadEvents } from '../schema'
import type { GameState } from './state'
import type { Choice, EventDef } from '../schema'

const events = loadEvents()
const byId = (id: string) => {
  const e = events.find((x) => x.id === id)
  if (!e) throw new Error(`introuvable: ${id}`)
  return e
}

const dummy: EventDef = {
  id: 'd',
  weight: 1,
  repeatable: true,
  text: 'x',
  choices: [],
  conditions: [],
}

describe('santé & coupe de poids (FR-13)', () => {
  it('changer de division déclenche une coupe de poids (flag) puis un événement dédié', () => {
    const g: GameState = { ...createInitialState(1), division: 'lightweight-m' }
    const change: Choice = { label: 'monter', effects: [], setDivision: 'welterweight-m' }
    const after = applyChoice(g, dummy, change)
    expect(after.division).toBe('welterweight-m')
    expect(after.flags['coupe_de_poids']).toBe(true)
    expect(isEligible(after, byId('evt-coupe-de-poids'))).toBe(true)
  })

  it("changer pour la même division ne déclenche pas de coupe", () => {
    const g: GameState = { ...createInitialState(1), division: 'welterweight-m' }
    const same: Choice = { label: 'x', effects: [], setDivision: 'welterweight-m' }
    expect(applyChoice(g, dummy, same).flags['coupe_de_poids']).toBeUndefined()
  })

  it("l'événement blessure ne s'active que si le flag blessure est posé", () => {
    const g = createInitialState(1)
    const injury = byId('evt-blessure')
    expect(isEligible(g, injury)).toBe(false)
    expect(isEligible({ ...g, flags: { blessure: true } }, injury)).toBe(true)
  })

  it('condition sex filtre les événements de catégorie', () => {
    const g = createInitialState(1)
    const male: GameState = { ...g, fighter: { ...g.fighter, sex: 'M' } }
    const female: GameState = { ...g, fighter: { ...g.fighter, sex: 'F' } }
    expect(evalCondition(male, { kind: 'sex', eq: 'M' })).toBe(true)
    expect(evalCondition(female, { kind: 'sex', eq: 'M' })).toBe(false)
  })
})
