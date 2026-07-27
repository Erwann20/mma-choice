// Progression de carrière (FR-5) : promotion de palier selon réputation + victoires.
// PUR : promotion monotone (on ne rétrograde jamais).
import type { GameState, Tier } from './state'
import { TIER_PROMOTION, tierIndex } from './config'

/** Palier mérité par l'état courant (le plus haut atteint, jamais en dessous). */
export function earnedTier(state: GameState): Tier {
  const { reputation } = state.meta
  const { wins } = state.record
  let tier: Tier = 'immaf'
  if (reputation >= TIER_PROMOTION.regional.reputation && wins >= TIER_PROMOTION.regional.wins) {
    tier = 'regional'
  }
  if (reputation >= TIER_PROMOTION.major.reputation && wins >= TIER_PROMOTION.major.wins) {
    tier = 'major'
  }
  // Jamais de rétrogradation : on garde le palier le plus élevé atteint.
  return tierIndex(tier) > tierIndex(state.tier) ? tier : state.tier
}

/** Applique la promotion de palier si elle est méritée (renvoie un nouvel état). */
export function promoteTier(state: GameState): GameState {
  const tier = earnedTier(state)
  return tier === state.tier ? state : { ...state, tier }
}
