import { describe, it, expect, beforeEach } from 'vitest'
import { loadEvents } from '../schema'
import { startDailyCareer, chooseInSession, continueSession, type Session } from './session'
import { useGameStore, todayKey, yesterdayKey } from './game'

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

  it('incrémente la série quand la mission de la veille a été jouée', () => {
    useGameStore.setState({
      session: null,
      dailyResult: { date: yesterdayKey(), score: 40 },
      dailyStreak: 3,
      dailyHistory: [{ date: yesterdayKey(), score: 40 }],
    })
    useGameStore.getState().startDaily()
    useGameStore.getState().retire()
    expect(useGameStore.getState().dailyStreak).toBe(4)
    expect(useGameStore.getState().dailyHistory[0].date).toBe(todayKey())
    expect(useGameStore.getState().dailyHistory).toHaveLength(2)
  })

  it('réinitialise la série à 1 si un jour a été manqué', () => {
    useGameStore.setState({
      session: null,
      dailyResult: { date: '2000-1-1', score: 40 },
      dailyStreak: 9,
      dailyHistory: [],
    })
    useGameStore.getState().startDaily()
    useGameStore.getState().retire()
    expect(useGameStore.getState().dailyStreak).toBe(1)
  })
})
