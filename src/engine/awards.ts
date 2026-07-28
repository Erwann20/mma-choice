// Récompenses de fin de carrière (FR-14) : titre de carrière + trophées.
// PUR et déterministe : dérivé de l'état final + palmarès.
import type { GameState } from './state'
import { RETIREMENT_AGE } from './config'
import { hasChronicInjury } from './injuries'

export type TitleTone = 'goat' | 'legend' | 'star' | 'solid' | 'plain'

// Fragment « de/du/d'/des <pays> » pour libeller un titre national selon le
// pays du combattant (ex. « Champion du Brésil », « Champion d'Irlande »).
const NATION_DE: Record<string, string> = {
  France: 'de France',
  'États-Unis': 'des États-Unis',
  Brésil: 'du Brésil',
  Russie: 'de Russie',
  'Russie (Daghestan)': 'de Russie',
  Nigéria: 'du Nigéria',
  Irlande: "d'Irlande",
  Japon: 'du Japon',
  Mexique: 'du Mexique',
  Canada: 'du Canada',
  'Royaume-Uni': 'du Royaume-Uni',
  Pologne: 'de Pologne',
  Thaïlande: 'de Thaïlande',
  Italie: "d'Italie",
  Espagne: "d'Espagne",
  Allemagne: "d'Allemagne",
  FR: 'de France',
}

/** Fragment de nationalité (« de France », « du Brésil », « d'Irlande »…). */
export function nationOf(country: string): string {
  return NATION_DE[country] ?? `de ${country}`
}

/** Titre de carrière dérivé du Score /100 (de « passage discret » à GOAT). */
export function careerTitle(score: number): { label: string; icon: string; tone: TitleTone } {
  if (score >= 90) return { label: 'GOAT — le plus grand de tous les temps', icon: '🐐', tone: 'goat' }
  if (score >= 75) return { label: 'Légende du sport', icon: '👑', tone: 'legend' }
  if (score >= 60) return { label: 'Star confirmée', icon: '⭐', tone: 'star' }
  if (score >= 45) return { label: 'Combattant solide', icon: '🥊', tone: 'solid' }
  if (score >= 28) return { label: 'Combattant honnête', icon: '🧤', tone: 'plain' }
  return { label: 'Un passage discret', icon: '🌫️', tone: 'plain' }
}

export interface Achievement {
  id: string
  icon: string
  label: string
  desc: string
}

/** Trophées débloqués par la carrière (ordre stable, du plus prestigieux au moins). */
export function careerAchievements(game: GameState): Achievement[] {
  const { record, meta, stats, fighter } = game
  const out: Achievement[] = []
  const add = (cond: boolean, a: Achievement) => {
    if (cond) out.push(a)
  }

  add(game.flags['titre_monde'] === true, { id: 'immaf-monde', icon: '🌍', label: 'Champion du Monde IMMAF', desc: 'A dominé le sommet de l’amateurisme mondial.' })
  add(game.flags['titre_europe'] === true, { id: 'immaf-europe', icon: '🇪🇺', label: "Champion d'Europe IMMAF", desc: 'Sacré sur le continent en amateur.' })
  add(game.flags['titre_national'] === true, { id: 'champ-national', icon: '🥇', label: `Champion ${nationOf(fighter.country)} (amateur)`, desc: 'Meilleur amateur du pays.' })
  // Les ceintures d'organisation (par promotion) sont ajoutées côté UI, où les
  // libellés d'orga sont disponibles (voir RecapScreen / belts.ts).
  add(game.flags['titre_gp'] === true, { id: 'grand-prix', icon: '🏆', label: 'Vainqueur du Grand Prix mondial', desc: 'A remporté le tournoi le plus dur du sport pro.' })
  add(game.titleDefenses >= 2, { id: 'roi', icon: '🛡️', label: 'Roi de la division', desc: `${game.titleDefenses} défenses de titre réussies.` })
  add(game.tier === 'major' && meta.reputation >= 80, { id: 'icone', icon: '🌍', label: 'Icône mondiale', desc: 'Une superstar reconnue sur toute la planète MMA.' })
  add(record.wins >= 5 && record.losses === 0, { id: 'invaincu', icon: '💯', label: 'Invaincu', desc: 'A raccroché sans la moindre défaite.' })
  add(record.wins >= 10, { id: 'guerrier', icon: '🥊', label: 'Guerrier', desc: `${record.wins} victoires au compteur.` })
  add(record.finishes >= 5, { id: 'finisseur', icon: '💥', label: 'Finisseur', desc: `${record.finishes} victoires avant la limite.` })
  add(meta.followers >= 50000, { id: 'star-reseaux', icon: '📱', label: 'Star des réseaux', desc: `${meta.followers.toLocaleString('fr-FR')} followers.` })
  add(meta.money >= 100000, { id: 'fortune', icon: '💰', label: 'Fortune faite', desc: 'Plus de 100 000 € amassés.' })
  add(stats.striking >= 85, { id: 'puncheur', icon: '👊', label: 'Puncheur d’élite', desc: 'Une frappe redoutée de tous.' })
  add(stats.ground >= 85, { id: 'maitre-sol', icon: '🥋', label: 'Maître du sol', desc: 'Un cauchemar au tapis.' })
  add(stats.grappling >= 85, { id: 'lutteur', icon: '🤼', label: 'Force de la lutte', desc: 'Personne ne reste debout face à lui.' })
  add(fighter.age >= RETIREMENT_AGE && record.wins + record.losses >= 15, { id: 'veteran', icon: '🎖️', label: 'Vétéran', desc: 'Une longue et dense carrière.' })
  add(hasChronicInjury(game), { id: 'corps-marque', icon: '🩹', label: 'Corps marqué', desc: 'A porté ses blessures jusqu’au bout, sans jamais renoncer.' })

  return out
}
