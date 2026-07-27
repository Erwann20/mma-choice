// Score de carrière /100 (FR-14). PUR et déterministe (reproductible, NFR-5).
// Formule V1 sur les signaux disponibles ; ceintures/paliers/combats affinés
// aux Epics 2-3.
import type { GameState } from './state'
import { START_AGE, RETIREMENT_AGE, clampStat } from './config'

export function computeScore(game: GameState): number {
  const { stats, meta, fighter } = game
  const combat = (stats.striking + stats.grappling + stats.ground + stats.cardio) / 4
  const reputation = meta.reputation
  const followers = Math.min(100, Math.log10(meta.followers + 1) * 25)
  const span = RETIREMENT_AGE - START_AGE
  const longevity = clampStat(((fighter.age - START_AGE) / span) * 100)
  const health = meta.health

  const raw =
    combat * 0.35 + reputation * 0.3 + followers * 0.15 + longevity * 0.15 + health * 0.05
  return Math.round(clampStat(raw))
}

/** Rang « de tous les temps » dérivé du score (flavor, sans classement en ligne). */
export function allTimeRank(score: number): number {
  return Math.max(1, Math.round((100 - score) * 4) + 1)
}
