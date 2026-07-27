# Story 2.3: Écran de résultat de combat

Status: review

## Story
As a joueur, I want voir clairement le résultat de mon combat et ses conséquences, so that je comprenne l'impact sur ma carrière.

## Acceptance Criteria
1. `resultBanner` avec la couleur sémantique du Degré (victoire/défaite/upset) + deltas (UX-DR9). ✅
2. « Continuer » reprend le cours de la carrière (événement/année suivant). ✅

## Tasks / Subtasks
- [x] `ui/OpponentCard.tsx` : carte d'adversaire (nom, archétype, palmarès, jauge de niveau) avant combat
- [x] `ui/ResultBanner.tsx` : bannière graduée (tones win/poor/upset/loss), méthode, mention ceinture, deltas
- [x] `ui/labels.ts` : `changeChip` (delta de combat → puce signée)
- [x] `ui/CareerScreen` : intègre OpponentCard (pré-combat) + ResultBanner (résultat) + « Continuer »
- [x] CSS `game.css` : styles carte adversaire + bannière
- [x] Tests `ui/ResultBanner.test.tsx` (2)

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Bannière avec bordure gauche colorée + fond lavé selon le degré (lime victoire/upset, ambre médiocre, corail défaite) ; `role="status" aria-live="polite"` pour l'annonce lecteur d'écran (amorce Story 5.3).
- Carte d'adversaire : jauge de niveau ambre→corail, palmarès flavor.
- 48 tests ; `typecheck`/`lint`/`test` verts. **Epic 2 terminée : le combat est authentiquement MMA.**
### File List
Nouveaux : `src/ui/OpponentCard.tsx`, `src/ui/ResultBanner.tsx`, `src/ui/ResultBanner.test.tsx` · Modifiés : `src/ui/CareerScreen.tsx`, `src/ui/labels.ts`, `src/ui/index.ts`, `src/ui/game.css`

## Change Log
- 2026-07-27 — Story 2.3 : écran de résultat de combat (resultBanner + carte adversaire). 2 tests. Statut → review. **Epic 2 terminée.**
