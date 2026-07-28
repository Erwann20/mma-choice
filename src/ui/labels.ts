// Libellés FR et formatage des effets pour l'affichage (voix sobre).
import type { Channel, Effect, EventCategory, EventDef } from '../schema'
import { loadOrganizations } from '../schema'
import type { Tier, Style, GameState } from '../engine'
import { nationOf } from '../engine'

/** Formatage compact FR d'un nombre : 1 200 → « 1,2 k », 3 400 000 → « 3,4 M ». */
export function formatCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs < 1000) return String(n)
  const unit = abs < 1_000_000 ? 'k' : 'M'
  const v = n / (abs < 1_000_000 ? 1000 : 1_000_000)
  const s = Math.abs(v) < 10 ? v.toFixed(1).replace(/\.0$/, '').replace('.', ',') : String(Math.round(v))
  return `${s} ${unit}`
}

/** Montant en euros, formaté compact (« 850 € », « 50 k € », « 1,2 M € »). */
export function formatMoney(n: number): string {
  return `${formatCompact(n)} €`
}

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
const ORG_COUNTRY: Record<string, string> = Object.fromEntries(
  loadOrganizations().map((o) => [o.id, o.country]),
)

/** Libellé lisible d'une organisation (ou null si aucune). */
export function organizationLabel(id: string | null): string | null {
  return id ? (ORG_LABEL[id] ?? null) : null
}

/** Pays d'attache d'une organisation (ou null si aucune). */
export function organizationCountry(id: string | null): string | null {
  return id ? (ORG_COUNTRY[id] ?? null) : null
}

/** Statut : « Amateur », « Pro · Hexagone MMA (régionale) · France ✈️ »… */
export function careerStatus(game: GameState): string {
  const org = organizationLabel(game.organization)
  const country = organizationCountry(game.organization)
  const abroad = game.flags['expatrie'] === true
  const loc = country ? ` · ${country}${abroad ? ' ✈️' : ''}` : ''
  if (!game.pro) return org ? `Amateur · ${org}${loc}` : 'Amateur'
  const level = game.tier === 'major' ? 'majeure' : 'régionale'
  return org ? `Pro · ${org} (${level})${loc}` : `Pro · ${TIER_LABEL[game.tier]}`
}

/** Remplace les variables de gabarit d'un texte d'événement selon l'état. */
export function interpolate(text: string, game: GameState): string {
  return text
    .replace(/\{nation\}/g, nationOf(game.fighter.country))
    .replace(/\{country\}/g, game.fighter.country)
    .replace(/\{name\}/g, game.fighter.name)
    .replace(/\{nemesis\}/g, game.nemesis?.name ?? 'ton rival')
}

/** Libellé (avec emoji) d'un titre amateur, selon la clé de flag et le pays. */
export function titleFlagLabel(flag: string, game: GameState): string {
  switch (flag) {
    case 'titre_monde':
      return '🌍 Champion du Monde IMMAF'
    case 'titre_europe':
      return "🇪🇺 Champion d'Europe IMMAF"
    case 'titre_national':
      return `🥇 Champion ${nationOf(game.fighter.country)}`
    case 'titre_regional_am':
      return '🏅 Vainqueur de tournoi régional'
    default:
      return flag
  }
}

/** Titres amateurs (tournois) remportés, du plus prestigieux au moins. */
export function amateurTitles(game: GameState): string[] {
  const t: string[] = []
  if (game.flags['titre_monde']) t.push('Champion du Monde IMMAF')
  if (game.flags['titre_europe']) t.push("Champion d'Europe IMMAF")
  if (game.flags['titre_national']) t.push(`Champion ${nationOf(game.fighter.country)}`)
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
