import { describe, it, expect } from 'vitest'
import type { EventDef } from '../schema'
import { startCareer, chooseInSession, continueSession, retireCareer, type Session } from './session'
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

  it('fait naître une némésis sur un combat de rivalité et suit le face-à-face', () => {
    const story = ev('s')
    const nemFight: EventDef = {
      id: 'nem',
      weight: 50,
      repeatable: true,
      overline: undefined,
      text: 'rival {nemesis}',
      fight: { titleFight: false, nemesis: true },
      choices: [{ label: 'x', effects: [], tactic: 'striking' }],
      conditions: [],
    }
    let s: Session = startCareer([story, nemFight], 1)
    for (let i = 0; i < 15; i++) s = step(s)
    expect(s.game.nemesis).not.toBeNull()
    expect(s.game.flags['nemesis_ne']).toBe(true)
    // Un même rival, recroisé : le face-à-face a été alimenté au fil des duels.
    const total = (s.game.nemesis?.playerWins ?? 0) + (s.game.nemesis?.playerLosses ?? 0)
    expect(total).toBeGreaterThanOrEqual(1)
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

  it('dispute des combats de saison hors caméra, comptés au bilan', () => {
    // EVENTS synthétiques = aucun combat interactif ; seuls les combats simulés
    // de fin d'année alimentent le palmarès (amateur : 4 total − 1 vécu = 3).
    let s: Session = startCareer(EVENTS, 1)
    const yearLen = s.yearPlan.length
    for (let i = 0; i < yearLen - 1; i++) s = step(s)
    const atReview = continueSession(chooseInSession(s, 0))
    expect(atReview.yearReview?.autoFights).toBe(3)
    const total = (atReview.yearReview?.wins ?? 0) + (atReview.yearReview?.losses ?? 0)
    expect(total).toBe(3)
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

  it('retraite volontaire : raccroche les gants immédiatement', () => {
    const s = startCareer(EVENTS, 1)
    expect(s.game.phase).toBe('career')
    const retired = retireCareer(s)
    expect(retired.game.phase).toBe('retired')
    expect(retired.current).toBeNull()
    expect(retired.tournament).toBeNull()
  })

  it('une carrière se termine à la retraite (current = null, phase retired)', () => {
    let s: Session = startCareer(EVENTS, 1)
    let guard = 0
    while (s.current && guard++ < 5000) s = step(s)
    expect(s.game.phase).toBe('retired')
    expect(s.current).toBeNull()
  })

  it('génère un nom de combattant aléatoire, déterministe par graine', () => {
    const a = startCareer(EVENTS, 1)
    const b = startCareer(EVENTS, 1)
    const c = startCareer(EVENTS, 2)
    expect(a.game.fighter.name).not.toBe('Nouveau combattant')
    expect(a.game.fighter.name).toContain(' ') // prénom + nom
    expect(a.game.fighter.name).toBe(b.game.fighter.name) // même graine → même nom
    expect(a.game.fighter.name).not.toBe(c.game.fighter.name) // graines ≠ → noms ≠
  })

  it('respecte un nom explicite fourni (pas d’écrasement aléatoire)', () => {
    const s = startCareer(EVENTS, 1, { name: 'Conor McGregor' })
    expect(s.game.fighter.name).toBe('Conor McGregor')
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
