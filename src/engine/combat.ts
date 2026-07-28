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
import { BELT_ORG_PREFIX, BELT_EVER_FLAG } from './belts'
import { SEQUELAE, activeSequelae, type Sequela } from './injuries'
import { signatureTactic, SIGNATURE_BONUS } from './coaching'
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
  /** Séquelle chronique contractée sur ce combat (défaite violente), sinon absent. */
  newInjury?: Sequela
  /** Combat de rivalité contre la némésis (FR-16). */
  nemesis: boolean
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

  // Fragilité : chaque séquelle chronique entame la performance (le corps ne
  // suit plus comme avant) — conséquence durable d'une blessure passée (FR-13).
  const injuryCount = activeSequelae(state).length

  let perf = tacticStat * 0.6 + state.stats.cardio * 0.2 + state.meta.mental * 0.2
  if (tactic === opponent.weakTo) perf += 12
  if (styleMatchesTactic(state.style, tactic)) perf += 6
  // Coup signature d'un coach (FR-15) : bonus durable sur la tactique enseignée.
  if (tactic === signatureTactic(state)) perf += SIGNATURE_BONUS
  perf -= injuryCount * 5

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
  // Une séquelle chronique alourdit l'usure de chaque combat.
  if (injuryCount > 0) push('health', -injuryCount * 3)
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

  // Enjeu de la ceinture (FR-5) : conquête, défense ou perte du titre. Chaque
  // organisation a SA ceinture : on est déjà champion « ici » si le drapeau de
  // l'orga courante est posé (sinon on retombe sur le booléen `belt`).
  let wonBelt = false
  let lostBelt = false
  if (titleFight) {
    const orgKey = state.organization ? BELT_ORG_PREFIX + state.organization : null
    const champHere = orgKey ? state.flags[orgKey] === true : state.belt
    if (win && !champHere) {
      // Nouvelle ceinture : on la conquiert et on l'inscrit au palmarès (à vie).
      g = {
        ...g,
        belt: true,
        flags: {
          ...g.flags,
          [BELT_EVER_FLAG]: true,
          ...(orgKey ? { [orgKey]: true } : {}),
        },
      }
      wonBelt = true
    } else if (win && champHere) {
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

  // Séquelle chronique (FR-13) : une défaite VIOLENTE (KO) ou très entamée peut
  // laisser une blessure durable, tant qu'on ne les cumule pas déjà toutes.
  let newInjury: Sequela | undefined
  if (!win && (method === 'KO' || g.meta.health <= 25)) {
    const available = SEQUELAE.filter((s) => g.flags[s] !== true)
    if (available.length > 0) {
      const [roll, rngInj] = nextInt(g.rng, 0, 99)
      g = { ...g, rng: rngInj }
      // ~55 % de risque sur un KO, ~35 % sur une défaite en état critique.
      if (roll < (method === 'KO' ? 55 : 35)) {
        const [pick, rngPick] = nextInt(g.rng, 0, available.length - 1)
        const injury = available[pick]
        g = { ...g, rng: rngPick, flags: { ...g.flags, [injury]: true } }
        newInjury = injury
      }
    }
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
    nemesis: event.fight?.nemesis ?? false,
    ...(newInjury ? { newInjury } : {}),
  }
  return { game: g, result }
}
