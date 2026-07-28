import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { resolveFight } from './combat'
import { activeSequelae, hasChronicInjury, SEQUELAE } from './injuries'
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

/** Adversaire écrasant → défaite garantie du joueur. */
function crusher(): Opponent {
  return {
    name: 'Le Bourreau',
    archetypeId: 'a',
    label: 'Cogneur',
    style: 'striker',
    level: 100,
    record: '20-0',
    weakTo: 'ground',
  }
}

describe('séquelles chroniques (FR-13)', () => {
  it('helpers : aucune séquelle sur un état neuf', () => {
    const g = createInitialState(1)
    expect(activeSequelae(g)).toEqual([])
    expect(hasChronicInjury(g)).toBe(false)
  })

  it('une défaite violente en état critique finit par poser une séquelle', () => {
    // Forme au plancher → défaite KO/critique très probable ; on balaie des
    // graines jusqu'à observer l'acquisition (déterministe par graine).
    let acquired = false
    for (let seed = 1; seed <= 40 && !acquired; seed++) {
      const base = createInitialState(seed)
      const g: GameState = { ...base, meta: { ...base.meta, health: 10 } }
      const { game, result } = resolveFight(g, FIGHT_EVENT, STRIKE, crusher())
      if (!result.win && result.newInjury) {
        acquired = true
        expect(SEQUELAE).toContain(result.newInjury)
        expect(game.flags[result.newInjury]).toBe(true)
        expect(hasChronicInjury(game)).toBe(true)
      }
    }
    expect(acquired).toBe(true)
  })

  it('une séquelle pèse sur la performance (issue au moins aussi mauvaise)', () => {
    const base = createInitialState(7)
    const healthy: GameState = { ...base }
    const injured: GameState = { ...base, flags: { ...base.flags, sequelle_genou: true, sequelle_epaule: true } }
    const opp: Opponent = { ...crusher(), level: 55 }
    const rHealthy = resolveFight(healthy, FIGHT_EVENT, STRIKE, opp).result
    const rInjured = resolveFight(injured, FIGHT_EVENT, STRIKE, opp).result
    // La fragilité ne peut qu'abaisser la marge : le blessé ne fait jamais mieux.
    const rank = { upset: 3, clean: 2, poor: 1, loss: 0 }
    expect(rank[rInjured.outcome]).toBeLessThanOrEqual(rank[rHealthy.outcome])
  })

  it('ne cumule jamais plus que les séquelles existantes', () => {
    const base = createInitialState(3)
    const allInjured: GameState = {
      ...base,
      meta: { ...base.meta, health: 5 },
      flags: Object.fromEntries(SEQUELAE.map((s) => [s, true])),
    }
    const { result } = resolveFight(allInjured, FIGHT_EVENT, STRIKE, crusher())
    expect(result.newInjury).toBeUndefined()
  })
})
