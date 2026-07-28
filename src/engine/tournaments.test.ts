import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { resolveFight, type Opponent } from './combat'
import { isEligible } from './events'
import { loadEvents } from '../schema'
import type { GameState } from './state'
import type { Choice, EventDef } from '../schema'

const tournoi: EventDef = {
  id: 'fight-tournoi-test',
  weight: 1,
  repeatable: true,
  cooldown: 1,
  text: 'Tournoi',
  fight: { titleFight: false, winFlag: 'titre_national' },
  choices: [],
  conditions: [],
}
const striking: Choice = { label: 'x', effects: [], tactic: 'striking' }
const weak = (): Opponent => ({ name: 'A B', archetypeId: 'brawler', label: 'Cogneur', style: 'striker', level: 5, record: '1-1', weakTo: 'grappling' })

function strong(): GameState {
  const g = createInitialState(3)
  return { ...g, stats: { striking: 90, grappling: 70, ground: 70, cardio: 85 }, meta: { ...g.meta, mental: 85 } }
}

describe('tournois amateurs (titres)', () => {
  it('gagner un tournoi pose le drapeau de titre', () => {
    const { game, result } = resolveFight(strong(), tournoi, striking, weak())
    expect(result.win).toBe(true)
    expect(game.flags['titre_national']).toBe(true)
  })

  it('la ladder amateur est progressive (Europe exige le titre national)', () => {
    const events = loadEvents()
    const europe = events.find((e) => e.id === 'fight-tournoi-europe')!
    const g = { ...createInitialState(1) }
    expect(isEligible(g, europe)).toBe(false) // pas encore champion national
    expect(isEligible({ ...g, flags: { titre_national: true } }, europe)).toBe(true)
  })
})
