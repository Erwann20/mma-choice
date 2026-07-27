import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { computeScore, allTimeRank } from './score'

describe('score de carrière', () => {
  it('reste dans [0, 100] et est reproductible (NFR-5)', () => {
    const g = createInitialState(1)
    const s = computeScore(g)
    expect(s).toBeGreaterThanOrEqual(0)
    expect(s).toBeLessThanOrEqual(100)
    expect(computeScore(g)).toBe(s)
  })

  it('de meilleures stats/réputation donnent un meilleur score', () => {
    const base = createInitialState(1)
    const better = {
      ...base,
      stats: { striking: 90, grappling: 90, ground: 90, cardio: 90 },
      meta: { ...base.meta, reputation: 90, followers: 100000 },
    }
    expect(computeScore(better)).toBeGreaterThan(computeScore(base))
  })

  it('un meilleur score => meilleur rang (N plus petit)', () => {
    expect(allTimeRank(90)).toBeLessThan(allTimeRank(40))
    expect(allTimeRank(100)).toBe(1)
  })
})
