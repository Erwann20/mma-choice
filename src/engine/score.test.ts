import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { computeScore, allTimeRank, fighterOverall } from './score'

describe('note générale (OVR)', () => {
  it('reste dans [0, 100] et monte avec les stats de combat', () => {
    const rookie = createInitialState(1)
    const o = fighterOverall(rookie)
    expect(o).toBeGreaterThanOrEqual(0)
    expect(o).toBeLessThanOrEqual(100)
    const elite = {
      ...rookie,
      stats: { striking: 95, grappling: 90, ground: 90, cardio: 90 },
      meta: { ...rookie.meta, mental: 90 },
    }
    expect(fighterOverall(elite)).toBeGreaterThan(o)
    expect(fighterOverall(elite)).toBeGreaterThanOrEqual(88)
  })

  it('ne dépend que des stats/mental (indépendant du palmarès et de l’argent)', () => {
    const base = createInitialState(2)
    const rich = { ...base, meta: { ...base.meta, money: 999999, followers: 500000, reputation: 100 } }
    expect(fighterOverall(rich)).toBe(fighterOverall(base))
  })
})

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
