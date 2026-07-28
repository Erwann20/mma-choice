// Séquelles chroniques (FR-13) : blessures qui marquent DURABLEMENT l'athlète —
// contrairement à la forme (`health`) qui remonte, une séquelle reste tant
// qu'elle n'est pas soignée et pèse sur chaque match. PUR. Le CATALOGUE est
// commun (superset) ; chaque sport tire dans SON sous-ensemble (voir combat/
// basket, qui passent leur pool à `acquireSequela`).
import type { GameState } from './state'
import type { RngState } from './rng'
import { nextInt } from './rng'

/** Libellés de toutes les séquelles connues (MMA + basket). */
export const SEQUELA_LABEL: Record<string, string> = {
  sequelle_genou: 'Genou fragile',
  sequelle_arcade: 'Arcade fragile',
  sequelle_epaule: 'Épaule instable',
  sequelle_cheville: 'Cheville fragile',
  sequelle_dos: 'Dos fragile',
}

/** Toutes les clés de séquelle (tous sports confondus). */
export const SEQUELAE = Object.keys(SEQUELA_LABEL)

/** Séquelles chroniques actuellement actives (tous sports). */
export function activeSequelae(game: GameState): string[] {
  return SEQUELAE.filter((s) => game.flags[s] === true)
}

/** L'athlète traîne-t-il au moins une séquelle chronique ? */
export function hasChronicInjury(game: GameState): boolean {
  return SEQUELAE.some((s) => game.flags[s] === true)
}

/**
 * Tire éventuellement une NOUVELLE séquelle après une défaite violente (KO /
 * état critique), dans le `pool` de séquelles du sport. PUR : propage le RNG.
 */
export function acquireSequela(
  game: GameState,
  pool: string[],
  hard: boolean,
): { game: GameState; injury?: string } {
  const available = pool.filter((s) => game.flags[s] !== true)
  if (available.length === 0) return { game }
  const [roll, rng1] = nextInt(game.rng, 0, 99)
  let g: GameState = { ...game, rng: rng1 }
  // ~55 % de risque sur une défaite violente, ~35 % sinon.
  if (roll >= (hard ? 55 : 35)) return { game: g }
  const [pick, rng2] = nextInt(g.rng, 0, available.length - 1)
  const injury = available[pick]
  g = { ...g, rng: rng2, flags: { ...g.flags, [injury]: true } }
  return { game: g, injury }
}

/** Signature de type conservée pour compatibilité (clé de séquelle). */
export type Sequela = string
export type { RngState }
