import { describe, it, expect } from 'vitest'
import { sportDef, playableSports } from './registry'
import { createInitialState } from '../state'
import { fighterOverall, computeScore } from '../score'
import { careerAchievements } from '../awards'

describe('fondation multi-sports (SportDef)', () => {
  it('le MMA est enregistré et jouable', () => {
    const mma = sportDef('mma')
    expect(mma.id).toBe('mma')
    expect(mma.statKeys).toEqual(['striking', 'grappling', 'ground', 'cardio'])
    expect(playableSports().map((s) => s.id)).toContain('mma')
  })

  it('createInitialState pose le sport et ses attributs de départ', () => {
    const g = createInitialState(1)
    expect(g.sport).toBe('mma')
    expect(g.stats).toEqual({ striking: 40, grappling: 40, ground: 40, cardio: 50 })
  })

  it('un sport inconnu retombe sur le MMA (robustesse)', () => {
    // @ts-expect-error : id volontairement hors union pour tester le repli
    expect(sportDef('curling').id).toBe('mma')
  })

  it('les dispatchers délèguent au sport de l’état', () => {
    const g = createInitialState(1)
    // Mêmes résultats qu'avant le refactor (délégation transparente au MMA).
    expect(fighterOverall(g)).toBe(sportDef('mma').overall(g))
    expect(computeScore(g)).toBe(sportDef('mma').score(g))
    expect(careerAchievements(g)).toEqual(sportDef('mma').achievements(g))
  })
})
