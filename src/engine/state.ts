// GameState : l'unique objet canonique d'état (AD-2). 100 % JSON-sérialisable
// (aucune fonction/closure/classe) car persisté en localStorage (AD-7).
import { initRng, type RngState } from './rng'
import { START_AGE } from './config'

export type Sex = 'M' | 'F'
export type Style = 'striker' | 'wrestler' | 'grappler' | 'allrounder'
export type Phase = 'career' | 'retired'
/** Palier du circuit MMA (FR-5) : amateur → régional → organisation majeure. */
export type Tier = 'immaf' | 'regional' | 'major'

/** Palmarès du combattant (FR-10/14). */
export interface FightRecord {
  wins: number
  losses: number
  /** Victoires marquantes (KO/soumission/upset), pour le prestige. */
  finishes: number
}

/** Drapeaux narratifs + internes moteur (« vu »/cooldown préfixés). */
export type Flags = Record<string, number | boolean>

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

/** Flag différé : devient actif quand le combattant atteint `atAge` (FR-9). */
export interface PendingFlag {
  flag: string
  value: number | boolean
  atAge: number
}

export interface GameState {
  saveVersion: number
  seed: number
  rng: RngState
  phase: Phase
  fighter: Fighter
  division: string
  style: Style
  tier: Tier
  /** Statut professionnel : false = amateur (IMMAF), true = signé en promotion. */
  pro: boolean
  /** Id de l'organisation signée (null tant qu'amateur / libre). */
  organization: string | null
  /** Détient-il la ceinture de sa division courante ? (FR-5) */
  belt: boolean
  /** Nombre de défenses de titre réussies (prestige). */
  titleDefenses: number
  stats: Stats
  meta: Meta
  record: FightRecord
  flags: Flags
  pending: PendingFlag[]
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

/** Nom par défaut : signale « aucun nom fourni » → généré aléatoirement (FR-1). */
export const DEFAULT_FIGHTER_NAME = 'Nouveau combattant'

/** Construit un GameState initial valide et déterministe pour une graine donnée. */
export function createInitialState(seed: number, setup: FighterSetup = {}): GameState {
  return {
    saveVersion: 1,
    seed,
    rng: initRng(seed),
    phase: 'career',
    fighter: {
      name: setup.name ?? DEFAULT_FIGHTER_NAME,
      sex: setup.sex ?? 'M',
      country: setup.country ?? 'FR',
      age: setup.startAge ?? START_AGE,
    },
    division: setup.division ?? 'lightweight',
    style: setup.style ?? 'allrounder',
    tier: 'immaf',
    pro: false,
    organization: null,
    belt: false,
    titleDefenses: 0,
    stats: { striking: 40, grappling: 40, ground: 40, cardio: 50 },
    meta: { health: 100, mental: 60, reputation: 0, followers: 0, money: 0 },
    record: { wins: 0, losses: 0, finishes: 0 },
    flags: {},
    pending: [],
  }
}
