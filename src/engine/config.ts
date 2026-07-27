// Constantes de réglage du moteur (Story 1.2). Réglages fins ultérieurs.

export const START_AGE = 18
export const RETIREMENT_AGE = 38

// --- Structure d'une année de carrière (FR-8) ---
// Une année = un nombre garanti de COMBATS + des Événements narratifs, plus un
// éventuel créneau TOURNOI si un tournoi est débloqué. On garantit ainsi un
// volume de combats crédible (amateur ≥ 4, pro ≥ 3) au lieu d'un tirage pur.
/** Combats garantis par an en amateur. */
export const AMATEUR_FIGHTS_PER_YEAR = 4
/** Combats garantis par an en professionnel. */
export const PRO_FIGHTS_PER_YEAR = 3
/** Événements narratifs (non-combat) par an, en plus des combats. */
export const STORY_EVENTS_PER_YEAR = 3

/** Combats garantis pour l'année selon le statut (amateur / pro). */
export function fightsPerYear(pro: boolean): number {
  return pro ? PRO_FIGHTS_PER_YEAR : AMATEUR_FIGHTS_PER_YEAR
}

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

/** Seuils de promotion de palier (FR-5) : réputation ET victoires requises. */
export const TIER_PROMOTION: Record<Exclude<Tier, 'immaf'>, { reputation: number; wins: number }> = {
  regional: { reputation: 25, wins: 3 },
  major: { reputation: 55, wins: 8 },
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
