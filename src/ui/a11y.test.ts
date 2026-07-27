import { describe, it, expect } from 'vitest'
import { describeStatChanges } from './a11y'
import { createInitialState } from '../engine'
import type { GameState } from '../engine'

describe('annonce des variations de stats (NFR-10, UX-DR17)', () => {
  it('décrit les variations signées avec libellés FR', () => {
    const prev = createInitialState(1)
    const next: GameState = {
      ...prev,
      meta: { ...prev.meta, reputation: prev.meta.reputation + 8, health: prev.meta.health - 5 },
    }
    const msg = describeStatChanges(prev, next)
    expect(msg).toContain('Réputation +8')
    expect(msg).toContain('Forme −5')
  })

  it('chaîne vide si aucune variation', () => {
    const g = createInitialState(1)
    expect(describeStatChanges(g, g)).toBe('')
  })

  it("l'argent porte l'unité €", () => {
    const prev = createInitialState(1)
    const next: GameState = { ...prev, meta: { ...prev.meta, money: prev.meta.money + 2000 } }
    expect(describeStatChanges(prev, next)).toContain('+2000 €')
  })
})
