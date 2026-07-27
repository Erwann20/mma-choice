import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { reduce } from './reducer'
import { RETIREMENT_AGE, START_AGE } from './config'

describe('reduce', () => {
  it('ne mute pas l’état d’entrée (AD-2)', () => {
    const s = createInitialState(1)
    const snapshot = structuredClone(s)
    reduce(s, { type: 'ADVANCE_YEAR' })
    expect(s).toEqual(snapshot)
  })

  it('avancer d’une année incrémente l’âge (FR-4)', () => {
    const s = createInitialState(1)
    const s1 = reduce(s, { type: 'ADVANCE_YEAR' })
    expect(s1.fighter.age).toBe(START_AGE + 1)
    expect(s.fighter.age).toBe(START_AGE)
  })

  it('déterminisme : même graine + mêmes actions => états strictement égaux (AD-3)', () => {
    const run = () => {
      let s = createInitialState(123)
      for (let i = 0; i < 5; i++) s = reduce(s, { type: 'ADVANCE_YEAR' })
      return s
    }
    expect(run()).toEqual(run())
  })

  it('âge-out => phase "retired" (FR-4)', () => {
    let s = createInitialState(1)
    let guard = 0
    while (s.phase === 'career' && guard++ < 100) {
      s = reduce(s, { type: 'ADVANCE_YEAR' })
    }
    expect(s.fighter.age).toBeGreaterThanOrEqual(RETIREMENT_AGE)
    expect(s.phase).toBe('retired')
  })
})
