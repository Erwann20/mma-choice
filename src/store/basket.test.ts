import { describe, it, expect } from 'vitest'
import { loadEvents } from '../schema'
import { startCareer, chooseInSession, continueSession, type Session } from './session'
import { RETIREMENT_AGE, START_AGE } from '../engine'

/** Un tour complet : choisir, puis drainer les écrans de pause. */
function step(s: Session): Session {
  let a = chooseInSession(s, 0)
  let guard = 0
  while (
    (a.lastResult || a.lastReveal || a.yearReview || (a.tournament && a.tournament.status !== 'fighting')) &&
    guard++ < 50
  ) {
    a = continueSession(a)
  }
  return a
}

const EVENTS = loadEvents('basket')

describe('carrière basket (J2)', () => {
  it('démarre un basketteur avec les attributs du basket', () => {
    const s = startCareer(EVENTS, 7, { sport: 'basket' })
    expect(s.game.sport).toBe('basket')
    expect(Object.keys(s.game.stats).sort()).toEqual(['athletisme', 'defense', 'dribble', 'passe', 'tir'])
    expect(s.game.fighter.age).toBe(START_AGE)
    expect(s.current).not.toBeNull()
  })

  it('boucle une carrière entière jusqu’à la retraite, matchs à l’appui', () => {
    let s = startCareer(EVENTS, 3, { sport: 'basket' })
    let guard = 0
    while (s.game.phase !== 'retired' && guard++ < 800) s = step(s)
    expect(s.game.phase).toBe('retired')
    expect(s.game.fighter.age).toBeGreaterThanOrEqual(RETIREMENT_AGE)
    // Des matchs ont bien eu lieu (vécus + simulés) et alimenté le palmarès.
    expect(s.game.record.wins + s.game.record.losses).toBeGreaterThan(0)
  })
})
