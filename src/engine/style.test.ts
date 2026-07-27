import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { applyChoice, resolveFight } from '../engine'
import type { Opponent } from './combat'
import type { Choice, EventDef } from '../schema'

const trainingEvent: EventDef = {
  id: 'train',
  weight: 1,
  repeatable: true,
  cooldown: 4,
  text: 'Camp',
  choices: [],
  conditions: [],
}

describe('évolution du style (FR-15)', () => {
  it('un choix setStyle réoriente le combattant', () => {
    const g = createInitialState(1) // allrounder par défaut
    const choice: Choice = { label: 'x', effects: [], setStyle: 'wrestler' }
    const next = applyChoice(g, trainingEvent, choice)
    expect(next.style).toBe('wrestler')
  })

  it('le style influe sur la résolution (bonus tactique adapté)', () => {
    const base = createInitialState(2)
    const fight: EventDef = {
      id: 'f',
      weight: 1,
      repeatable: true,
      text: 'combat',
      fight: { titleFight: false },
      choices: [],
      conditions: [],
    }
    const striking: Choice = { label: 'x', effects: [], tactic: 'striking' }
    const opp: Opponent = {
      name: 'A B',
      archetypeId: 'sniper',
      label: 'Tireur',
      style: 'striker',
      level: 45,
      record: '5-5',
      weakTo: 'ground', // pas de bonus faiblesse pour la frappe
    }
    const striker = { ...base, style: 'striker' as const }
    const grappler = { ...base, style: 'grappler' as const }
    // Même stats, mais le puncheur bénéficie du bonus de style sur la frappe.
    const rStriker = resolveFight(striker, fight, striking, opp).game.meta.reputation
    const rGrappler = resolveFight(grappler, fight, striking, opp).game.meta.reputation
    expect(rStriker).toBeGreaterThanOrEqual(rGrappler)
  })
})
