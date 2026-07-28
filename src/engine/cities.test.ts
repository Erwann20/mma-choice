import { describe, it, expect } from 'vitest'
import { citiesForCountry, cityForSlot } from './cities'
import { createInitialState } from './state'
import { applyChoice } from './effects'
import type { EventDef, Choice } from '../schema'

const EV: EventDef = {
  id: 'club',
  weight: 1,
  repeatable: true,
  text: 'club',
  choices: [{ label: 'x', effects: [] }],
  conditions: [],
}

describe('villes par pays (FR-1)', () => {
  it('propose des villes crédibles selon le pays', () => {
    expect(citiesForCountry('France')[0]).toBe('Paris')
    expect(citiesForCountry('États-Unis')).toContain('Las Vegas')
    expect(citiesForCountry('États-Unis')).not.toContain('Nantes')
  })

  it('retombe sur des descripteurs neutres pour un pays inconnu', () => {
    const c = citiesForCountry('Atlantide')
    expect(c.length).toBeGreaterThan(0)
    // Jamais une ville étrangère plaquée à tort.
    expect(c).not.toContain('Paris')
  })

  it('cityForSlot lit le bon slot (1-based), null hors bornes', () => {
    expect(cityForSlot('France', 2)).toBe('Nantes')
    expect(cityForSlot('France', 99)).toBeNull()
  })

  it('setCity pose la ville du PAYS du combattant', () => {
    const us = createInitialState(1, { country: 'États-Unis' })
    const choice: Choice = { label: 'grande scène', effects: [], setCity: 1 }
    const after = applyChoice(us, EV, choice)
    expect(after.fighter.city).toBe('Las Vegas')
    // Un Américain n'hérite jamais d'une ville française.
    expect(citiesForCountry('France')).toContain('Paris')
    expect(after.fighter.city).not.toBe('Paris')
  })
})
