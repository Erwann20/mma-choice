// Score & note générale : dispatchers par sport (les formules vivent dans
// sports/<sport>.ts). PUR et déterministe (reproductible, NFR-5).
import type { GameState } from './state'
import { sportDef } from './sports/registry'

/**
 * Note générale (« OVR », 0-99) — capacité actuelle, façon FIFA. Déléguée au
 * sport courant (pondération propre à chaque discipline).
 */
export function fighterOverall(game: GameState): number {
  return sportDef(game.sport).overall(game)
}

/** Score de carrière /100 (FR-14) — délégué au sport courant. */
export function computeScore(game: GameState): number {
  return sportDef(game.sport).score(game)
}

/** Rang « de tous les temps » dérivé du score (flavor, sans classement en ligne). */
export function allTimeRank(score: number): number {
  return Math.max(1, Math.round((100 - score) * 4) + 1)
}
