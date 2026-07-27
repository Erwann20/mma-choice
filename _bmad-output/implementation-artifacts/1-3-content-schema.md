# Story 1.3: Contrat de contenu et chargement validé

Status: review

## Story
As a auteur de contenu, I want écrire les Événements en JSON validés par Zod, so that j'ajoute du contenu sans toucher au code et qu'un contenu invalide soit rejeté tôt.

## Acceptance Criteria
1. Schéma Zod Event/Choice/Effect/Condition à canaux fermés (AD-4/5) ; types via `z.infer` ; le moteur ne voit que le type validé. ✅
2. Id d'Événement en double → validation échoue (AD-4). ✅
3. Effet ciblant un canal inconnu / interne moteur → validation échoue (AD-5). ✅

## Tasks / Subtasks
- [x] `src/schema/content.ts` : `CHANNELS` (enum fermé), `EffectSchema`, `ConditionSchema` (union stat/flag), `ChoiceSchema`, `EventSchema` + types `z.infer`
- [x] `parseEvents(raw)` : validation + unicité globale des ids (throw sur doublon)
- [x] `loadEvents()` : charge + valide le contenu seed
- [x] `src/content/events/amateur.json` : 3 Événements seed (IMMAF, entraînement répétable, sponsor)
- [x] `tsconfig.app.json` : `resolveJsonModule: true`
- [x] Tests `src/schema/content.test.ts` (5) : chargement, doublon, canal invalide, choix vide, valeurs par défaut

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Canaux fermés via `z.enum(CHANNELS)` → un `target` inconnu (ex. `rng`) est rejeté par Zod (AD-5).
- Conditions = `z.discriminatedUnion('kind', [stat, flag])`. Choix : 1–4, `label` requis.
- `parseEvents` fait l'unicité d'id (AD-4). Le moteur (1.4) recevra les events en paramètre → reste pur.
- Zod 4 : `z.record(z.string(), value)`, `.default()` pour weight/repeatable/conditions.
- 13 tests au total verts ; `test`/`lint`/`build` OK.
### File List
Nouveaux : `src/schema/content.ts`, `src/schema/content.test.ts`, `src/content/events/amateur.json` · Modifiés : `src/schema/index.ts`, `tsconfig.app.json`

## Change Log
- 2026-07-27 — Story 1.3 : contrat de contenu Zod (canaux fermés AD-5, unicité d'id AD-4) + chargeur + 3 events seed. 5 tests. Statut → review.
