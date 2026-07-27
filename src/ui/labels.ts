// Libellés FR et formatage des effets pour l'affichage (voix sobre).
import type { Channel, Effect, EventCategory, EventDef } from '../schema'
import { loadOrganizations } from '../schema'
import type { Tier, Style, GameState } from '../engine'

/** Catégorie effective d'un événement (les combats priment). */
export function eventCategory(event: EventDef): EventCategory {
  if (event.fight) return 'combat'
  return event.category ?? 'general'
}

/** Icône + libellé par catégorie (couleur portée par la classe CSS `cat-*`). */
export const CATEGORY_META: Record<EventCategory, { icon: string; label: string }> = {
  combat: { icon: '🥊', label: 'Combat' },
  training: { icon: '🏋️', label: 'Entraînement' },
  money: { icon: '💰', label: 'Business' },
  social: { icon: '📱', label: 'Réseaux' },
  health: { icon: '🩹', label: 'Santé' },
  career: { icon: '📈', label: 'Carrière' },
  general: { icon: '📋', label: 'Vie de combattant' },
}

export const TIER_LABEL: Record<Tier, string> = {
  immaf: 'Amateur',
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

/** Statut : « Amateur », « Amateur · Ligue X » ou « Pro · Hexagone MMA (régional) ». */
export function careerStatus(game: GameState): string {
  const org = organizationLabel(game.organization)
  if (!game.pro) return org ? `Amateur · ${org}` : 'Amateur'
  const level = game.tier === 'major' ? 'majeure' : 'régionale'
  return org ? `Pro · ${org} (${level})` : `Pro · ${TIER_LABEL[game.tier]}`
}

/** Libellé (avec drapeau) d'un titre amateur repéré par sa clé de flag. */
export const TITLE_FLAG_LABEL: Record<string, string> = {
  titre_monde: '🌍 Champion du Monde IMMAF',
  titre_europe: "🇪🇺 Champion d'Europe IMMAF",
  titre_france: '🇫🇷 Champion de France amateur',
  titre_regional_am: '🏅 Vainqueur de tournoi régional',
}

/** Titres amateurs (tournois) remportés, du plus prestigieux au moins. */
export function amateurTitles(game: GameState): string[] {
  const t: string[] = []
  if (game.flags['titre_monde']) t.push('Champion du Monde IMMAF')
  if (game.flags['titre_europe']) t.push("Champion d'Europe IMMAF")
  if (game.flags['titre_france']) t.push('Champion de France amateur')
  if (game.flags['titre_regional_am']) t.push('Vainqueur de tournoi régional')
  return t
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
