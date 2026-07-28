import { describe, it, expect, beforeEach } from 'vitest'
import { loadEvents } from '../schema'
import { startDailyCareer, chooseInSession, continueSession, type Session } from './session'
import { useGameStore } from './game'

function step(s: Session): Session {
  let a = chooseInSession(s, 0)
  // Draine tous les écrans de pause : conséquences, bilan annuel, fin de tournoi.
  let g = 0
  while (
    (a.lastResult || a.lastReveal || a.yearReview || (a.tournament && a.tournament.status !== 'fighting')) &&
    g++ < 50
  ) {
    a = continueSession(a)
  }
  return a
}

describe('mission du jour — session bornée', () => {
  it('est un sprint : retraite forcée au bout de maxYear années', () => {
    let s = startDailyCareer(loadEvents(), 12345, 3)
    expect(s.daily).toBe(true)
    expect(s.maxYear).toBe(3)
    let guard = 0
    while (s.current && guard++ < 500) s = step(s)
    expect(s.game.phase).toBe('retired')
    // Bornée bien avant l'âge de retraite naturel (38).
    expect(s.game.fighter.age).toBeLessThan(30)
  })

  it('deux joueurs, même jour (même graine) ⇒ même run', () => {
    const a = startDailyCareer(loadEvents(), 999, 6)
    const b = startDailyCareer(loadEvents(), 999, 6)
    expect(a.game.fighter.name).toBe(b.game.fighter.name)
    expect(a.current?.id).toBe(b.current?.id)
  })
})

describe('mission du jour — verrou quotidien (store)', () => {
  beforeEach(() => useGameStore.setState({ session: null, archive: [], dailyResult: null }))

  it('démarre une mission, puis se verrouille après l’avoir terminée', () => {
    useGameStore.getState().startDaily()
    expect(useGameStore.getState().session?.daily).toBe(true)

    useGameStore.getState().retire()
    const dr = useGameStore.getState().dailyResult
    expect(dr).not.toBeNull()
    expect(typeof dr?.score).toBe('number')

    // Relancer le même jour : verrouillé (aucune nouvelle session).
    useGameStore.setState({ session: null })
    useGameStore.getState().startDaily()
    expect(useGameStore.getState().session).toBeNull()
  })
})
