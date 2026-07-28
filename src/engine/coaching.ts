// Coach & coup signature (FR-15) : signer un mentor spécialiste débloque une
// tactique « signature » qui donne un bonus DURABLE dès qu'on l'emploie. PUR.
// Générique : la signature est portée par un drapeau `mentor_<tactique>` (le
// contenu de chaque sport pose la sienne). Une seule signature à la fois.
import type { GameState } from './state'

/** Drapeau de mentor pour une tactique donnée (ex. `mentor_tir`). */
export function mentorFlag(tactic: string): string {
  return `mentor_${tactic}`
}

/** Drapeaux de mentor MMA (compat : utilisé par les tests). */
export const MENTOR_FLAG: Record<string, string> = {
  striking: 'mentor_striking',
  grappling: 'mentor_grappling',
  ground: 'mentor_ground',
  tir: 'mentor_tir',
  dribble: 'mentor_dribble',
  passe: 'mentor_passe',
  defense: 'mentor_defense',
}

/** Libellé lisible du coup signature, par tactique (tous sports). */
export const SIGNATURE_LABEL: Record<string, string> = {
  striking: 'Frappe signature',
  grappling: 'Lutte signature',
  ground: 'Soumission signature',
  tir: 'Tir signature',
  dribble: 'Dribble signature',
  passe: 'Passe signature',
  defense: 'Défense signature',
}

/** Bonus de performance apporté par le coup signature quand il est employé. */
export const SIGNATURE_BONUS = 8

/** Tactique signature débloquée par un coach (ou null si aucun mentor signé). */
export function signatureTactic(game: GameState): string | null {
  for (const flag of Object.keys(game.flags)) {
    if (flag.startsWith('mentor_') && game.flags[flag] === true) {
      return flag.slice('mentor_'.length)
    }
  }
  return null
}
