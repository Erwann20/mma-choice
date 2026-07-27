// Libellés FR et formatage des effets pour l'affichage (voix sobre).
import type { Channel, Effect } from '../schema'
import { loadOrganizations } from '../schema'
import type { Tier, Style, GameState } from '../engine'

export const TIER_LABEL: Record<Tier, string> = {
  immaf: 'Circuit amateur (IMMAF)',
  regional: 'Circuit régional',
  major: 'Organisation majeure',
}

const ORG_LABEL: Record<string, string> = Object.fromEntries(
  loadOrganizations().map((o) => [o.id, o.label]),
)

/** Libellé lisible d'une organisation (ou null si aucune). */
export function organizationLabel(id: string | null): string | null {
  return id ? (ORG_LABEL[id] ?? null) : null
}

/** Statut de carrière : « Amateur · IMMAF » ou « Pro · Hexagone MMA (régional) ». */
export function careerStatus(game: GameState): string {
  if (!game.pro) return 'Amateur · circuit IMMAF'
  const org = organizationLabel(game.organization)
  const level = game.tier === 'major' ? 'majeure' : 'régionale'
  return org ? `Pro · ${org} (${level})` : `Pro · ${TIER_LABEL[game.tier]}`
}

export const STYLE_LABEL: Record<Style, string> = {
  striker: 'Puncheur',
  wrestler: 'Lutteur',
  grappler: 'Grappler',
  allrounder: 'Polyvalent',
}

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
