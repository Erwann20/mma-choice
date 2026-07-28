import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { careerTitle, careerAchievements } from './awards'
import type { GameState } from './state'

describe('titre de carrière (FR-14)', () => {
  it('mappe le score sur un titre, du plus discret au GOAT', () => {
    expect(careerTitle(95).tone).toBe('goat')
    expect(careerTitle(80).tone).toBe('legend')
    expect(careerTitle(65).tone).toBe('star')
    expect(careerTitle(50).tone).toBe('solid')
    expect(careerTitle(10).tone).toBe('plain')
  })
})

describe('trophées de carrière', () => {
  it('un débutant sans exploit ne débloque rien', () => {
    expect(careerAchievements(createInitialState(1))).toEqual([])
  })

  it('débloque invaincu, guerrier et finisseur selon le palmarès', () => {
    const g: GameState = {
      ...createInitialState(1),
      record: { wins: 12, losses: 0, finishes: 6 },
    }
    const ids = careerAchievements(g).map((a) => a.id)
    expect(ids).toContain('invaincu')
    expect(ids).toContain('guerrier')
    expect(ids).toContain('finisseur')
  })

  it('le titre national reflète le pays du combattant', () => {
    const base = createInitialState(1, { country: 'Brésil' })
    const g: GameState = { ...base, flags: { titre_national: true } }
    const champ = careerAchievements(g).find((a) => a.id === 'champ-national')
    expect(champ?.label).toBe('Champion du Brésil (amateur)')
  })

  it('débloque les trophées de notoriété et de fortune', () => {
    const base = createInitialState(1)
    const g: GameState = { ...base, meta: { ...base.meta, followers: 60000, money: 150000 } }
    const ids = careerAchievements(g).map((a) => a.id)
    expect(ids).toContain('star-reseaux')
    expect(ids).toContain('fortune')
  })
})
