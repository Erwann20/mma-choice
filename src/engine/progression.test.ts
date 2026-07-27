import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { earnedTier, promoteTier } from './progression'
import { reduce } from './reducer'
import { isEligible, evalCondition } from './events'
import type { GameState } from './state'
import type { EventDef } from '../schema'

function withRepWins(rep: number, wins: number): GameState {
  const g = createInitialState(1)
  return { ...g, meta: { ...g.meta, reputation: rep }, record: { ...g.record, wins } }
}

describe('progression de palier (FR-5)', () => {
  it('reste IMMAF sous les seuils', () => {
    expect(earnedTier(withRepWins(10, 1))).toBe('immaf')
  })

  it('passe régional avec réputation ET victoires suffisantes', () => {
    expect(earnedTier(withRepWins(25, 3))).toBe('regional')
    // réputation OK mais pas assez de victoires ⇒ pas encore
    expect(earnedTier(withRepWins(25, 2))).toBe('immaf')
  })

  it('passe organisation majeure aux seuils élevés', () => {
    expect(earnedTier(withRepWins(55, 8))).toBe('major')
  })

  it('ne rétrograde jamais', () => {
    const major: GameState = { ...withRepWins(10, 1), tier: 'major' }
    expect(promoteTier(major).tier).toBe('major')
  })

  it("la promotion s'applique au bilan annuel (ADVANCE_YEAR)", () => {
    const g = withRepWins(30, 4)
    expect(g.tier).toBe('immaf')
    expect(reduce(g, { type: 'ADVANCE_YEAR' }).tier).toBe('regional')
  })
})

describe('conditions dérivées (tier/wins/style)', () => {
  const regionalFight: EventDef = {
    id: 'f',
    weight: 1,
    repeatable: true,
    text: 'x',
    fight: { titleFight: false },
    choices: [{ label: 'a', effects: [], tactic: 'striking' }],
    conditions: [{ kind: 'stat', on: 'tier', cmp: 'gte', value: 1 }],
  }

  it('un événement gaté sur tier>=1 est bloqué en IMMAF, débloqué en régional', () => {
    const immaf = createInitialState(1)
    expect(isEligible(immaf, regionalFight)).toBe(false)
    expect(isEligible({ ...immaf, tier: 'regional' }, regionalFight)).toBe(true)
  })

  it('condition style', () => {
    const g = createInitialState(1)
    expect(evalCondition({ ...g, style: 'striker' }, { kind: 'style', eq: 'striker' })).toBe(true)
    expect(evalCondition({ ...g, style: 'wrestler' }, { kind: 'style', eq: 'striker' })).toBe(false)
  })
})
