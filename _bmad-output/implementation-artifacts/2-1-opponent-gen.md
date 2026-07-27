# Story 2.1: Génération d'adversaire calibrée

Status: review

## Story
As a joueur, I want affronter des adversaires crédibles pour mon niveau, so that mes combats aient un enjeu juste.

## Acceptance Criteria
1. Génération d'une instance d'adversaire déterministe (AD-3), calibrée sur palier/division/réputation (FR-16). ✅
2. La force moyenne des adversaires monte avec le palier et la réputation. ✅

## Tasks / Subtasks
- [x] `content/opponents.json` : 6 archétypes (style, power, weakTo) + banques de prénoms (M/F) et noms
- [x] `schema` : `ArchetypeSchema`/`OpponentPoolSchema` + `loadOpponentPool` (validation AD-4)
- [x] `engine/state.ts` : `Tier`, `FightRecord`, champs `tier`/`belt`/`titleDefenses`/`record` (init)
- [x] `engine/config.ts` : `TIERS`/`tierIndex`, `TIER_OPPONENT_BASE`, `OPPONENT_REP_FACTOR`, `OPPONENT_VARIANCE`
- [x] `engine/combat.ts` : `Opponent` + `generateOpponent(state, pool, rng)` PUR
- [x] Tests `engine/combat.test.ts` (4) : déterminisme, bornes, montée avec palier, montée avec réputation

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- `generateOpponent` PUR/déterministe : archétype + nom tirés à la graine, niveau = base(palier) + power archétype + réputation×0.3 + variance ±8, borné 0–100.
- Palmarès « flavor » (`12-3`) dérivé du niveau, cohérent visuellement.
- État étendu (tier/belt/record) : socle des stories 2.2, 3.1 et 3.2.
- 41 tests ; `typecheck`/`lint`/`test` verts.
### File List
Nouveaux : `src/content/opponents.json`, `src/engine/combat.ts`, `src/engine/combat.test.ts` · Modifiés : `src/schema/content.ts`, `src/engine/state.ts`, `src/engine/config.ts`, `src/engine/index.ts`

## Change Log
- 2026-07-27 — Story 2.1 : génération d'adversaire calibrée + extensions d'état (palier/palmarès). 4 tests. Statut → review.
