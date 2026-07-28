// Coach & coup signature (FR-15) : signer avec un mentor spécialiste débloque
// une tactique « signature » qui donne un bonus DURABLE dès qu'on l'emploie en
// combat. PUR. Une seule signature à la fois (le premier mentor signé prime).
import type { GameState } from './state'

/** Tactiques enseignables par un mentor (sous-ensemble des canaux de combat). */
export type SignatureTactic = 'striking' | 'grappling' | 'ground'

/** Drapeau de mentor associé à chaque tactique signature. */
export const MENTOR_FLAG: Record<SignatureTactic, string> = {
  striking: 'mentor_striking',
  grappling: 'mentor_grappling',
  ground: 'mentor_ground',
}

/** Libellé lisible du coup signature. */
export const SIGNATURE_LABEL: Record<SignatureTactic, string> = {
  striking: 'Frappe signature',
  grappling: 'Lutte signature',
  ground: 'Soumission signature',
}

/** Bonus de performance apporté par le coup signature quand il est employé. */
export const SIGNATURE_BONUS = 8

/** Tactique signature débloquée par un coach (ou null si aucun mentor signé). */
export function signatureTactic(game: GameState): SignatureTactic | null {
  const tactics: SignatureTactic[] = ['striking', 'grappling', 'ground']
  return tactics.find((t) => game.flags[MENTOR_FLAG[t]] === true) ?? null
}
