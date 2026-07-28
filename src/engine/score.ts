// Score de carrière /100 (FR-14). PUR et déterministe (reproductible, NFR-5).
// Combine bilan sportif (palmarès, ceinture, palier), notoriété et longévité.
import type { GameState } from './state'
import { START_AGE, RETIREMENT_AGE, clampStat, tierIndex } from './config'

/**
 * Note générale du combattant (« OVR », 0-99) — capacité de combat actuelle,
 * façon FIFA. Pondère les attributs offensifs, le sol, le cardio et le mental.
 * PUR : ne dépend que des stats/meta (indépendant du palmarès).
 */
export function fighterOverall(game: GameState): number {
  const { stats, meta } = game
  const rating =
    stats.striking * 0.3 +
    stats.grappling * 0.28 +
    stats.ground * 0.22 +
    stats.cardio * 0.12 +
    meta.mental * 0.08
  return Math.round(clampStat(rating))
}

export function computeScore(game: GameState): number {
  const { stats, meta, fighter, record } = game

  // Niveau technique moyen.
  const combat = (stats.striking + stats.grappling + stats.ground + stats.cardio) / 4

  // Bilan sportif : taux de victoire pondéré par le volume + finitions.
  const fights = record.wins + record.losses
  const winRate = fights > 0 ? record.wins / fights : 0
  const volume = Math.min(1, fights / 20) // 20 combats ⇒ carrière pleine
  const results = clampStat((winRate * 60 + volume * 25 + Math.min(15, record.finishes * 3)))

  // Notoriété.
  const reputation = meta.reputation
  const followers = Math.min(100, Math.log10(meta.followers + 1) * 25)

  // Palier atteint + prestige de la ceinture.
  const tierBonus = tierIndex(game.tier) * 8 // 0 / 8 / 16
  const beltBonus = (game.belt ? 20 : 0) + Math.min(15, game.titleDefenses * 5)
  const prestige = clampStat(tierBonus + beltBonus)

  const span = RETIREMENT_AGE - START_AGE
  const longevity = clampStat(((fighter.age - START_AGE) / span) * 100)

  const raw =
    combat * 0.24 +
    results * 0.24 +
    reputation * 0.2 +
    prestige * 0.14 +
    followers * 0.1 +
    longevity * 0.08
  return Math.round(clampStat(raw))
}

/** Rang « de tous les temps » dérivé du score (flavor, sans classement en ligne). */
export function allTimeRank(score: number): number {
  return Math.max(1, Math.round((100 - score) * 4) + 1)
}
