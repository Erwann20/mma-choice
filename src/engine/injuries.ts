// Séquelles chroniques (FR-13) : blessures qui marquent DURABLEMENT le
// combattant — contrairement à la forme (`health`) qui remonte, une séquelle
// reste tant qu'elle n'est pas soignée et pèse sur chaque combat. PUR.
import type { GameState } from './state'

/** Séquelles chroniques suivies (drapeaux booléens sur l'état). */
export const SEQUELAE = ['sequelle_genou', 'sequelle_arcade', 'sequelle_epaule'] as const
export type Sequela = (typeof SEQUELAE)[number]

/** Libellé lisible d'une séquelle (voix sobre). */
export const SEQUELA_LABEL: Record<Sequela, string> = {
  sequelle_genou: 'Genou fragile',
  sequelle_arcade: 'Arcade fragile',
  sequelle_epaule: 'Épaule instable',
}

/** Séquelles chroniques actuellement actives. */
export function activeSequelae(game: GameState): Sequela[] {
  return SEQUELAE.filter((s) => game.flags[s] === true)
}

/** Le combattant traîne-t-il au moins une séquelle chronique ? */
export function hasChronicInjury(game: GameState): boolean {
  return SEQUELAE.some((s) => game.flags[s] === true)
}
