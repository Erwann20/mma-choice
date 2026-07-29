// GameState : l'unique objet canonique d'état (AD-2). 100 % JSON-sérialisable
// (aucune fonction/closure/classe) car persisté en localStorage (AD-7).
import { initRng, type RngState } from './rng'
import { START_AGE } from './config'
import type { SportId } from './sports/types'
import { sportDef } from './sports/registry'

export type Sex = 'M' | 'F'
/** Style/profil du sportif : valeurs définies par le sport (chaîne libre). */
export type Style = string
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
  /** Ville du club choisi en carrière (null tant qu'aucun club posé). */
  city: string | null
}

/** Attributs sportifs, indexés par clé (les clés dépendent du sport, FR-1). */
export type Stats = Record<string, number>

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

/** Rival récurrent (FR-16) : un adversaire nommé recroisé au fil de la carrière,
 *  avec un palmarès de face-à-face qui construit l'attachement narratif. */
export interface Nemesis {
  name: string
  style: Style
  /** Face-à-face du POINT DE VUE du joueur. */
  playerWins: number
  playerLosses: number
  /** Niveau de la némésis : grimpe à chaque retrouvaille (elle progresse aussi). */
  level: number
}

export interface GameState {
  saveVersion: number
  /** Sport de la carrière (MMA par défaut ; le cœur en dérive attributs/règles). */
  sport: SportId
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
  /** Rival récurrent, né en cours de carrière (null tant qu'aucune rivalité). */
  nemesis: Nemesis | null
}

/** Données de création (l'écran réel arrive en Story 1.8). */
export interface FighterSetup {
  name?: string
  sex?: Sex
  country?: string
  division?: string
  style?: Style
  startAge?: number
  /** Sport de la carrière (MMA par défaut). */
  sport?: SportId
}

/** Nom par défaut : signale « aucun nom fourni » → généré aléatoirement (FR-1). */
export const DEFAULT_FIGHTER_NAME = 'Nouveau combattant'

/** Construit un GameState initial valide et déterministe pour une graine donnée. */
export function createInitialState(seed: number, setup: FighterSetup = {}): GameState {
  const sport = setup.sport ?? 'mma'
  return {
    saveVersion: 1,
    sport,
    seed,
    rng: initRng(seed),
    phase: 'career',
    fighter: {
      name: setup.name ?? DEFAULT_FIGHTER_NAME,
      sex: setup.sex ?? 'M',
      country: setup.country ?? 'France',
      age: setup.startAge ?? START_AGE,
      city: null,
    },
    division: setup.division ?? sportDef(sport).defaultDivision,
    style: setup.style ?? sportDef(sport).defaultStyle,
    tier: 'immaf',
    pro: false,
    organization: null,
    belt: false,
    titleDefenses: 0,
    stats: { ...sportDef(sport).initialStats },
    meta: { health: 100, mental: 60, reputation: 0, followers: 0, money: 0 },
    record: { wins: 0, losses: 0, finishes: 0 },
    flags: {},
    pending: [],
    nemesis: null,
  }
}
