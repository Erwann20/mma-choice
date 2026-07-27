// Contrat de contenu (AD-4/5) : schémas Zod + types dérivés (z.infer).
// Le moteur ne consomme le contenu qu'à travers ces types validés.
import { z } from 'zod'
import amateurEvents from '../content/events/amateur.json'

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

export const EffectSchema = z.object({
  target: ChannelSchema,
  op: OpSchema,
  value: z.number(),
})

export const ConditionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('stat'),
    on: z.union([ChannelSchema, z.literal('age')]),
    cmp: CmpSchema,
    value: z.number(),
  }),
  z.object({
    kind: z.literal('flag'),
    flag: z.string().min(1),
    eq: z.union([z.boolean(), z.number()]),
  }),
])

export const ChoiceSchema = z.object({
  label: z.string().min(1),
  hint: z.string().optional(),
  effects: z.array(EffectSchema).default([]),
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

export const EventSchema = z.object({
  id: z.string().min(1),
  weight: z.number().int().positive().default(1),
  repeatable: z.boolean().default(false),
  cooldown: z.number().int().nonnegative().optional(),
  overline: z.string().optional(),
  text: z.string().min(1),
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

/** Charge et valide tout le contenu d'Événements du jeu. */
export function loadEvents(): EventDef[] {
  return parseEvents(amateurEvents)
}
