import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { nemesisToOpponent, birthNemesis, recordNemesisResult } from './nemesis'
import type { Opponent } from './combat'
import type { GameState, Nemesis } from './state'

const OPP: Opponent = {
  name: 'Dmitri Volkov',
  archetypeId: 'a',
  label: 'Cogneur',
  style: 'striker',
  level: 60,
  record: '10-2',
  weakTo: 'ground',
}

describe('némésis (FR-16)', () => {
  it('naît d’un adversaire généré, face-à-face vierge', () => {
    const nem = birthNemesis(OPP)
    expect(nem.name).toBe('Dmitri Volkov')
    expect(nem.style).toBe('striker')
    expect(nem.playerWins).toBe(0)
    expect(nem.playerLosses).toBe(0)
    expect(nem.level).toBe(60)
  })

  it('conserve le nom mais se renforce à chaque duel', () => {
    const base = createInitialState(1)
    const nem: Nemesis = birthNemesis(OPP)
    let g: GameState = { ...base, nemesis: nem }
    g = recordNemesisResult(g, true)
    g = recordNemesisResult(g, false)
    expect(g.nemesis?.name).toBe('Dmitri Volkov')
    expect(g.nemesis?.playerWins).toBe(1)
    expect(g.nemesis?.playerLosses).toBe(1)
    expect(g.nemesis?.level).toBe(66) // +3 par duel
  })

  it('l’adversaire reflète le face-à-face une fois entamé', () => {
    const nem: Nemesis = { name: 'X', style: 'wrestler', playerWins: 2, playerLosses: 1, level: 70 }
    const opp = nemesisToOpponent(nem)
    expect(opp.name).toBe('X')
    expect(opp.label).toBe('Ta némésis')
    expect(opp.record).toMatch(/2-1/)
  })

  it('recordNemesisResult est neutre sans némésis', () => {
    const g = createInitialState(1)
    expect(recordNemesisResult(g, true).nemesis).toBeNull()
  })
})
