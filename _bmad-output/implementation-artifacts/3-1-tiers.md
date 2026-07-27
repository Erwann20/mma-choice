# Story 3.1: Paliers de carrière

Status: review

## Story
As a joueur, I want gravir les échelons du circuit MMA, so that ma carrière ait une trajectoire ascendante.

## Acceptance Criteria
1. Seuils (réputation, victoires) en config ; atteints ⇒ promotion IMMAF → régional → majeur, nouveaux événements éligibles (FR-5). ✅
2. Le palier est visible dans les informations de carrière. ✅

## Tasks / Subtasks
- [x] `engine/config.ts` : `TIER_PROMOTION` (seuils réputation ET victoires par palier)
- [x] `engine/progression.ts` : `earnedTier` / `promoteTier` PUR (promotion monotone)
- [x] `engine/reducer.ts` : promotion au bilan annuel (ADVANCE_YEAR)
- [x] `schema` : conditions dérivées `on: tier|wins|losses` + condition `style`
- [x] `engine/events.ts` : `readField` (lecture des dérivés) + `evalCondition` style
- [x] `content` : combats gatés `fight-regional-main-card` (tier≥1), `fight-major-show` (tier≥2)
- [x] `ui/StatsSheet` : affichage palier + palmarès (+ libellés partagés `labels.ts`)
- [x] Tests `engine/progression.test.ts` (7)

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Promotion monotone (jamais de rétrogradation) exigeant réputation ET victoires ; appliquée à l'`ADVANCE_YEAR`.
- Conditions élargies aux dérivés d'état (tier ordinal, wins, losses) et au style, en LECTURE SEULE — les effets restent bornés aux canaux (AD-5).
- Contenu régional/majeur débloqué par la montée de palier ; adversaires déjà calibrés par palier (Story 2.1).
- 55 tests ; `typecheck`/`lint`/`test` verts.
### File List
Nouveaux : `src/engine/progression.ts`, `src/engine/progression.test.ts` · Modifiés : `src/engine/config.ts`, `src/engine/reducer.ts`, `src/engine/events.ts`, `src/engine/index.ts`, `src/schema/content.ts`, `src/content/events/amateur.json`, `src/ui/StatsSheet.tsx`, `src/ui/labels.ts`

## Change Log
- 2026-07-27 — Story 3.1 : paliers de carrière (promotion réputation+victoires) + conditions dérivées. 7 tests. Statut → review.
