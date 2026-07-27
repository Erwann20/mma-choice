# Story 5.4: Patterns d'état soignés et microcopie

Status: review

## Story
As a joueur, I want des états de chargement/erreur clairs et une écriture cohérente, so that l'expérience soit fluide et crédible.

## Acceptance Criteria
1. Chargement ⇒ `skeleton` ; messages système via `toast` (UX-DR10,12,16). ✅
2. Toutes les chaînes visibles suivent la voix sobre, 2ᵉ personne, français (UX-DR18). ✅

## Tasks / Subtasks
- [x] `ui/Skeleton.tsx` + CSS shimmer (respectant reduced-motion via la règle globale)
- [x] `ui/CareerScreen` : repli Skeleton sur transition (session sans événement prêt)
- [x] Export barrel ; Toast déjà utilisé pour reprise / partage
- [x] Tests `ui/Skeleton.test.tsx` (1) ; revue microcopie

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Le contenu étant validé au build (imports JSON synchrones), il n'y a pas de vrai chargement asynchrone en V1 ; le `skeleton` couvre honnêtement les frames de transition et sert de socle réutilisable — signalé `aria-busy`.
- Messages système centralisés sur le composant `Toast` (reprise sauvegardée, score copié, partage indisponible).
- Microcopie déjà homogène : 2ᵉ personne, ton sobre, français, sur accueil / création / carrière / combat / récap (UX-DR18).
- 80 tests ; `typecheck`/`lint`/`test` verts.
### File List
Nouveaux : `src/ui/Skeleton.tsx`, `src/ui/Skeleton.test.tsx` · Modifiés : `src/ui/CareerScreen.tsx`, `src/ui/game.css`, `src/ui/index.ts`

## Change Log
- 2026-07-27 — Story 5.4 : skeleton de chargement + patterns d'état ; revue microcopie. 1 test. Statut → review.
