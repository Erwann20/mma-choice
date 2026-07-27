// Accès aux canaux de GameState (AD-5). Lecture ici ; l'écriture (effets)
// arrive en Story 1.5.
import type { Channel } from '../schema'
import type { GameState } from './state'
import { clampStat } from './config'

// Canaux bornés à [0, 100] ; les autres (followers, money) sont juste ≥ 0.
const BOUNDED: ReadonlySet<Channel> = new Set([
  'striking',
  'grappling',
  'ground',
  'cardio',
  'health',
  'mental',
  'reputation',
])

/** Lit la valeur numérique d'un canal dans l'état. */
export function readChannel(state: GameState, ch: Channel): number {
  switch (ch) {
    case 'striking':
      return state.stats.striking
    case 'grappling':
      return state.stats.grappling
    case 'ground':
      return state.stats.ground
    case 'cardio':
      return state.stats.cardio
    case 'health':
      return state.meta.health
    case 'mental':
      return state.meta.mental
    case 'reputation':
      return state.meta.reputation
    case 'followers':
      return state.meta.followers
    case 'money':
      return state.meta.money
  }
}

/** Écrit une valeur dans un canal (pur), bornée selon le canal (AD-5). */
export function writeChannel(state: GameState, ch: Channel, value: number): GameState {
  const v = BOUNDED.has(ch) ? clampStat(value) : Math.max(0, value)
  switch (ch) {
    case 'striking':
      return { ...state, stats: { ...state.stats, striking: v } }
    case 'grappling':
      return { ...state, stats: { ...state.stats, grappling: v } }
    case 'ground':
      return { ...state, stats: { ...state.stats, ground: v } }
    case 'cardio':
      return { ...state, stats: { ...state.stats, cardio: v } }
    case 'health':
      return { ...state, meta: { ...state.meta, health: v } }
    case 'mental':
      return { ...state, meta: { ...state.meta, mental: v } }
    case 'reputation':
      return { ...state, meta: { ...state.meta, reputation: v } }
    case 'followers':
      return { ...state, meta: { ...state.meta, followers: v } }
    case 'money':
      return { ...state, meta: { ...state.meta, money: v } }
  }
}
