# Story 1.11: Fin de carrière, score et récap

Status: review

## Story
As a joueur, I want un score et un récapitulatif à la retraite, so that je mesure ma carrière et j'aie envie de recommencer.

## Acceptance Criteria
1. À l'âge-limite, écran Récap : Score /100 (formule en config), timeline/temps forts (FR-14). ✅
2. Même carrière (mêmes critères + choix) → même Score (reproductibilité, NFR-5). ✅
3. « Nouvelle carrière » relance (après confirmation). ✅

## Tasks / Subtasks
- [x] `engine/score.ts` : `computeScore(game)` /100 (combat, réputation, followers log, longévité, forme) + `allTimeRank(score)`
- [x] `ui/RecapScreen.tsx` : score display, rang « Nᵉ meilleur de tous les temps », temps forts dérivés, bouton nouvelle carrière
- [x] `GameRoot` : branche retraite → `RecapScreen` (+ confirmDialog)
- [x] CSS récap ; tests `engine/score.test.ts` (3) + `ui/RecapScreen.test.tsx` (1)

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- `computeScore` PUR et déterministe (NFR-5) : moyenne combat 35 % + réputation 30 % + followers (log) 15 % + longévité 15 % + forme 5 %, borné 0–100. Ceintures/paliers/combats l'affineront aux Epics 2-3.
- `allTimeRank` : rang flavor dérivé du score (100 → 1er), sans classement en ligne (le vrai Panthéon = phase 2).
- Temps forts dérivés de l'état (style/pays, division, flags IMMAF, réputation, followers).
- 37 tests au total ; `test`/`lint`/`build` verts. **Fin de l'Epic 1 : carrière jouable de bout en bout.**
### File List
Nouveaux : `src/engine/score.ts`, `src/engine/score.test.ts`, `src/ui/RecapScreen.tsx`, `src/ui/RecapScreen.test.tsx` · Modifiés : `src/engine/index.ts`, `src/ui/GameRoot.tsx`, `src/ui/index.ts`, `src/ui/game.css`

## Change Log
- 2026-07-27 — Story 1.11 : score de carrière /100 (déterministe) + écran de récap + rang. 4 tests. Statut → review. **Epic 1 terminée.**
