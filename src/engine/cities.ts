// Villes par pays (FR-1) : le choix de club doit être crédible selon le pays du
// combattant (un Américain ne s'installe pas à Nantes). PUR. Sert à la fois à
// l'interpolation des libellés ({ville1}…) et à la résolution du choix (setCity).
// Pensé pour s'étendre : ajouter un pays = ajouter une entrée ici.

/** Grandes villes « MMA » par pays (4 max, ordre stable = slots des choix). */
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  France: ['Paris', 'Nantes', 'Marseille', 'Lyon'],
  'États-Unis': ['Las Vegas', 'New York', 'Los Angeles', 'Chicago'],
  Brésil: ['Rio de Janeiro', 'São Paulo', 'Curitiba', 'Belém'],
  Russie: ['Moscou', 'Saint-Pétersbourg', 'Iekaterinbourg', 'Krasnodar'],
  'Russie (Daghestan)': ['Makhatchkala', 'Khassaviourt', 'Kizliar', 'Derbent'],
  Nigéria: ['Lagos', 'Abuja', 'Kano', 'Ibadan'],
  Irlande: ['Dublin', 'Cork', 'Galway', 'Limerick'],
  Japon: ['Tokyo', 'Osaka', 'Nagoya', 'Fukuoka'],
  Mexique: ['Mexico', 'Guadalajara', 'Tijuana', 'Monterrey'],
  Canada: ['Montréal', 'Toronto', 'Vancouver', 'Calgary'],
  'Royaume-Uni': ['Londres', 'Manchester', 'Liverpool', 'Glasgow'],
  Pologne: ['Varsovie', 'Cracovie', 'Gdańsk', 'Wrocław'],
  Thaïlande: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya'],
  Suède: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala'],
  Singapour: ['Singapour', 'Jurong', 'Tampines', 'Woodlands'],
  'Émirats arabes unis': ['Dubaï', 'Abou Dabi', 'Charjah', 'Al-Aïn'],
}

// Repli neutre pour un pays sans banque dédiée : descripteurs jamais « faux »
// (pas de ville étrangère plaquée à tort sur un pays inconnu).
const DEFAULT_CITIES = ['la capitale', 'une grande métropole', 'une ville portuaire', 'une ville de province']

/** Villes proposées pour un pays (slots stables), repli neutre si inconnu. */
export function citiesForCountry(country: string): string[] {
  return CITIES_BY_COUNTRY[country] ?? DEFAULT_CITIES
}

/** Ville du slot demandé (1-based), ou null si hors bornes. */
export function cityForSlot(country: string, slot: number): string | null {
  return citiesForCountry(country)[slot - 1] ?? null
}
