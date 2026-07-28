import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { dailyObjective, dailyScore } from './daily'
import { computeScore } from './score'

describe('objectif de la mission du jour', () => {
  it('est déterministe et cyclique selon la graine', () => {
    expect(dailyObjective(0).id).toBe(dailyObjective(8).id) // cycle de 8
    expect(dailyObjective(0).id).not.toBe(dailyObjective(1).id)
  })

  it('dailyScore ajoute le bonus quand l’objectif est atteint (borné à 100)', () => {
    const obj = dailyObjective(2) // seed 2 → objectif « passer pro »
    expect(obj.id).toBe('pro')
    const base = createInitialState(2)
    expect(dailyScore(base)).toBe(computeScore(base)) // pas pro ⇒ pas de bonus
    const pro = { ...base, pro: true }
    expect(dailyScore(pro)).toBe(Math.min(100, computeScore(pro) + obj.bonus))
  })

  it('reconnaît un objectif « champion national » via le drapeau', () => {
    const obj = dailyObjective(1)
    expect(obj.id).toBe('champion-national')
    const base = createInitialState(1)
    expect(obj.met(base)).toBe(false)
    expect(obj.met({ ...base, flags: { titre_national: true } })).toBe(true)
  })
})
