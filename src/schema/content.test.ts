import { describe, it, expect } from 'vitest'
import { loadEvents, parseEvents } from './content'

describe('content schema', () => {
  it('charge et valide le contenu seed', () => {
    const events = loadEvents()
    expect(events.length).toBeGreaterThan(0)
    expect(events.every((e) => e.choices.length >= 1)).toBe(true)
  })

  it('rejette un id d’Événement en double (AD-4)', () => {
    const dup = [
      { id: 'x', text: 'a', choices: [{ label: 'ok' }] },
      { id: 'x', text: 'b', choices: [{ label: 'ok' }] },
    ]
    expect(() => parseEvents(dup)).toThrow(/double/i)
  })

  it('rejette un effet ciblant un canal inconnu / interne moteur (AD-5)', () => {
    const bad = [
      { id: 'y', text: 't', choices: [{ label: 'l', effects: [{ target: 'rng', op: 'set', value: 1 }] }] },
    ]
    expect(() => parseEvents(bad)).toThrow()
  })

  it('rejette un Événement sans choix', () => {
    expect(() => parseEvents([{ id: 'z', text: 't', choices: [] }])).toThrow()
  })

  it('applique les valeurs par défaut (weight, repeatable, conditions)', () => {
    const [e] = parseEvents([{ id: 'd', text: 't', choices: [{ label: 'l' }] }])
    expect(e.weight).toBe(1)
    expect(e.repeatable).toBe(false)
    expect(e.conditions).toEqual([])
  })
})
