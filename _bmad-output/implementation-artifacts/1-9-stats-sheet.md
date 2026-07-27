# Story 1.9: Dashboard des stats en bottom-sheet

Status: review

## Story
As a joueur, I want consulter mes stats à tout moment sans perdre ma lecture, so that je pilote ma progression.

## Acceptance Criteria
1. Tap sur la rangée de chips → bottom-sheet avec statBars (Frappe/Lutte/Sol/Cardio), jauges méta, division/style (FR-6, UX-DR4,8). ✅
2. Fermeture → retour exact à la position de lecture ; profondeur modale = 1. ✅

## Tasks / Subtasks
- [x] `ui/StatBar.tsx` (jauge 0–100 dégradé lime)
- [x] `ui/StatsSheet.tsx` (bottom-sheet, role dialog/aria-modal, fermeture backdrop + Escape + bouton, reduced-motion)
- [x] `CareerScreen` : état `statsOpen`, ouverture via `DataChipRow.onOpen`
- [x] CSS bottom-sheet + stat bars ; test `StatsSheet.test.tsx`

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Le sheet est un overlay (pas de navigation) → la position de lecture est préservée par nature. Profondeur modale = 1.
- Fermeture : clic backdrop, touche Escape, bouton « Fermer ». `role="dialog"` + `aria-modal`. Animation slide-up désactivée sous `prefers-reduced-motion` (a11y de base ; trap de focus complet = Story 5.3).
- Barres pour les canaux 0–100 (combat + Forme/Mental/Réputation) ; followers/€ en nombres.
- 31 tests ; `test`/`lint`/`build` verts.
### File List
Nouveaux : `src/ui/StatBar.tsx`, `src/ui/StatsSheet.tsx`, `src/ui/StatsSheet.test.tsx` · Modifiés : `src/ui/CareerScreen.tsx`, `src/ui/index.ts`, `src/ui/game.css`

## Change Log
- 2026-07-27 — Story 1.9 : dashboard stats en bottom-sheet (statBars, dismiss non destructif, reduced-motion). 1 test. Statut → review.
