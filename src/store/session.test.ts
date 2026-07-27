import { describe, it, expect } from 'vitest'
import type { EventDef } from '../schema'
import { startCareer, chooseInSession, continueSession, type Session } from './session'
import { START_AGE } from '../engine'

/** Un « tour » complet : choisir, passer l'écran de conséquences ET le bilan annuel. */
function step(s: Session): Session {
  let after = chooseInSession(s, 0)
  if (after.lastResult || after.lastReveal) after = continueSession(after)
  if (after.yearReview) after = continueSession(after)
  return after
}

const ev = (id: string): EventDef => ({
  id,
  weight: 1,
  repeatable: true,
  overline: undefined,
  text: 't',
  choices: [{ label: 'ok', effects: [{ target: 'reputation', op: 'add', value: 1 }] }],
  conditions: [],
})

const EVENTS = [ev('a'), ev('b'), ev('c')]

describe('session', () => {
  it('démarre avec un Événement courant et un plan d’année', () => {
    const s = startCareer(EVENTS, 1)
    expect(s.current).not.toBeNull()
    expect(s.game.fighter.age).toBe(START_AGE)
    expect(s.yearPlan.length).toBeGreaterThan(0)
    expect(s.year).toBe(1)
  })

  it('vieillit d’un an une fois tous les créneaux du plan joués', () => {
    let s: Session = startCareer(EVENTS, 1)
    const yearLen = s.yearPlan.length
    for (let i = 0; i < yearLen; i++) s = step(s)
    expect(s.game.fighter.age).toBe(START_AGE + 1)
    expect(s.year).toBe(2)
  })

  it('dresse un bilan de fin d’année avant de vieillir', () => {
    let s: Session = startCareer(EVENTS, 1)
    const yearLen = s.yearPlan.length
    for (let i = 0; i < yearLen - 1; i++) s = step(s)
    const atReview = continueSession(chooseInSession(s, 0))
    expect(atReview.yearReview).not.toBeNull()
    expect(atReview.yearReview?.year).toBe(1)
    expect(atReview.current).toBeNull()
    // Reprendre enchaîne sur la nouvelle année.
    const resumed = continueSession(atReview)
    expect(resumed.yearReview).toBeNull()
    expect(resumed.current).not.toBeNull()
  })

  it('un choix à effet passe par un écran de conséquences avant d’avancer', () => {
    const s0 = startCareer(EVENTS, 1)
    const afterChoice = chooseInSession(s0, 0)
    // Ne s’avance pas tout de suite : on révèle les deltas d’abord.
    expect(afterChoice.lastReveal).not.toBeNull()
    expect(afterChoice.current).toBe(s0.current)
    const resumed = continueSession(afterChoice)
    expect(resumed.lastReveal).toBeNull()
  })

  it('une carrière se termine à la retraite (current = null, phase retired)', () => {
    let s: Session = startCareer(EVENTS, 1)
    let guard = 0
    while (s.current && guard++ < 5000) s = step(s)
    expect(s.game.phase).toBe('retired')
    expect(s.current).toBeNull()
  })

  it('déterministe : même graine + mêmes choix => même carrière', () => {
    const run = () => {
      let s: Session = startCareer(EVENTS, 999)
      let g = 0
      while (s.current && g++ < 5000) s = step(s)
      return s.game
    }
    expect(run()).toEqual(run())
  })
})
