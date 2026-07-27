# Story 1.8: Création du combattant (flux multi-étapes)

Status: review

## Story
As a joueur, I want créer mon combattant en quelques étapes, so that je démarre une carrière qui me ressemble.

## Acceptance Criteria
1. Flux multi-étapes (sexe → pays/âge → origine/style → entourage → division), progression, retour non destructif, commit au store (UX-DR14, FR-1,2). ✅
2. Le sexe filtre les divisions à la grille UFC correspondante (FR-1,3). ✅
3. Les critères de départ distribuent stats/jauges + posent des flags (FR-2). ✅

## Tasks / Subtasks
- [x] `content/divisions.json` (grilles UFC : 8 H, 4 F) + `content/starting-criteria.json` (origines, entourages)
- [x] `schema` : `DivisionSchema`/`loadDivisions`/`divisionsForSex`, `CriterionSchema`/`StartingCriteriaSchema`/`loadStartingCriteria`
- [x] `store/session.ts` : `CreationChoices` + `startCareerFromCreation` (applique origine + entourage via `applyEffect`, FR-2)
- [x] `store/game.ts` : `createCareer(choices)`
- [x] `ui/CreationScreen.tsx` (6 étapes, barre de progression, retour) + câblage `GameRoot` (mode création) + CSS
- [x] Tests `store/creation.test.ts` (2) : filtrage divisions par sexe, application des critères ; test GameRoot mis à jour

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- 6 étapes : Sexe → Pays/Âge → Origine → Style → Entourage → Division. `canNext` verrouille l'avancée tant que le requis n'est pas choisi ; « Retour » non destructif (revient d'une étape) ; étape 0 « Retour » = Annuler.
- Divisions filtrées par sexe via `divisionsForSex` (8 hommes, 4 femmes — grilles UFC).
- `startCareerFromCreation` applique les effets d'origine + entourage sur l'état initial (ex. Bagarreur de rue : Frappe +10, Mental −5 ; Coach mentor : Mental +10) → vérifié par test.
- 30 tests ; `test`/`lint`/`build` verts.
### File List
Nouveaux : `src/content/divisions.json`, `src/content/starting-criteria.json`, `src/ui/CreationScreen.tsx`, `src/store/creation.test.ts` · Modifiés : `src/schema/content.ts`, `src/store/session.ts`, `src/store/game.ts`, `src/ui/GameRoot.tsx`, `src/ui/index.ts`, `src/ui/game.css`, `src/ui/GameRoot.test.tsx`

## Change Log
- 2026-07-27 — Story 1.8 : création multi-étapes (divisions UFC filtrées par sexe, critères appliqués aux stats). 2 tests. Statut → review.
