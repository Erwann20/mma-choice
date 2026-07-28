// Nationalité : fragment « de/du/d'/des <pays> » pour libeller un titre national
// selon le pays (« Champion du Brésil », « Champion d'Irlande »). PUR. Module
// neutre (aucune dépendance) : partagé par le contenu de tous les sports.

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
