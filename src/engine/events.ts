// Sélection d'événements (AD-6, FR-8/9) : filtrage par conditions, exclusion
// des « vus » (anti-répétition), tirage pondéré à graine, pool jamais vide.
// PUR : reçoit les Événements en paramètre (le moteur ne charge pas le contenu).
import type { Cmp, Condition, ConditionField, EventDef } from '../schema'
import type { GameState } from './state'
import type { RngState } from './rng'
import { nextInt } from './rng'
import { readChannel } from './channels'
import { tierIndex } from './config'

const SEEN_PREFIX = '__seen__'
const COOLDOWN_PREFIX = '__cd__'

function compare(a: number, cmp: Cmp, b: number): boolean {
  switch (cmp) {
    case 'lt':
      return a < b
    case 'lte':
      return a <= b
    case 'eq':
      return a === b
    case 'ne':
      return a !== b
    case 'gte':
      return a >= b
    case 'gt':
      return a > b
  }
}

/** Lit un champ numérique d'état pour les conditions (canaux + dérivés, AD-5). */
function readField(state: GameState, field: ConditionField): number {
  switch (field) {
    case 'age':
      return state.fighter.age
    case 'tier':
      return tierIndex(state.tier)
    case 'wins':
      return state.record.wins
    case 'losses':
      return state.record.losses
    default:
      return readChannel(state, field)
  }
}

export function evalCondition(state: GameState, c: Condition): boolean {
  if (c.kind === 'stat') {
    return compare(readField(state, c.on), c.cmp, c.value)
  }
  if (c.kind === 'style') {
    return state.style === c.eq
  }
  if (c.kind === 'sex') {
    return state.fighter.sex === c.eq
  }
  // flag : absent => false
  return (state.flags[c.flag] ?? false) === c.eq
}

/** Un Événement est-il éligible dans l'état courant ? */
export function isEligible(state: GameState, e: EventDef): boolean {
  if (!e.conditions.every((c) => evalCondition(state, c))) return false
  if (!e.repeatable) return state.flags[SEEN_PREFIX + e.id] !== true
  // répétable : respecter le cooldown (âge de re-disponibilité)
  const readyAt = state.flags[COOLDOWN_PREFIX + e.id]
  return typeof readyAt !== 'number' || state.fighter.age >= readyAt
}

/**
 * Construit le Pool éligible, TRIÉ par id (déterminisme, AD-6).
 * Jamais vide tant qu'il existe des Événements : repli sur les répétables,
 * puis sur tout, en ignorant progressivement seen/cooldown.
 */
export function buildPool(state: GameState, events: EventDef[]): EventDef[] {
  const byId = (a: EventDef, b: EventDef) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  const eligible = events.filter((e) => isEligible(state, e))
  if (eligible.length > 0) return eligible.sort(byId)
  // filler : répétables dont seules les conditions passent (cooldown ignoré)
  const fillers = events.filter((e) => e.repeatable && e.conditions.every((c) => evalCondition(state, c)))
  if (fillers.length > 0) return fillers.sort(byId)
  return [...events].sort(byId)
}

/** Sélectionne l'Événement suivant par tirage pondéré à graine. */
export function selectEvent(
  state: GameState,
  events: EventDef[],
): { event: EventDef; rng: RngState } {
  const pool = buildPool(state, events)
  if (pool.length === 0) throw new Error('Aucun Événement disponible : le catalogue est vide.')
  const total = pool.reduce((sum, e) => sum + e.weight, 0)
  const [roll, rng] = nextInt(state.rng, 1, total)
  let acc = 0
  for (const e of pool) {
    acc += e.weight
    if (roll <= acc) return { event: e, rng }
  }
  return { event: pool[pool.length - 1], rng }
}

/**
 * Marque un Événement comme consommé (pur) : pose le flag « vu » (non répétable)
 * ou arme le cooldown (répétable). À appeler quand l'Événement est joué (Story 1.5).
 */
export function markEventConsumed(state: GameState, e: EventDef): GameState {
  if (!e.repeatable) {
    return { ...state, flags: { ...state.flags, [SEEN_PREFIX + e.id]: true } }
  }
  if (e.cooldown && e.cooldown > 0) {
    return {
      ...state,
      flags: { ...state.flags, [COOLDOWN_PREFIX + e.id]: state.fighter.age + e.cooldown },
    }
  }
  return state
}
