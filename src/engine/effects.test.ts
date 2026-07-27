import { describe, it, expect } from 'vitest'
import type { EventDef } from '../schema'
import { createInitialState } from './state'
import { applyEffect, applyChoice } from './effects'
import { isEligible } from './events'
import { reduce } from './reducer'

const ev = (partial: Partial<EventDef> & { id: string }): EventDef => ({
  weight: 1,
  repeatable: false,
  overline: undefined,
  text: 't',
  choices: [{ label: 'ok', effects: [] }],
  conditions: [],
  ...partial,
})

describe('effets', () => {
  it('add / sub / set', () => {
    const s = createInitialState(1) // reputation 0, striking 40
    expect(applyEffect(s, { target: 'reputation', op: 'add', value: 8 }).meta.reputation).toBe(8)
    expect(applyEffect(s, { target: 'striking', op: 'sub', value: 10 }).stats.striking).toBe(30)
    expect(applyEffect(s, { target: 'cardio', op: 'set', value: 77 }).stats.cardio).toBe(77)
  })

  it('borne les canaux 0–100, laisse followers/money libres (≥0)', () => {
    const s = createInitialState(1)
    expect(applyEffect(s, { target: 'striking', op: 'add', value: 999 }).stats.striking).toBe(100)
    expect(applyEffect(s, { target: 'health', op: 'sub', value: 999 }).meta.health).toBe(0)
    expect(applyEffect(s, { target: 'money', op: 'add', value: 5000 }).meta.money).toBe(5000)
  })

  it('ne mute pas l’état d’entrée', () => {
    const s = createInitialState(1)
    const snap = structuredClone(s)
    applyEffect(s, { target: 'reputation', op: 'add', value: 8 })
    expect(s).toEqual(snap)
  })

  it('applyChoice : effets + flags + marque vu', () => {
    const s = createInitialState(1)
    const e = ev({ id: 'e1', choices: [{ label: 'go', effects: [{ target: 'reputation', op: 'add', value: 5 }], setFlags: { a: true } }] })
    const s1 = applyChoice(s, e, e.choices[0])
    expect(s1.meta.reputation).toBe(5)
    expect(s1.flags['a']).toBe(true)
    expect(isEligible(s1, e)).toBe(false) // vu
  })

  it('applyChoice : arme un flag différé activé plus tard (FR-9)', () => {
    const s = createInitialState(1) // age 18
    const e = ev({ id: 'e2', choices: [{ label: 'risque', effects: [], armFlags: [{ flag: 'blessure', value: true, inYears: 2 }] }] })
    let s1 = applyChoice(s, e, e.choices[0])
    expect(s1.pending.some((p) => p.flag === 'blessure' && p.atAge === 20)).toBe(true)
    expect(s1.flags['blessure']).toBeUndefined()
    s1 = reduce(reduce(s1, { type: 'ADVANCE_YEAR' }), { type: 'ADVANCE_YEAR' }) // 20
    expect(s1.flags['blessure']).toBe(true)
  })
})
