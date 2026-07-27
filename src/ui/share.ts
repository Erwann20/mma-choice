// Partage du score de fin de carrière (FR-14, UX-DR15). 100 % côté client (AD-9) :
// Web Share API si disponible, sinon repli sur le presse-papiers.
import type { GameState } from '../engine'
import { computeScore, allTimeRank } from '../engine'

export type ShareOutcome = 'shared' | 'copied' | 'failed'

/** Construit la carte de score partageable (texte sobre, 2ᵉ personne). */
export function buildShareText(game: GameState): string {
  const score = computeScore(game)
  const rank = allTimeRank(score)
  const belt = game.belt ? ' 🏆 Champion.' : ''
  return `MMA Choice — ${game.fighter.name} : ${score}/100 (${rank}ᵉ de tous les temps). Palmarès ${game.record.wins}-${game.record.losses}.${belt} Bats mon score !`
}

/**
 * Tente de partager, avec repli presse-papiers. Ne lève jamais : renvoie l'issue.
 */
export async function shareScore(game: GameState): Promise<ShareOutcome> {
  const text = buildShareText(game)
  const nav = typeof navigator !== 'undefined' ? navigator : undefined

  if (nav && typeof nav.share === 'function') {
    try {
      await nav.share({ title: 'MMA Choice', text })
      return 'shared'
    } catch {
      // partage annulé ou indisponible ⇒ on tente le presse-papiers
    }
  }
  if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
    try {
      await nav.clipboard.writeText(text)
      return 'copied'
    } catch {
      return 'failed'
    }
  }
  return 'failed'
}
