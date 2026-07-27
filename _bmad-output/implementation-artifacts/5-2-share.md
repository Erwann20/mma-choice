# Story 5.2: Partage du score de fin de carrière

Status: review

## Story
As a joueur, I want partager mon score de carrière, so that je puisse défier mes amis (moteur viral).

## Acceptance Criteria
1. « Partager mon score » ⇒ Web Share API, fallback copie presse-papiers si indisponible (UX-DR15, FR-14). ✅
2. Tout se fait côté client, sans appel serveur (AD-9). ✅

## Tasks / Subtasks
- [x] `ui/share.ts` : `buildShareText` + `shareScore` (Web Share → clipboard → failed), ne lève jamais
- [x] `ui/RecapScreen` : bouton « Partager mon score » + toast de retour (copié / indisponible)
- [x] Tests `ui/share.test.ts` (4) : carte, Web Share, fallback presse-papiers, échec

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- 100 % client (AD-9) : aucune requête réseau. Dégradation gracieuse Web Share → presse-papiers → message d'indisponibilité ; l'annulation du partage bascule sur le presse-papiers.
- Carte de score sobre (2ᵉ personne) : score/100, rang, palmarès, mention champion.
- 76 tests ; `typecheck`/`lint`/`test` verts.
### File List
Nouveaux : `src/ui/share.ts`, `src/ui/share.test.ts` · Modifiés : `src/ui/RecapScreen.tsx`

## Change Log
- 2026-07-27 — Story 5.2 : partage du score (Web Share + presse-papiers). 4 tests. Statut → review.
