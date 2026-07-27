// Constantes de réglage du moteur (Story 1.2). Réglages fins ultérieurs.

export const START_AGE = 18
export const RETIREMENT_AGE = 38

export const STAT_MIN = 0
export const STAT_MAX = 100

/** Borne une stat/jauge dans [STAT_MIN, STAT_MAX] (AD-5). */
export function clampStat(value: number): number {
  if (value < STAT_MIN) return STAT_MIN
  if (value > STAT_MAX) return STAT_MAX
  return value
}
