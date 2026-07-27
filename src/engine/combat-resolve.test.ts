import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { resolveFight, type Opponent } from './combat'
import type { GameState } from './state'
import type { Choice, EventDef } from '../schema'

const fightEvent: EventDef = {
  id: 'fight-test',
  weight: 1,
  repeatable: true,
  cooldown: 1,
  text: 'Combat',
  fight: { titleFight: false },
  choices: [],
  conditions: [],
}

const striking: Choice = { label: 'Boxer', effects: [], tactic: 'striking' }

function opp(level: number): Opponent {
  return {
    name: 'Test Adv',
    archetypeId: 'brawler',
    label: 'Cogneur',
    style: 'striker',
    level,
    record: '5-2',
    weakTo: 'grappling',
  }
}

describe('resolveFight (FR-10)', () => {
  it('est déterministe (même état/choix/adversaire ⇒ même résultat)', () => {
    const g = createInitialState(3)
    const a = resolveFight(g, fightEvent, striking, opp(40))
    const b = resolveFight(g, fightEvent, striking, opp(40))
    expect(a.result).toEqual(b.result)
    expect(a.game).toEqual(b.game)
  })

  it('adversaire nettement plus faible ⇒ victoire (record.wins+1)', () => {
    const g = createInitialState(3)
    const { game, result } = resolveFight(g, fightEvent, striking, opp(5))
    expect(result.win).toBe(true)
    expect(game.record.wins).toBe(1)
    expect(game.record.losses).toBe(0)
  })

  it('adversaire nettement plus fort ⇒ défaite (record.losses+1, forme entamée)', () => {
    const g = createInitialState(3)
    const { game, result } = resolveFight(g, fightEvent, striking, opp(100))
    expect(result.win).toBe(false)
    expect(result.outcome).toBe('loss')
    expect(game.record.losses).toBe(1)
    expect(game.meta.health).toBeLessThan(g.meta.health)
  })

  it('battre un favori fort (bon choix) ⇒ upset', () => {
    // Joueur boosté sur sa tactique pour l'emporter malgré un adversaire favori.
    const base = createInitialState(3)
    const strong: GameState = {
      ...base,
      stats: { striking: 95, grappling: 40, ground: 40, cardio: 90 },
      meta: { ...base.meta, mental: 90 },
    }
    // Adversaire nettement au-dessus du niveau global du joueur (favori) mais battable.
    const { result } = resolveFight(strong, fightEvent, striking, opp(80))
    expect(result.win).toBe(true)
    expect(result.outcome).toBe('upset')
  })

  it('produit des deltas déclarés (réputation + forme au minimum)', () => {
    const g = createInitialState(3)
    const { result } = resolveFight(g, fightEvent, striking, opp(30))
    const targets = result.changes.map((c) => c.target)
    expect(targets).toContain('health')
    expect(targets).toContain('reputation')
  })
})
