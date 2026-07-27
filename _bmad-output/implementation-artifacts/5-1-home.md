# Story 5.1: Écran d'accueil à 3 modes

Status: review

## Story
As a joueur, I want voir les modes de jeu dès l'ouverture, so that je comprenne l'ambition du jeu et lance une carrière.

## Acceptance Criteria
1. 3 modes visibles : « Faire ma carrière » (jouable, primaire), « Revivre la carrière » et « Mission du jour » marqués *Bientôt* (UX-DR13). ✅
2. Taper un mode *Bientôt* ⇒ acquittement inline « Bientôt disponible » sans navigation. ✅

## Tasks / Subtasks
- [x] `ui/HomeScreen.tsx` : 3 cartes de mode, mode carrière primaire, badges *Bientôt* + ack inline
- [x] `ui/GameRoot` : branche accueil → HomeScreen
- [x] CSS accueil (`game.css`) ; export barrel ; MAJ test GameRoot
- [x] Tests `ui/HomeScreen.test.tsx` (3)

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Un seul bouton primaire (mode carrière) ; les modes différés restent visibles pour signaler l'ambition, avec `aria-disabled` et acquittement inline (aucune navigation, AD-8 respecté — le store reste la vérité).
- 72 tests ; `typecheck`/`lint`/`test` verts.
### File List
Nouveaux : `src/ui/HomeScreen.tsx`, `src/ui/HomeScreen.test.tsx` · Modifiés : `src/ui/GameRoot.tsx`, `src/ui/index.ts`, `src/ui/game.css`, `src/ui/GameRoot.test.tsx`

## Change Log
- 2026-07-27 — Story 5.1 : accueil à 3 modes (1 jouable, 2 « bientôt »). 3 tests. Statut → review.
