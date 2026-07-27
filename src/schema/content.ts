// Contrat de contenu (AD-4/5) : schémas Zod + types dérivés (z.infer).
// Le moteur ne consomme le contenu qu'à travers ces types validés.
import { z } from 'zod'
import amateurEvents from '../content/events/amateur.json'
import metaEvents from '../content/events/meta.json'
import divisionsData from '../content/divisions.json'
import startingCriteriaData from '../content/starting-criteria.json'
import opponentsData from '../content/opponents.json'

// --- Canaux FERMÉS (AD-5) : effets/conditions ne peuvent viser que ceux-ci,
// jamais un interne du moteur (rng, saveVersion, flags « vu »).
export const CHANNELS = [
  'striking',
  'grappling',
  'ground',
  'cardio',
  'health',
  'mental',
  'reputation',
  'followers',
  'money',
] as const

export const ChannelSchema = z.enum(CHANNELS)
export const OpSchema = z.enum(['add', 'sub', 'set'])
export const CmpSchema = z.enum(['lt', 'lte', 'eq', 'ne', 'gte', 'gt'])
export const StyleSchema = z.enum(['striker', 'wrestler', 'grappler', 'allrounder'])
export type StyleName = z.infer<typeof StyleSchema>

export const EffectSchema = z.object({
  target: ChannelSchema,
  op: OpSchema,
  value: z.number(),
})

// Champs numériques LISIBLES en condition : canaux + dérivés d'état (lecture
// seule ; les effets, eux, ne peuvent viser qu'un canal — AD-5).
export const ConditionFieldSchema = z.union([
  ChannelSchema,
  z.enum(['age', 'tier', 'wins', 'losses']),
])
export type ConditionField = z.infer<typeof ConditionFieldSchema>

export const ConditionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('stat'),
    on: ConditionFieldSchema,
    cmp: CmpSchema,
    value: z.number(),
  }),
  z.object({
    kind: z.literal('flag'),
    flag: z.string().min(1),
    eq: z.union([z.boolean(), z.number()]),
  }),
  z.object({
    kind: z.literal('style'),
    eq: StyleSchema,
  }),
])

export const ChoiceSchema = z.object({
  label: z.string().min(1),
  hint: z.string().optional(),
  effects: z.array(EffectSchema).default([]),
  /** Tactique de combat mise en avant (événements `fight` uniquement, FR-10). */
  tactic: ChannelSchema.optional(),
  /** Fait évoluer le style du combattant (entraînement dédié, FR-15). */
  setStyle: StyleSchema.optional(),
  setFlags: z.record(z.string(), z.union([z.boolean(), z.number()])).optional(),
  // Conséquences différées (FR-9) : arment un flag actif dans `inYears` années.
  armFlags: z
    .array(
      z.object({
        flag: z.string().min(1),
        value: z.union([z.boolean(), z.number()]),
        inYears: z.number().int().positive(),
      }),
    )
    .optional(),
})

/** Un événement `fight` déclenche la résolution de combat (FR-10) au lieu
 *  d'appliquer simplement les effets du choix. `titleFight` = combat de ceinture. */
export const FightSchema = z.object({
  titleFight: z.boolean().default(false),
})

export const EventSchema = z.object({
  id: z.string().min(1),
  weight: z.number().int().positive().default(1),
  repeatable: z.boolean().default(false),
  cooldown: z.number().int().nonnegative().optional(),
  overline: z.string().optional(),
  text: z.string().min(1),
  fight: FightSchema.optional(),
  choices: z.array(ChoiceSchema).min(1).max(4),
  conditions: z.array(ConditionSchema).default([]),
})

export type Channel = z.infer<typeof ChannelSchema>
export type Op = z.infer<typeof OpSchema>
export type Cmp = z.infer<typeof CmpSchema>
export type Effect = z.infer<typeof EffectSchema>
export type Condition = z.infer<typeof ConditionSchema>
export type Choice = z.infer<typeof ChoiceSchema>
export type EventDef = z.infer<typeof EventSchema>

/**
 * Valide un tableau brut d'Événements et garantit l'unicité GLOBALE des ids (AD-4).
 * Lève une erreur au chargement si le contenu est invalide ou contient un doublon.
 */
export function parseEvents(raw: unknown): EventDef[] {
  const events = z.array(EventSchema).parse(raw)
  const seen = new Set<string>()
  for (const e of events) {
    if (seen.has(e.id)) throw new Error(`Contenu invalide : id d'Événement en double « ${e.id} »`)
    seen.add(e.id)
  }
  return events
}

/** Charge et valide tout le contenu d'Événements du jeu (ids uniques globaux). */
export function loadEvents(): EventDef[] {
  return parseEvents([...amateurEvents, ...metaEvents])
}

// --- Divisions de poids (grilles UFC) ---
export const DivisionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  sex: z.enum(['M', 'F']),
  weight: z.string().min(1),
})
export type Division = z.infer<typeof DivisionSchema>

export function loadDivisions(): Division[] {
  return z.array(DivisionSchema).parse(divisionsData)
}

/** Divisions proposées pour un sexe (grille hommes / femmes, FR-1/3). */
export function divisionsForSex(divisions: Division[], sex: 'M' | 'F'): Division[] {
  return divisions.filter((d) => d.sex === sex)
}

// --- Critères de départ (origine, entourage) ---
export const CriterionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  effects: z.array(EffectSchema).default([]),
  setFlags: z.record(z.string(), z.union([z.boolean(), z.number()])).optional(),
})
export type Criterion = z.infer<typeof CriterionSchema>

export const StartingCriteriaSchema = z.object({
  origins: z.array(CriterionSchema).min(1),
  entourages: z.array(CriterionSchema).min(1),
})
export type StartingCriteria = z.infer<typeof StartingCriteriaSchema>

export function loadStartingCriteria(): StartingCriteria {
  return StartingCriteriaSchema.parse(startingCriteriaData)
}

// --- Adversaires (FR-16) : archétypes authorés + banques de noms (AD-4) ---
export const ArchetypeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  style: StyleSchema,
  blurb: z.string().min(1),
  /** Prime de puissance de l'archétype (ajoutée au niveau calibré). */
  power: z.number().int().default(0),
  /** Tactique du joueur qui exploite la faiblesse de l'archétype. */
  weakTo: ChannelSchema,
})
export type Archetype = z.infer<typeof ArchetypeSchema>

export const OpponentPoolSchema = z.object({
  archetypes: z.array(ArchetypeSchema).min(1),
  firstNames: z.object({ M: z.array(z.string().min(1)).min(1), F: z.array(z.string().min(1)).min(1) }),
  lastNames: z.array(z.string().min(1)).min(1),
})
export type OpponentPool = z.infer<typeof OpponentPoolSchema>

export function loadOpponentPool(): OpponentPool {
  return OpponentPoolSchema.parse(opponentsData)
}
