import { describe, it, expect } from 'vitest'
import { loadEvents, loadOpponentPool } from '../schema'
import { createInitialState } from '../engine'
import { createTournament, advanceTournament } from './tournament'
import { startCareer, chooseInSession, continueSession, type Session } from './session'

const pool = loadOpponentPool()
const regional = loadEvents().find((e) => e.id === 'fight-tournoi-regional')
if (!regional) throw new Error('tournoi régional introuvable')

describe('tournoi — module (bracket)', () => {
  it('ouvre un tableau de 4 : joueur en tête, 1er adversaire, matchs simulés posés', () => {
    const setup = createTournament(createInitialState(1), regional, pool)
    expect(setup.tournament.size).toBe(4)
    expect(setup.tournament.roundsTotal).toBe(2)
    expect(setup.tournament.slots).toHaveLength(4)
    expect(setup.tournament.slots[0].isPlayer).toBe(true)
    expect(setup.opponent).toBeTruthy()
    expect(setup.roundName).toBe('Demi-finale')
    expect(setup.isFinal).toBe(false)
    // 1er tour posé : 2 matchs ; celui du joueur en attente, l'autre déjà simulé.
    expect(setup.tournament.bracket[0]).toHaveLength(2)
    const player = setup.tournament.bracket[0].find((m) => m.isPlayer)
    const other = setup.tournament.bracket[0].find((m) => !m.isPlayer)
    expect(player?.winnerId).toBeNull()
    expect(other?.winnerId).not.toBeNull()
  })

  it('gagner la demie puis la finale sacre le joueur', () => {
    const setup = createTournament(createInitialState(2), regional, pool)
    const semi = advanceTournament(setup.tournament, setup.game, true)
    expect(semi.done).toBe(false)
    if (semi.done) return
    expect(semi.isFinal).toBe(true)
    expect(semi.roundName).toBe('Finale')
    const final = advanceTournament(semi.tournament, semi.game, true)
    expect(final.done).toBe(true)
    if (!final.done) return
    expect(final.tournament.status).toBe('won')
  })

  it('perdre un tour élimine le joueur', () => {
    const setup = createTournament(createInitialState(3), regional, pool)
    const out = advanceTournament(setup.tournament, setup.game, false)
    expect(out.done).toBe(true)
    if (!out.done) return
    expect(out.tournament.status).toBe('eliminated')
  })

  it('un tableau de 8 compte 3 tours', () => {
    const europe = loadEvents().find((e) => e.id === 'fight-tournoi-europe')
    if (!europe) throw new Error('tournoi europe introuvable')
    const setup = createTournament(createInitialState(4), europe, pool)
    expect(setup.tournament.size).toBe(8)
    expect(setup.tournament.roundsTotal).toBe(3)
    expect(setup.roundName).toBe('Quart de finale')
    expect(setup.tournament.bracket[0]).toHaveLength(4)
  })
})

/** Joue toujours le choix 0 et draine les écrans de pause (résultat/bilan/tournoi). */
function drive(s: Session, onTournament: () => void): Session {
  let cur = chooseInSession(s, 0)
  let guard = 0
  while (
    (cur.lastResult ||
      cur.lastReveal ||
      cur.yearReview ||
      (cur.tournament && cur.tournament.status !== 'fighting')) &&
    guard++ < 200
  ) {
    if (cur.tournament) onTournament()
    cur = continueSession(cur)
  }
  return cur
}

describe('tournoi — intégration carrière', () => {
  it('une carrière réelle enchaîne combats et tournois jusqu’à la retraite', () => {
    const events = loadEvents()
    let sawTournament = false
    // Au moins une graine doit produire un tournoi vécu bout-en-bout.
    for (const seed of [7, 11, 21, 42]) {
      let s: Session = startCareer(events, seed)
      let guard = 0
      while (s.current && guard++ < 4000) {
        if (s.tournament) sawTournament = true
        s = drive(s, () => {
          sawTournament = true
        })
      }
      expect(s.game.phase).toBe('retired')
    }
    expect(sawTournament).toBe(true)
  })
})
