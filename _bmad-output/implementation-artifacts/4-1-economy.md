# Story 4.1: Économie — bourses, sponsors, réinvestissement

Status: review

## Story
As a joueur, I want gagner et dépenser de l'argent, so that je puisse investir dans ma progression.

## Acceptance Criteria
1. Bourses via combats ; contrats sponsors débloqués par un seuil de Réputation ET de Followers (FR-11). ✅
2. Réinvestissement dans le camp ⇒ amélioration stats/Forme selon règles en data. ✅

## Tasks / Subtasks
- [x] `content/events/meta.json` : sponsors (`evt-sponsor-marque`, `evt-sponsor-major`) gatés réputation ET followers ; réinvestissement `evt-camp-elite` gaté par l'argent
- [x] `schema/content.ts` : `loadEvents` fusionne `amateur.json` + `meta.json` (ids uniques globaux)
- [x] Tests `engine/economy.test.ts` (2)

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Bourses déjà versées par `resolveFight` (Story 2.2, `PURSE_BY_TIER`). Cette story ajoute la boucle dépense.
- Sponsors : double condition réputation + followers (déblocage par les deux, FR-11). Camp d'élite : options coûteuses gatées par `money gte`, améliorent stats/forme.
- Contenu multi-fichiers : `loadEvents` concatène et valide l'unicité globale des ids — prépare le volume (Story 5.5).
- 63 tests ; `typecheck`/`lint`/`test` verts.
### File List
Nouveaux : `src/content/events/meta.json`, `src/engine/economy.test.ts` · Modifiés : `src/schema/content.ts`

## Change Log
- 2026-07-27 — Story 4.1 : sponsors (répu+followers) + réinvestissement camp + chargement multi-fichiers. 2 tests. Statut → review.
