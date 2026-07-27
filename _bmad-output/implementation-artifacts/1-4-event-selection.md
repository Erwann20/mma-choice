# Story 1.4: Sélection d'événements pondérée et anti-répétition

Status: review

## Story
As a joueur, I want des événements variés et non répétés chaque année, so that deux carrières ne se ressemblent pas.

## Acceptance Criteria
1. Pool filtré par conditions, exclusion des « vus » (sauf répétable), tri par id, tirage pondéré à graine (AD-6, FR-8). ✅
2. Événement non répétable déjà joué non resélectionné. ✅
3. Flag différé → Événement de conséquence éligible seulement après le délai (FR-9). ✅
4. Pool jamais vide (repli filler) + cooldown répétable (anti-softlock/boucle). ✅

## Tasks / Subtasks
- [x] `engine/channels.ts` : `readChannel` (mapping canal → stats/meta)
- [x] `engine/events.ts` : `evalCondition`, `isEligible`, `buildPool` (tri par id, repli non-vide), `selectEvent` (tirage pondéré à graine), `markEventConsumed` (flag vu / cooldown)
- [x] `state.ts` : type `PendingFlag` + champ `pending` ; `reducer.ts` ADVANCE_YEAR active les flags dus
- [x] Tests `engine/events.test.ts` (7) : conditions, anti-répétition, cooldown, pool non-vide, tirage déterministe, flag différé

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Moteur PUR : `selectEvent(state, events)` reçoit les Événements en paramètre (le contenu est chargé par l'app via `schema.loadEvents`, pas par le moteur).
- Anti-répétition via flags internes `__seen__<id>` ; cooldown via `__cd__<id>` = âge de re-disponibilité.
- `buildPool` trie par id AVANT le tirage (déterminisme, AD-6) et garantit un pool non vide (repli sur répétables, puis sur tout).
- Flags différés : `pending: PendingFlag[]` dans GameState, activés par ADVANCE_YEAR quand `atAge <= âge` (FR-9).
- 19 tests au total ; `test`/`lint`/`build` verts.
### File List
Nouveaux : `src/engine/channels.ts`, `src/engine/events.ts`, `src/engine/events.test.ts` · Modifiés : `src/engine/state.ts`, `src/engine/reducer.ts`, `src/engine/index.ts`

## Change Log
- 2026-07-27 — Story 1.4 : sélection pondérée + anti-répétition + cooldown + pool non-vide (AD-6) + flags différés (FR-9). 7 tests. Statut → review.
