// Récompenses de fin de carrière (FR-14) : titre de carrière (générique) +
// trophées (délégués au sport). PUR et déterministe : dérivé de l'état final.
import type { GameState } from './state'
import { sportDef } from './sports/registry'

export type TitleTone = 'goat' | 'legend' | 'star' | 'solid' | 'plain'
export type { Achievement } from './sports/types'
export { nationOf } from './nation'

/** Titre de carrière dérivé du Score /100 (de « passage discret » à GOAT). */
export function careerTitle(score: number): { label: string; icon: string; tone: TitleTone } {
  if (score >= 90) return { label: 'GOAT — le plus grand de tous les temps', icon: '🐐', tone: 'goat' }
  if (score >= 75) return { label: 'Légende du sport', icon: '👑', tone: 'legend' }
  if (score >= 60) return { label: 'Star confirmée', icon: '⭐', tone: 'star' }
  if (score >= 45) return { label: 'Combattant solide', icon: '🥊', tone: 'solid' }
  if (score >= 28) return { label: 'Combattant honnête', icon: '🧤', tone: 'plain' }
  return { label: 'Un passage discret', icon: '🌫️', tone: 'plain' }
}

/** Trophées débloqués par la carrière — délégués au sport courant (FR-14). */
export function careerAchievements(game: GameState): ReturnType<ReturnType<typeof sportDef>['achievements']> {
  return sportDef(game.sport).achievements(game)
}
