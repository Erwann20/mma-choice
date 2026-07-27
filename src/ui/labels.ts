// Libellés FR et formatage des effets pour l'affichage (voix sobre).
import type { Channel, Effect } from '../schema'

export const CHANNEL_LABEL: Record<Channel, string> = {
  striking: 'Frappe',
  grappling: 'Lutte',
  ground: 'Sol',
  cardio: 'Cardio',
  health: 'Forme',
  mental: 'Mental',
  reputation: 'Réputation',
  followers: 'Followers',
  money: '€',
}

export type Dir = 'up' | 'down' | 'neutral'

/** Transforme un effet déclaré en une puce lisible (aperçu déterministe, AD-5). */
export function effectChip(e: Effect): { label: string; dir: Dir } {
  const sign = e.op === 'add' ? '+' : e.op === 'sub' ? '−' : '='
  const dir: Dir = e.op === 'add' ? 'up' : e.op === 'sub' ? 'down' : 'neutral'
  const value = e.target === 'money' ? `${sign}${e.value} €` : `${CHANNEL_LABEL[e.target]} ${sign}${e.value}`
  return { label: value, dir }
}

/** Puce lisible pour un delta de combat (variation signée d'un canal). */
export function changeChip(target: Effect['target'], value: number): { label: string; dir: Dir } {
  const dir: Dir = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  const abs = Math.abs(value)
  const label = target === 'money' ? `${sign}${abs} €` : `${CHANNEL_LABEL[target]} ${sign}${abs}`
  return { label, dir }
}
