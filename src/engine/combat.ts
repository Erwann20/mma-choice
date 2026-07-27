// Combat (FR-10/16) : génération d'adversaire calibrée + résolution graduée.
// PUR et déterministe (AD-3) : reçoit le pool d'adversaires en paramètre et
// ne tire l'aléatoire que via le RNG à graine ; ne mute jamais l'état reçu.
import type { Archetype, Channel, EventDef, Choice, OpponentPool } from '../schema'
import type { GameState, Style } from './state'
import type { RngState } from './rng'
import { nextInt } from './rng'
import { readChannel } from './channels'
import { applyEffect } from './effects'
import { markEventConsumed } from './events'
import {
  clampStat,
  tierIndex,
  TIER_OPPONENT_BASE,
  OPPONENT_REP_FACTOR,
  OPPONENT_VARIANCE,
  PURSE_BY_TIER,
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

// --- Résolution graduée du combat (FR-10) ---
export type FightOutcome = 'clean' | 'poor' | 'upset' | 'loss'
export type FightMethod = 'KO' | 'soumission' | 'décision'

/** Variation d'un canal appliquée par le combat (pour l'affichage des deltas). */
export interface FightChange {
  target: Channel
  value: number
}

export interface FightResult {
  opponentName: string
  opponentLabel: string
  opponentRecord: string
  outcome: FightOutcome
  win: boolean
  method: FightMethod
  titleFight: boolean
  wonBelt: boolean
  lostBelt: boolean
  changes: FightChange[]
}

/** La tactique correspond-elle à l'orientation naturelle du style ? (petit bonus) */
function styleMatchesTactic(style: Style, tactic: Channel): boolean {
  if (style === 'striker') return tactic === 'striking'
  if (style === 'wrestler') return tactic === 'grappling'
  if (style === 'grappler') return tactic === 'ground'
  return false // polyvalent : pas de bonus dédié
}

const REWARD: Record<FightOutcome, { rep: number; followersMul: number; healthCost: number }> = {
  clean: { rep: 10, followersMul: 1.0, healthCost: 6 },
  poor: { rep: 3, followersMul: 0.4, healthCost: 5 },
  upset: { rep: 18, followersMul: 1.6, healthCost: 9 },
  loss: { rep: -5, followersMul: 0.1, healthCost: 14 },
}

/**
 * Résout un combat (FR-10) : combine la qualité du choix (tactique vs stat &
 * faiblesse adverse) et l'écart de niveau, produit un Degré de victoire et
 * applique les conséquences. PUR/déterministe : l'aléa vient de `state.rng`.
 */
export function resolveFight(
  state: GameState,
  event: EventDef,
  choice: Choice,
  opponent: Opponent,
): { game: GameState; result: FightResult } {
  const tactic: Channel = choice.tactic ?? 'striking'
  const tacticStat = readChannel(state, tactic)
  const overall =
    (state.stats.striking + state.stats.grappling + state.stats.ground + state.stats.cardio) / 4

  let perf = tacticStat * 0.6 + state.stats.cardio * 0.2 + state.meta.mental * 0.2
  if (tactic === opponent.weakTo) perf += 12
  if (styleMatchesTactic(state.style, tactic)) perf += 6

  const [noise, rng1] = nextInt(state.rng, -10, 10)
  const margin = perf - opponent.level + noise
  const win = margin >= 0
  const wasUnderdog = opponent.level - overall >= 8

  const outcome: FightOutcome = win ? (wasUnderdog ? 'upset' : margin >= 20 ? 'clean' : 'poor') : 'loss'
  const finish = win && (outcome === 'clean' || outcome === 'upset')
  const method: FightMethod = !win
    ? margin <= -18
      ? 'KO'
      : 'décision'
    : finish
      ? tactic === 'striking'
        ? 'KO'
        : tactic === 'ground' || tactic === 'grappling'
          ? 'soumission'
          : 'décision'
      : 'décision'

  const titleFight = event.fight?.titleFight ?? false
  const reward = REWARD[outcome]
  const followers = Math.round(((tierIndex(state.tier) + 1) * 30 + opponent.level) * reward.followersMul)
  const purse = win ? PURSE_BY_TIER[state.tier] : Math.round(PURSE_BY_TIER[state.tier] * 0.5)

  const changes: FightChange[] = []
  const push = (target: Channel, value: number) => {
    if (value !== 0) changes.push({ target, value })
  }
  push('reputation', reward.rep)
  push('followers', followers)
  push('money', purse)
  push('health', -reward.healthCost)
  // Prime de prestige sur un combat de titre gagné (FR-5).
  if (titleFight && win) {
    push('reputation', 12)
    push('followers', Math.round(followers * 0.5))
  }
  // Prime de prestige sur un tournoi remporté (titre amateur).
  const winFlag = event.fight?.winFlag
  if (winFlag && win) {
    push('reputation', 8)
  }

  let g: GameState = { ...state, rng: rng1 }
  for (const c of changes) g = applyEffect(g, { target: c.target, op: 'add', value: c.value })

  g = {
    ...g,
    record: {
      wins: g.record.wins + (win ? 1 : 0),
      losses: g.record.losses + (win ? 0 : 1),
      finishes: g.record.finishes + (finish ? 1 : 0),
    },
  }

  // Enjeu de la ceinture (FR-5) : conquête, défense ou perte du titre.
  let wonBelt = false
  let lostBelt = false
  if (titleFight) {
    if (win && !state.belt) {
      g = { ...g, belt: true }
      wonBelt = true
    } else if (win && state.belt) {
      g = { ...g, titleDefenses: g.titleDefenses + 1 }
    } else if (!win && state.belt) {
      g = { ...g, belt: false }
      lostBelt = true
    }
  }

  // Titre de tournoi amateur remporté : pose le drapeau correspondant.
  if (winFlag && win) {
    g = { ...g, flags: { ...g.flags, [winFlag]: true } }
  }

  // Risque de blessure sur défaite quand la forme est déjà entamée (FR-13, ébauche).
  if (!win && g.meta.health <= 35) {
    g = { ...g, flags: { ...g.flags, blessure: true } }
  }

  g = markEventConsumed(g, event)

  const result: FightResult = {
    opponentName: opponent.name,
    opponentLabel: opponent.label,
    opponentRecord: opponent.record,
    outcome,
    win,
    method,
    titleFight,
    wonBelt,
    lostBelt,
    changes,
  }
  return { game: g, result }
}
