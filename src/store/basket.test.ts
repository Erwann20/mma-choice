import { describe, it, expect } from 'vitest'
import { loadEvents } from '../schema'
import { startCareer, chooseInSession, continueSession, type Session } from './session'
import { RETIREMENT_AGE, START_AGE, createInitialState, sportDef, activeSequelae } from '../engine'
import type { GameState } from '../engine'
import type { EventDef, Choice } from '../schema'

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

  it('la draft fait signer une franchise et passer pro (palier régional)', () => {
    const draft = EVENTS.find((e) => e.id === 'bk-draft')
    if (!draft) throw new Error('bk-draft introuvable')
    const base = startCareer(EVENTS, 5, { sport: 'basket' })
    const ready: Session = {
      ...base,
      game: { ...base.game, meta: { ...base.game.meta, reputation: 30 } } as GameState,
      current: draft,
      opponent: null,
      lastResult: null,
      eventsThisYear: 0,
    }
    const idx = draft.choices.findIndex((c) => c.signOrg)
    const after = chooseInSession(ready, idx)
    expect(after.game.pro).toBe(true)
    expect(after.game.tier).toBe('regional')
    expect(after.game.organization).toBe(draft.choices[idx].signOrg)
  })
})

const MATCH: EventDef = {
  id: 'm', weight: 1, repeatable: true, text: 'match',
  fight: { titleFight: false }, choices: [{ label: 'x', effects: [], tactic: 'tir' }], conditions: [],
}
const SHOOT: Choice = { label: 'x', effects: [], tactic: 'tir' }
const def = sportDef('basket')

describe('systèmes transverses branchés sur le basket (J5)', () => {
  it('le tir signature ne dégrade jamais l’issue quand on l’emploie', () => {
    const base = createInitialState(9, { sport: 'basket' })
    const opp = { name: 'X', archetypeId: 'basket', label: 'Adv', style: 'meneur', level: 55, record: '5-5', weakTo: 'defense' as const }
    const rank = { upset: 3, clean: 2, poor: 1, loss: 0 }
    const plain = def.resolveMatch(base, MATCH, SHOOT, opp).result
    const signed = def.resolveMatch({ ...base, flags: { mentor_tir: true } } as GameState, MATCH, SHOOT, opp).result
    expect(rank[signed.outcome]).toBeGreaterThanOrEqual(rank[plain.outcome])
  })

  it('une lourde défaite peut laisser une séquelle chronique (cheville/genou/dos)', () => {
    const crusher = { name: 'Y', archetypeId: 'basket', label: 'Ogre', style: 'athlete', level: 100, record: '40-2', weakTo: 'tir' as const }
    let acquired = false
    for (let seed = 1; seed <= 40 && !acquired; seed++) {
      const base = createInitialState(seed, { sport: 'basket' })
      const g: GameState = { ...base, meta: { ...base.meta, health: 8 } }
      const { game, result } = def.resolveMatch(g, MATCH, SHOOT, crusher)
      if (!result.win && result.newInjury) {
        acquired = true
        expect(['sequelle_cheville', 'sequelle_genou', 'sequelle_dos']).toContain(result.newInjury)
        expect(activeSequelae(game)).toContain(result.newInjury)
      }
    }
    expect(acquired).toBe(true)
  })
})
