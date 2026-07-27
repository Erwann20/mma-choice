# Story 3.3: Évolution du style de combat

Status: review

## Story
As a joueur, I want faire évoluer mon style au fil de la carrière, so that mon combattant se transforme selon mes choix.

## Acceptance Criteria
1. Un choix d'entraînement / événement dédié (règles en data) migre le Style (FR-15). ✅
2. Le Style influe sur les conditions de déclenchement et la résolution (AD-5/6). ✅

## Tasks / Subtasks
- [x] `schema` : `setStyle` sur le choix (validé par `StyleSchema`)
- [x] `engine/effects.ts` : `applyChoice` applique `setStyle`
- [x] `content` : événement `evt-camp-specialise` (4 réorientations de style)
- [x] Tests `engine/style.test.ts` (2) : migration de style + bonus de style en combat
- [x] Rappel : condition `style` (Story 3.1) + `styleMatchesTactic` (Story 2.2) déjà en place

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- `setStyle` piloté par la data : un camp spécialisé réoriente le style (avec coût de forme), le style « polyvalent » reste une option.
- Le style agit déjà sur la sélection (condition `style`) et la résolution (bonus `+6` quand la tactique colle au style) — la story boucle la mécanique.
- 61 tests ; `typecheck`/`lint`/`test` verts. **Epic 3 terminée : progression, ceintures et style vivants.**
### File List
Nouveaux : `src/engine/style.test.ts` · Modifiés : `src/schema/content.ts`, `src/engine/effects.ts`, `src/content/events/amateur.json`

## Change Log
- 2026-07-27 — Story 3.3 : évolution du style via `setStyle`. 2 tests. Statut → review. **Epic 3 terminée.**
