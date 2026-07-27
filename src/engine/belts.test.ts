import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { resolveFight, type Opponent } from './combat'
import { computeScore } from './score'
import type { GameState } from './state'
import type { Choice, EventDef } from '../schema'

const titleEvent: EventDef = {
  id: 'title',
  weight: 1,
  repeatable: true,
  cooldown: 2,
  text: 'Titre',
  fight: { titleFight: true },
  choices: [],
  conditions: [],
}
const striking: Choice = { label: 'x', effects: [], tactic: 'striking' }

function opp(level: number): Opponent {
  return { name: 'A B', archetypeId: 'brawler', label: 'Cogneur', style: 'striker', level, record: '9-1', weakTo: 'grappling' }
}

// Champion fort pour garantir les victoires de titre.
function champContender(): GameState {
  const g = createInitialState(5)
  return {
    ...g,
    tier: 'major',
    stats: { striking: 95, grappling: 80, ground: 80, cardio: 90 },
    meta: { ...g.meta, mental: 90, reputation: 70 },
    record: { wins: 12, losses: 1, finishes: 6 },
  }
}

describe('ceintures de division (FR-5)', () => {
  it('gagner un combat de titre sans ceinture ⇒ conquête du titre', () => {
    const { game, result } = resolveFight(champContender(), titleEvent, striking, opp(20))
    expect(result.win).toBe(true)
    expect(result.wonBelt).toBe(true)
    expect(game.belt).toBe(true)
  })

  it('gagner en étant déjà champion ⇒ défense (titleDefenses+1, pas de nouvelle conquête)', () => {
    const champ: GameState = { ...champContender(), belt: true }
    const { game, result } = resolveFight(champ, titleEvent, striking, opp(20))
    expect(result.wonBelt).toBe(false)
    expect(game.titleDefenses).toBe(1)
    expect(game.belt).toBe(true)
  })

  it('perdre un combat de titre en étant champion ⇒ perte de la ceinture', () => {
    const champ: GameState = { ...champContender(), belt: true }
    const { game, result } = resolveFight(champ, titleEvent, striking, opp(130))
    expect(result.win).toBe(false)
    expect(result.lostBelt).toBe(true)
    expect(game.belt).toBe(false)
  })

  it('la ceinture améliore le score de carrière', () => {
    const base = champContender()
    const withBelt: GameState = { ...base, belt: true, titleDefenses: 2 }
    expect(computeScore(withBelt)).toBeGreaterThan(computeScore(base))
  })
})
