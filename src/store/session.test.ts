import { describe, it, expect } from 'vitest'
import type { EventDef } from '../schema'
import { startCareer, chooseInSession, type Session } from './session'
import { EVENTS_PER_YEAR, START_AGE } from '../engine'

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
    for (let i = 0; i < EVENTS_PER_YEAR; i++) s = chooseInSession(s, 0)
    expect(s.game.fighter.age).toBe(START_AGE + 1)
  })

  it('une carrière se termine à la retraite (current = null, phase retired)', () => {
    let s: Session = startCareer(EVENTS, 1)
    let guard = 0
    while (s.current && guard++ < 1000) s = chooseInSession(s, 0)
    expect(s.game.phase).toBe('retired')
    expect(s.current).toBeNull()
  })

  it('déterministe : même graine + mêmes choix => même carrière', () => {
    const run = () => {
      let s: Session = startCareer(EVENTS, 999)
      let g = 0
      while (s.current && g++ < 1000) s = chooseInSession(s, 0)
      return s.game
    }
    expect(run()).toEqual(run())
  })
})
