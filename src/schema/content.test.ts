import { describe, it, expect } from 'vitest'
import { loadEvents, parseEvents, loadIcons } from './content'

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

  it('propose un combat de ceinture à chaque palier pro (régional ET majeur)', () => {
    const titleFights = loadEvents().filter((e) => e.fight?.titleFight)
    const atRegional = titleFights.some((e) =>
      e.conditions.some((c) => c.kind === 'stat' && c.on === 'tier' && c.value <= 1),
    )
    const atMajor = titleFights.some((e) =>
      e.conditions.some((c) => c.kind === 'stat' && c.on === 'tier' && c.cmp === 'gte' && c.value >= 2),
    )
    expect(atRegional).toBe(true)
    expect(atMajor).toBe(true)
  })

  it('offre une bonne variété de combats simples (hors tournois)', () => {
    const simpleFights = loadEvents().filter((e) => e.fight && e.fight.bracket === undefined)
    expect(simpleFights.length).toBeGreaterThanOrEqual(15)
  })

  it('charge des icônes basket valides (mode Revivre)', () => {
    const icons = loadIcons('basket')
    expect(icons.length).toBeGreaterThanOrEqual(5)
    expect(icons.every((i) => i.sport === 'basket')).toBe(true)
    // Les postes des icônes existent bien comme positions du sport basket.
    expect(icons.every((i) => typeof i.division === 'string' && i.division.length > 0)).toBe(true)
  })

  it('charge le contenu basket sans le mélanger au MMA', () => {
    const bk = loadEvents('basket').map((e) => e.id)
    const mma = loadEvents('mma').map((e) => e.id)
    expect(bk.every((id) => id.startsWith('bk-'))).toBe(true)
    expect(mma.some((id) => id.startsWith('bk-'))).toBe(false)
  })

  it('applique les valeurs par défaut (weight, repeatable, conditions)', () => {
    const [e] = parseEvents([{ id: 'd', text: 't', choices: [{ label: 'l' }] }])
    expect(e.weight).toBe(1)
    expect(e.repeatable).toBe(false)
    expect(e.conditions).toEqual([])
  })
})
