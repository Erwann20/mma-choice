// Combat (FR-10/16) : génération d'adversaire calibrée + résolution graduée.
// PUR et déterministe (AD-3) : reçoit le pool d'adversaires en paramètre et
// ne tire l'aléatoire que via le RNG à graine ; ne mute jamais l'état reçu.
import type { Archetype, Channel, OpponentPool } from '../schema'
import type { GameState, Style } from './state'
import type { RngState } from './rng'
import { nextInt } from './rng'
import {
  clampStat,
  TIER_OPPONENT_BASE,
  OPPONENT_REP_FACTOR,
  OPPONENT_VARIANCE,
} from './config'

/** Instance d'adversaire générée à partir d'un archétype authoré (AD-4). */
export interface Opponent {
  name: string
  archetypeId: string
  label: string
  style: Style
  /** Niveau global calibré sur palier/division/réputation (0–100). */
  level: number
  /** Palmarès « flavor » (ex. « 12-3 »). */
  record: string
  /** Tactique du joueur qui exploite la faiblesse de l'archétype. */
  weakTo: Channel
}

/**
 * Génère un adversaire déterministe (FR-16), calibré sur le palier, la division
 * et la réputation courants : la force moyenne monte avec le palier et la répu.
 * Renvoie [adversaire, RngState suivant] — l'appelant propage l'état RNG.
 */
export function generateOpponent(
  state: GameState,
  pool: OpponentPool,
  rng: RngState,
): [Opponent, RngState] {
  const [aIdx, r1] = nextInt(rng, 0, pool.archetypes.length - 1)
  const arche: Archetype = pool.archetypes[aIdx]

  const firsts = pool.firstNames[state.fighter.sex]
  const [fIdx, r2] = nextInt(r1, 0, firsts.length - 1)
  const [lIdx, r3] = nextInt(r2, 0, pool.lastNames.length - 1)
  const name = `${firsts[fIdx]} ${pool.lastNames[lIdx]}`

  const base =
    TIER_OPPONENT_BASE[state.tier] + arche.power + state.meta.reputation * OPPONENT_REP_FACTOR
  const [variance, r4] = nextInt(r3, -OPPONENT_VARIANCE, OPPONENT_VARIANCE)
  const level = clampStat(Math.round(base + variance))

  // Palmarès « flavor » cohérent avec le niveau (plus fort ⇒ plus de victoires).
  const [wins, r5] = nextInt(r4, Math.floor(level / 10), Math.floor(level / 4) + 3)
  const [losses, r6] = nextInt(r5, 0, Math.max(1, Math.floor((100 - level) / 15)))

  const opponent: Opponent = {
    name,
    archetypeId: arche.id,
    label: arche.label,
    style: arche.style,
    level,
    record: `${wins}-${losses}`,
    weakTo: arche.weakTo,
  }
  return [opponent, r6]
}
