import { describe, it, expect } from 'vitest'
import { loadEvents, loadStartingCriteria, loadOrganizations } from '../schema'
import { startCareerFromCreation, chooseInSession, type CreationChoices, type Session } from './session'
import { isEligible } from '../engine'
import type { GameState } from '../engine'

const criteria: CreationChoices = {
  name: 'T', sex: 'M', country: 'FR', style: 'allrounder', division: 'lightweight-m',
  originId: 'lutteur-univ', entourageId: 'coach',
}

function sessionAt(patch: Partial<GameState>): Session {
  const s = startCareerFromCreation(loadEvents(), loadStartingCriteria(), 1, criteria)
  return { ...s, game: { ...s.game, ...patch } }
}

const evt = (id: string) => {
  const e = loadEvents().find((x) => x.id === id)
  if (!e) throw new Error(`introuvable: ${id}`)
  return e
}

describe('organisations & passage pro (FR-5)', () => {
  it("un combattant démarre amateur, sans organisation", () => {
    const s = startCareerFromCreation(loadEvents(), loadStartingCriteria(), 1, criteria)
    expect(s.game.pro).toBe(false)
    expect(s.game.organization).toBeNull()
    expect(s.game.tier).toBe('immaf')
  })

  it("l'événement « passer pro » n'apparaît qu'avec assez de victoires et de réputation", () => {
    const proEvent = evt('evt-passer-pro')
    const rookie = sessionAt({ meta: { ...startCareerFromCreation(loadEvents(), loadStartingCriteria(), 1, criteria).game.meta, reputation: 5 } }).game
    expect(isEligible(rookie, proEvent)).toBe(false)
    const ready = sessionAt({ record: { wins: 4, losses: 0, finishes: 1 }, meta: { health: 100, mental: 60, reputation: 20, followers: 0, money: 0 } }).game
    expect(isEligible(ready, proEvent)).toBe(true)
  })

  it("signer une organisation passe pro, fixe l'orga et cale le palier", () => {
    const proEvent = evt('evt-passer-pro')
    const ready = sessionAt({ record: { wins: 4, losses: 0, finishes: 1 }, meta: { health: 100, mental: 60, reputation: 20, followers: 0, money: 0 } })
    const session: Session = { ...ready, current: proEvent, opponent: null, lastResult: null, eventsThisYear: 0 }
    const orgChoiceIdx = proEvent.choices.findIndex((c) => c.signOrg)
    const after = chooseInSession(session, orgChoiceIdx)
    expect(after.game.pro).toBe(true)
    expect(after.game.organization).toBe(proEvent.choices[orgChoiceIdx].signOrg)
    expect(after.game.tier).toBe('regional')
  })

  it('les organisations majeures existent bien dans le contenu', () => {
    const orgs = loadOrganizations()
    expect(orgs.some((o) => o.tier === 'major')).toBe(true)
    expect(orgs.some((o) => o.tier === 'regional')).toBe(true)
  })

  it('signer une organisation AMATEUR ne fait pas passer pro (reste amateur)', () => {
    const offer = evt('evt-offre-amateur')
    const ready = sessionAt({ record: { wins: 3, losses: 0, finishes: 0 } })
    const session: Session = { ...ready, current: offer, opponent: null, lastResult: null, lastReveal: null, eventsThisYear: 0 }
    const idx = offer.choices.findIndex((c) => c.signOrg)
    const after = chooseInSession(session, idx)
    expect(after.game.organization).toBe(offer.choices[idx].signOrg)
    expect(after.game.pro).toBe(false)
    expect(after.game.tier).toBe('immaf')
  })
})
