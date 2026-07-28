import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { resolveFight } from './combat'
import { signatureTactic, MENTOR_FLAG } from './coaching'
import type { Opponent } from './combat'
import type { GameState } from './state'
import type { EventDef, Choice } from '../schema'

const FIGHT_EVENT: EventDef = {
  id: 'test-fight',
  weight: 1,
  repeatable: true,
  text: 'combat',
  fight: { titleFight: false },
  choices: [{ label: 'x', effects: [], tactic: 'striking' }],
  conditions: [],
}
const STRIKE: Choice = { label: 'x', effects: [], tactic: 'striking' }

function evenOpponent(): Opponent {
  return { name: 'X', archetypeId: 'a', label: 'Test', style: 'wrestler', level: 55, record: '5-5', weakTo: 'ground' }
}

describe('coach & coup signature (FR-15)', () => {
  it('aucune signature par défaut', () => {
    expect(signatureTactic(createInitialState(1))).toBeNull()
  })

  it('un mentor pose une tactique signature', () => {
    const base = createInitialState(1)
    const g: GameState = { ...base, flags: { ...base.flags, [MENTOR_FLAG.grappling]: true } }
    expect(signatureTactic(g)).toBe('grappling')
  })

  it('le coup signature ne dégrade jamais l’issue quand on l’emploie', () => {
    const base = createInitialState(9)
    const plain: GameState = { ...base }
    const signed: GameState = { ...base, flags: { ...base.flags, [MENTOR_FLAG.striking]: true } }
    const rank = { upset: 3, clean: 2, poor: 1, loss: 0 }
    // Sur la même graine et la même tactique (striking), la signature ajoute un
    // bonus de perf → issue au moins aussi bonne pour le combattant coaché.
    const rPlain = resolveFight(plain, FIGHT_EVENT, STRIKE, evenOpponent()).result
    const rSigned = resolveFight(signed, FIGHT_EVENT, STRIKE, evenOpponent()).result
    expect(rank[rSigned.outcome]).toBeGreaterThanOrEqual(rank[rPlain.outcome])
  })
})
