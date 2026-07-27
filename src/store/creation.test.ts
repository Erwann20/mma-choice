import { describe, it, expect } from 'vitest'
import { divisionsForSex, loadDivisions, loadStartingCriteria } from '../schema'
import { startCareerFromCreation } from './session'
import { loadEvents } from '../schema'

describe('création de combattant', () => {
  it('le sexe filtre les divisions (grilles UFC hommes/femmes)', () => {
    const all = loadDivisions()
    const men = divisionsForSex(all, 'M')
    const women = divisionsForSex(all, 'F')
    expect(men.length).toBe(8)
    expect(women.length).toBe(4)
    expect(men.every((d) => d.sex === 'M')).toBe(true)
  })

  it('les critères de départ distribuent les stats (FR-2)', () => {
    const s = startCareerFromCreation(loadEvents(), loadStartingCriteria(), 1, {
      sex: 'M',
      country: 'France',
      startAge: 18,
      style: 'striker',
      division: 'lightweight-m',
      originId: 'rue', // striking +10, mental -5
      entourageId: 'coach', // mental +10
    })
    // base striking 40 +10 = 50 ; mental 60 -5 +10 = 65
    expect(s.game.stats.striking).toBe(50)
    expect(s.game.meta.mental).toBe(65)
    expect(s.game.fighter.sex).toBe('M')
    expect(s.game.division).toBe('lightweight-m')
  })
})
