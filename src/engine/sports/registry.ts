// Registre des sports. Ajouter un sport = enregistrer sa SportDef ici.
import type { SportDef, SportId } from './types'
import { MMA } from './mma'

const SPORTS: Record<SportId, SportDef> = {
  mma: MMA,
  // basket: BASKET,  // ← ajouté au jalon suivant
} as Record<SportId, SportDef>

/** Définition d'un sport par id (repli sur le MMA si inconnu, robustesse). */
export function sportDef(id: SportId): SportDef {
  return SPORTS[id] ?? MMA
}

/** Sports jouables (définis dans le registre). */
export function playableSports(): SportDef[] {
  return Object.values(SPORTS)
}
