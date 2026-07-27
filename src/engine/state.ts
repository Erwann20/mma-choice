// GameState : l'unique objet canonique d'état (AD-2). 100 % JSON-sérialisable
// (aucune fonction/closure/classe) car persisté en localStorage (AD-7).
import { initRng, type RngState } from './rng'
import { START_AGE } from './config'

export type Sex = 'M' | 'F'
export type Style = 'striker' | 'wrestler' | 'grappler' | 'allrounder'
export type Phase = 'career' | 'retired'

export interface Fighter {
  name: string
  sex: Sex
  country: string
  age: number
}

export interface Stats {
  striking: number
  grappling: number
  ground: number
  cardio: number
}

export interface Meta {
  health: number
  mental: number
  reputation: number
  followers: number
  money: number
}

export interface GameState {
  saveVersion: number
  seed: number
  rng: RngState
  phase: Phase
  fighter: Fighter
  division: string
  style: Style
  stats: Stats
  meta: Meta
  flags: Record<string, number | boolean>
}

/** Données de création (l'écran réel arrive en Story 1.8). */
export interface FighterSetup {
  name?: string
  sex?: Sex
  country?: string
  division?: string
  style?: Style
  startAge?: number
}

/** Construit un GameState initial valide et déterministe pour une graine donnée. */
export function createInitialState(seed: number, setup: FighterSetup = {}): GameState {
  return {
    saveVersion: 1,
    seed,
    rng: initRng(seed),
    phase: 'career',
    fighter: {
      name: setup.name ?? 'Nouveau combattant',
      sex: setup.sex ?? 'M',
      country: setup.country ?? 'FR',
      age: setup.startAge ?? START_AGE,
    },
    division: setup.division ?? 'lightweight',
    style: setup.style ?? 'allrounder',
    stats: { striking: 40, grappling: 40, ground: 40, cardio: 50 },
    meta: { health: 100, mental: 60, reputation: 0, followers: 0, money: 0 },
    flags: {},
  }
}
