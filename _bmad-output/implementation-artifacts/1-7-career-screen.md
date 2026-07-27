# Story 1.7: Écran de carrière / événement + store

Status: review

## Story
As a joueur, I want lire un événement et choisir parmi des options claires, so that je fasse avancer ma carrière.

## Acceptance Criteria
1. Écran mobile-first : fighterHeader + rangée de dataChip + eventCard + choiceCards (2–4), une unité de lecture (UX-DR2,3,5,6,19). ✅
2. choiceCard n'affiche que les effets déclarés/déterministes (AD-5). ✅
3. Tap sur un choix → effets appliqués + événement suivant sélectionné + écran à jour. ✅

## Tasks / Subtasks
- [x] `store/session.ts` (PUR) : `Session`, `startCareer`, `chooseInSession` (applyChoice → avance d'année tous les EVENTS_PER_YEAR → âge-out → sélection suivante)
- [x] `store/game.ts` : store Zustand fin (`newCareer`/`choose`/`reset`), graine aléatoire par carrière (hors moteur)
- [x] Composants custom : `FighterHeader`, `DataChipRow`, `EventCard`, `ChoiceCard`, `CareerScreen`, `GameRoot` + `labels.ts` + `game.css`
- [x] Route `/` → `GameRoot` ; smoke test `GameRoot.test.tsx`
- [x] `engine/config.ts` : `EVENTS_PER_YEAR = 3`
- [x] Tests `store/session.test.ts` (4) : départ, avance d'année, fin de carrière, déterminisme

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Boucle : `GameRoot` (départ → carrière → récap minimal) ; `CareerScreen` lit le store et dispatche `choose(i)`.
- Logique de boucle PURE dans `store/session.ts` (testable sans navigateur) ; Zustand n'est qu'un conteneur (AD-2).
- Aperçu d'effets : `ChoiceCard` rend uniquement les effets **déclarés** (puces up/down/neutral), jamais d'issue cachée (AD-5).
- Graine aléatoire par carrière (variété) posée dans le store (Math.random autorisé hors moteur).
- Ancien `HomeScreen` (placeholder 1.1) supprimé, remplacé par `GameRoot`. 28 tests ; `test`/`lint`/`build` verts.
### File List
Nouveaux : `src/store/session.ts`, `src/store/game.ts`, `src/store/session.test.ts`, `src/ui/{labels.ts,game.css,FighterHeader.tsx,DataChipRow.tsx,EventCard.tsx,ChoiceCard.tsx,CareerScreen.tsx,GameRoot.tsx,GameRoot.test.tsx}` · Modifiés : `src/ui/index.ts`, `src/routes/index.tsx`, `src/engine/config.ts` · Supprimés : `src/ui/HomeScreen.tsx`, `src/ui/HomeScreen.test.tsx`

## Change Log
- 2026-07-27 — Story 1.7 : store Zustand + écran de carrière custom → jeu jouable de bout en bout (création par défaut → événements → choix → âge-out). 4 tests session. Statut → review.
