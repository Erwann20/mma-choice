import { describe, it, expect } from 'vitest'
import type { EventDef } from '../schema'
import { createInitialState } from './state'
import { reduce } from './reducer'
import { buildPool, isEligible, selectEvent, markEventConsumed } from './events'

function ev(partial: Partial<EventDef> & { id: string }): EventDef {
  return {
    weight: 1,
    repeatable: false,
    overline: undefined,
    text: 't',
    choices: [{ label: 'ok', effects: [] }],
    conditions: [],
    ...partial,
  }
}

describe('selection d’événements', () => {
  it('filtre par conditions (âge / stat)', () => {
    const s = createInitialState(1) // age 18, reputation 0
    const gated = ev({ id: 'a', conditions: [{ kind: 'stat', on: 'reputation', cmp: 'gte', value: 10 }] })
    const open = ev({ id: 'b' })
    expect(isEligible(s, gated)).toBe(false)
    expect(isEligible(s, open)).toBe(true)
  })

  it('exclut un Événement non répétable déjà vu', () => {
    const s0 = createInitialState(1)
    const e = ev({ id: 'once' })
    expect(isEligible(s0, e)).toBe(true)
    const s1 = markEventConsumed(s0, e)
    expect(isEligible(s1, e)).toBe(false)
  })

  it('respecte le cooldown d’un répétable', () => {
    const s0 = createInitialState(1) // age 18
    const e = ev({ id: 'rep', repeatable: true, cooldown: 2 })
    const s1 = markEventConsumed(s0, e) // dispo à 20
    expect(isEligible(s1, e)).toBe(false)
    const s2 = reduce(reduce(s1, { type: 'ADVANCE_YEAR' }), { type: 'ADVANCE_YEAR' }) // age 20
    expect(isEligible(s2, e)).toBe(true)
  })

  it('Pool jamais vide : repli filler quand tout est vu', () => {
    let s = createInitialState(1)
    const filler = ev({ id: 'filler', repeatable: true })
    const once = ev({ id: 'once' })
    s = markEventConsumed(s, once)
    const pool = buildPool(s, [once, filler])
    expect(pool.length).toBeGreaterThan(0)
    expect(pool.map((e) => e.id)).toContain('filler')
  })

  it('sélection pondérée déterministe pour une même graine', () => {
    const events = [ev({ id: 'x', weight: 1 }), ev({ id: 'y', weight: 100 })]
    const s = createInitialState(42)
    const a = selectEvent(s, events)
    const b = selectEvent(s, events)
    expect(a.event.id).toBe(b.event.id)
  })

  it('flag différé activé à l’âge prévu (FR-9)', () => {
    let s = createInitialState(1) // age 18
    s = { ...s, pending: [{ flag: 'blessure_ancienne', value: true, atAge: 20 }] }
    const gated = ev({ id: 'seq', conditions: [{ kind: 'flag', flag: 'blessure_ancienne', eq: true }] })
    expect(isEligible(s, gated)).toBe(false)
    s = reduce(s, { type: 'ADVANCE_YEAR' }) // 19
    expect(isEligible(s, gated)).toBe(false)
    s = reduce(s, { type: 'ADVANCE_YEAR' }) // 20 -> flag actif
    expect(s.flags['blessure_ancienne']).toBe(true)
    expect(isEligible(s, gated)).toBe(true)
  })
})
