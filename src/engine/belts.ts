// Ceintures d'organisation (FR-5) : on mémorise CHAQUE titre conquis, par
// promotion, via des drapeaux `belt_org_<id>` (+ `belt_ever`). Ainsi un titre
// gagné à l'Hexagone reste au palmarès même après l'avoir perdu ou changé d'orga.
import type { GameState } from './state'

/** Préfixe de drapeau d'une ceinture conquise dans une organisation donnée. */
export const BELT_ORG_PREFIX = 'belt_org_'
/** Drapeau posé dès qu'une ceinture (n'importe laquelle) a été remportée. */
export const BELT_EVER_FLAG = 'belt_ever'

/** Clé de drapeau d'une ceinture pour une organisation (id) donnée. */
export function beltFlagFor(orgId: string): string {
  return BELT_ORG_PREFIX + orgId
}

/** Le combattant a-t-il déjà été champion (ceinture conquise à un moment) ? */
export function wasChampion(game: GameState): boolean {
  return game.flags[BELT_EVER_FLAG] === true
}

/** Ids des organisations où une ceinture a été remportée (ordre stable). */
export function beltOrgsWon(game: GameState): string[] {
  return Object.keys(game.flags)
    .filter((k) => k.startsWith(BELT_ORG_PREFIX) && game.flags[k] === true)
    .map((k) => k.slice(BELT_ORG_PREFIX.length))
    .sort()
}
