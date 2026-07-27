import { describe, it, expect } from 'vitest'
import type { EventDef } from '../schema'
import { startCareer, chooseInSession, continueSession, type Session } from './session'
import { EVENTS_PER_YEAR, START_AGE } from '../engine'

/** Un « tour » complet : choisir puis passer l'écran de conséquences. */
function step(s: Session): Session {
  const after = chooseInSession(s, 0)
  return after.lastResult || after.lastReveal ? continueSession(after) : after
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
  it('démarre avec un Événement courant', () => {
    const s = startCareer(EVENTS, 1)
    expect(s.current).not.toBeNull()
    expect(s.game.fighter.age).toBe(START_AGE)
  })

  it('avance d’une année tous les EVENTS_PER_YEAR choix', () => {
    let s: Session = startCareer(EVENTS, 1)
    for (let i = 0; i < EVENTS_PER_YEAR; i++) s = step(s)
    expect(s.game.fighter.age).toBe(START_AGE + 1)
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
    while (s.current && guard++ < 1000) s = step(s)
    expect(s.game.phase).toBe('retired')
    expect(s.current).toBeNull()
  })

  it('déterministe : même graine + mêmes choix => même carrière', () => {
    const run = () => {
      let s: Session = startCareer(EVENTS, 999)
      let g = 0
      while (s.current && g++ < 1000) s = step(s)
      return s.game
    }
    expect(run()).toEqual(run())
  })
})
