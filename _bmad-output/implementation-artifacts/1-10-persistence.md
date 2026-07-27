# Story 1.10: Persistance et reprise de carrière

Status: review

## Story
As a joueur, I want retrouver ma carrière après avoir fermé l'onglet, so that je ne perde jamais ma progression.

## Acceptance Criteria
1. `persist` Zustand = seul écrivain de localStorage, clé versionnée `mmachoice.save.v1`, contenu par id (AD-7, NFR-4) ; reprise sur l'événement exact + RNG restauré + toast « Reprise sauvegardée ». ✅
2. Démarrer une nouvelle carrière → confirmDialog avant de remplacer la sauvegarde (UX-DR11). ✅

## Tasks / Subtasks
- [x] `store/session.ts` : `SavedSession` + `serializeSession`/`deserializeSession` (contenu par id, AD-7)
- [x] `store/game.ts` : middleware `persist` (name versionné, `createJSONStorage(localStorage)`, `partialize`, `merge` qui recharge les events et re-résout `current` par id)
- [x] `ui/Toast.tsx` + `ui/ConfirmDialog.tsx` + CSS
- [x] `GameRoot` : toast « Reprise sauvegardée » au démarrage si session rechargée ; confirmDialog sur « Nouvelle carrière »
- [x] Tests `store/persist.test.ts` (2) : sérialisation par id (pas d'objet embarqué), round-trip

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Persistance conforme AD-7 : on ne persiste que `{game, currentId, eventsThisYear}` (jamais l'`EventDef` ni le tableau `events`). Au rechargement, `merge` recharge le contenu (`loadEvents`) et re-résout `current` par id. Le RNG (dans `game`) est restauré → reprise déterministe.
- `GameState` étant JSON-sérialisable (Story 1.2), le round-trip localStorage est direct.
- Toast sobre au démarrage si une carrière est rechargée. ConfirmDialog générique (role dialog) utilisé pour « Nouvelle carrière » (garde-fou de remplacement).
- 33 tests ; `test`/`lint`/`build` verts.
### File List
Nouveaux : `src/ui/Toast.tsx`, `src/ui/ConfirmDialog.tsx`, `src/store/persist.test.ts` · Modifiés : `src/store/session.ts`, `src/store/game.ts`, `src/ui/GameRoot.tsx`, `src/ui/index.ts`, `src/ui/game.css`

## Change Log
- 2026-07-27 — Story 1.10 : persistance localStorage (persist Zustand, refs par id AD-7), reprise + toast, confirmDialog. 2 tests. Statut → review.
