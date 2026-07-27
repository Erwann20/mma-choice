// Constantes de réglage du moteur (Story 1.2). Réglages fins ultérieurs.

export const START_AGE = 18
export const RETIREMENT_AGE = 38

/** Nombre d'Événements joués par année de carrière avant l'avancée d'âge. */
export const EVENTS_PER_YEAR = 3

export const STAT_MIN = 0
export const STAT_MAX = 100

/** Borne une stat/jauge dans [STAT_MIN, STAT_MAX] (AD-5). */
export function clampStat(value: number): number {
  if (value < STAT_MIN) return STAT_MIN
  if (value > STAT_MAX) return STAT_MAX
  return value
}

// --- Paliers du circuit (FR-5) ---
import type { Tier } from './state'

export const TIERS: readonly Tier[] = ['immaf', 'regional', 'major']

/** Index ordinal d'un palier (immaf=0 … major=2), pour comparaisons/conditions. */
export function tierIndex(tier: Tier): number {
  return TIERS.indexOf(tier)
}

// --- Calibrage des adversaires (FR-16) ---
// Niveau de base moyen d'un adversaire par palier ; la réputation le relève.
export const TIER_OPPONENT_BASE: Record<Tier, number> = {
  immaf: 28,
  regional: 48,
  major: 68,
}
/** Poids de la réputation courante dans le niveau adverse (0–100 → +0..30). */
export const OPPONENT_REP_FACTOR = 0.3
/** Amplitude de la variance aléatoire à graine sur le niveau adverse (±). */
export const OPPONENT_VARIANCE = 8

// --- Économie du combat (FR-11) : bourse indicative par palier (€). ---
export const PURSE_BY_TIER: Record<Tier, number> = {
  immaf: 0,
  regional: 2500,
  major: 20000,
}
