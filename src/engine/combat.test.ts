import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { generateOpponent } from './combat'
import { initRng } from './rng'
import { loadOpponentPool } from '../schema'
import type { GameState } from './state'

const pool = loadOpponentPool()

function avgLevel(base: GameState, seeds: number): number {
  let total = 0
  for (let s = 1; s <= seeds; s++) {
    const [opp] = generateOpponent(base, pool, initRng(s * 1000))
    total += opp.level
  }
  return total / seeds
}

describe('generateOpponent (FR-16)', () => {
  it('est déterministe : même état + même graine ⇒ même adversaire', () => {
    const g = createInitialState(42)
    const [a] = generateOpponent(g, pool, initRng(7))
    const [b] = generateOpponent(g, pool, initRng(7))
    expect(a).toEqual(b)
  })

  it('produit un adversaire cohérent (niveau borné, archétype connu)', () => {
    const g = createInitialState(1)
    const [opp] = generateOpponent(g, pool, initRng(123))
    expect(opp.level).toBeGreaterThanOrEqual(0)
    expect(opp.level).toBeLessThanOrEqual(100)
    expect(pool.archetypes.some((a) => a.id === opp.archetypeId)).toBe(true)
    expect(opp.name).toMatch(/\S \S/)
  })

  it('la force moyenne monte avec le palier', () => {
    const immaf = createInitialState(1)
    const major: GameState = { ...immaf, tier: 'major' }
    expect(avgLevel(major, 40)).toBeGreaterThan(avgLevel(immaf, 40))
  })

  it('la force moyenne monte avec la réputation', () => {
    const low = createInitialState(1)
    const high: GameState = { ...low, meta: { ...low.meta, reputation: 90 } }
    expect(avgLevel(high, 40)).toBeGreaterThan(avgLevel(low, 40))
  })
})
