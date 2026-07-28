import { describe, it, expect } from 'vitest'
import { loadEvents, loadStartingCriteria } from '../schema'
import { startCareerFromCreation, chooseInSession, type Session, type CreationChoices } from './session'
import { isEligible } from '../engine'

const creation: CreationChoices = {
  name: 'T', sex: 'M', country: 'France', style: 'allrounder', division: 'lightweight-m',
  originId: 'lutteur-univ', entourageId: 'coach',
}
const events = loadEvents()

/** Signe l'organisation `orgId` via la première offre qui la propose. */
function signAndGetGame(orgId: string) {
  const ev = events.find((e) => e.choices.some((c) => c.signOrg === orgId))
  if (!ev) throw new Error(`aucune offre ne propose ${orgId}`)
  const idx = ev.choices.findIndex((c) => c.signOrg === orgId)
  const base = startCareerFromCreation(events, loadStartingCriteria(), 1, creation)
  const session: Session = {
    ...base, current: ev, opponent: null, lastResult: null, lastReveal: null, yearReview: null, tournament: null,
  }
  return chooseInSession(session, idx).game
}

describe('mal du pays (expatriation)', () => {
  it('signer une orga étrangère rend expatrié', () => {
    const g = signAndGetGame('nordik') // Suède
    expect(g.organization).toBe('nordik')
    expect(g.flags['expatrie']).toBe(true)
  })

  it('signer une orga de son pays ne rend pas expatrié', () => {
    const g = signAndGetGame('hexagone') // France
    expect(g.organization).toBe('hexagone')
    expect(g.flags['expatrie']).toBe(false)
  })

  it('les événements de mal du pays exigent l’expatriation', () => {
    const homesick = events.find((e) => e.id === 'evt-mal-du-pays')
    if (!homesick) throw new Error('événement mal-du-pays introuvable')
    const base = startCareerFromCreation(events, loadStartingCriteria(), 1, creation).game
    expect(isEligible(base, homesick)).toBe(false)
    expect(isEligible({ ...base, flags: { expatrie: true } }, homesick)).toBe(true)
  })
})
