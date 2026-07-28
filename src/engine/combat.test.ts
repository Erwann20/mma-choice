import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { generateOpponent, resolveFight } from './combat'
import { initRng } from './rng'
import { loadOpponentPool } from '../schema'
import { OPPONENT_LEVEL_GAP } from './config'
import type { GameState } from './state'
import type { EventDef, Choice } from '../schema'

const pool = loadOpponentPool()

function avgLevel(base: GameState, seeds: number): number {
  let total = 0
  for (let s = 1; s <= seeds; s++) {
    const [opp] = generateOpponent(base, pool, initRng(s * 1000))
    total += opp.level
  }
  return total / seeds
}

describe('generateOpponent (FR-16)', () => {
  it('est déterministe : même état + même graine ⇒ même adversaire', () => {
    const g = createInitialState(42)
    const [a] = generateOpponent(g, pool, initRng(7))
    const [b] = generateOpponent(g, pool, initRng(7))
    expect(a).toEqual(b)
  })

  it('produit un adversaire cohérent (niveau borné, archétype connu)', () => {
    const g = createInitialState(1)
    const [opp] = generateOpponent(g, pool, initRng(123))
    expect(opp.level).toBeGreaterThanOrEqual(0)
    expect(opp.level).toBeLessThanOrEqual(100)
    expect(pool.archetypes.some((a) => a.id === opp.archetypeId)).toBe(true)
    expect(opp.name).toMatch(/\S \S/)
  })

  it('la force moyenne monte avec le palier', () => {
    const immaf = createInitialState(1)
    const major: GameState = { ...immaf, tier: 'major' }
    expect(avgLevel(major, 40)).toBeGreaterThan(avgLevel(immaf, 40))
  })

  it('la force moyenne monte avec la réputation', () => {
    const low = createInitialState(1)
    const high: GameState = { ...low, meta: { ...low.meta, reputation: 90 } }
    expect(avgLevel(high, 40)).toBeGreaterThan(avgLevel(low, 40))
  })

  it('reste JOUABLE : l’adversaire ne dépasse jamais le niveau du joueur de plus que l’écart borné', () => {
    // Cas problématique remonté : joueur ~72, réputation au max. L'adversaire
    // doit rester dans [overall±GAP], jamais du 95+ face à un combattant 72.
    const base = createInitialState(1)
    const g: GameState = {
      ...base,
      tier: 'major',
      stats: { striking: 74, grappling: 72, ground: 70, cardio: 72 },
      meta: { ...base.meta, reputation: 100 },
    }
    const overall = (74 + 72 + 70 + 72) / 4
    for (let s = 1; s <= 60; s++) {
      const [opp] = generateOpponent(g, pool, initRng(s * 13))
      expect(opp.level).toBeLessThanOrEqual(overall + OPPONENT_LEVEL_GAP)
      expect(opp.level).toBeGreaterThanOrEqual(overall - OPPONENT_LEVEL_GAP)
    }
  })
})

const FIGHT: EventDef = {
  id: 'f',
  weight: 1,
  repeatable: true,
  text: 'combat',
  fight: { titleFight: false },
  choices: [{ label: 'x', effects: [], tactic: 'striking' }],
  conditions: [],
}
const STRIKE: Choice = { label: 'x', effects: [], tactic: 'striking' }

function crusher() {
  return { name: 'X', archetypeId: 'a', label: 'T', style: 'striker' as const, level: 100, record: '9-0', weakTo: 'ground' as const }
}
function weakling() {
  return { name: 'Y', archetypeId: 'a', label: 'T', style: 'striker' as const, level: 0, record: '0-9', weakTo: 'striking' as const }
}

describe('forme récente (gate des combats de titre)', () => {
  it('marque serie_negative après deux défaites d’affilée, la lève sur une victoire', () => {
    let g = createInitialState(5)
    g = resolveFight(g, FIGHT, STRIKE, crusher()).game
    expect(g.flags['serie_negative']).toBe(false) // 1 défaite
    g = resolveFight(g, FIGHT, STRIKE, crusher()).game
    expect(g.flags['serie_negative']).toBe(true) // 2 défaites d'affilée
    g = resolveFight(g, FIGHT, STRIKE, weakling()).game
    expect(g.flags['serie_negative']).toBe(false) // une victoire remet à zéro
  })
})
