// Accès aux canaux de GameState (AD-5). Un canal est soit une clé d'attribut
// sportif (dans `stats`, propre au sport), soit une méta commune à tous les
// sports. Générique : aucune liste d'attributs en dur (support multi-sports).
import type { Channel } from '../schema'
import type { GameState } from './state'
import { clampStat } from './config'

/** Canaux « méta » communs à tous les sports (le reste = attributs du sport). */
const META: ReadonlySet<string> = new Set(['health', 'mental', 'reputation', 'followers', 'money'])
/** Canaux non bornés (cumulatifs) ; tous les autres sont bornés à [0, 100]. */
const UNBOUNDED: ReadonlySet<string> = new Set(['followers', 'money'])

/** Lit la valeur numérique d'un canal dans l'état. */
export function readChannel(state: GameState, ch: Channel): number {
  if (META.has(ch)) return state.meta[ch as keyof GameState['meta']] ?? 0
  return state.stats[ch] ?? 0
}

/** Écrit une valeur dans un canal (pur), bornée selon le canal (AD-5). */
export function writeChannel(state: GameState, ch: Channel, value: number): GameState {
  const v = UNBOUNDED.has(ch) ? Math.max(0, value) : clampStat(value)
  if (META.has(ch)) {
    return { ...state, meta: { ...state.meta, [ch]: v } }
  }
  return { ...state, stats: { ...state.stats, [ch]: v } }
}
