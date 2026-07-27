// Progression de carrière (FR-5). Le palier ne monte plus automatiquement :
// le joueur passe pro et signe une organisation (voir store/session).
// `earnedTier` reste un helper PUR : « à quel palier tes résultats donnent droit »,
// utile pour signaler qu'une offre/un passage pro est mérité.
import type { GameState, Tier } from './state'
import { TIER_PROMOTION } from './config'

/** Palier le plus élevé auquel la réputation + les victoires donnent droit. */
export function earnedTier(state: GameState): Tier {
  const { reputation } = state.meta
  const { wins } = state.record
  if (reputation >= TIER_PROMOTION.major.reputation && wins >= TIER_PROMOTION.major.wins) {
    return 'major'
  }
  if (reputation >= TIER_PROMOTION.regional.reputation && wins >= TIER_PROMOTION.regional.wins) {
    return 'regional'
  }
  return 'immaf'
}
