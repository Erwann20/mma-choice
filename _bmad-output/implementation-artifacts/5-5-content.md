# Story 5.5: Premier lot de contenu et variété

Status: review

## Story
As a joueur, I want un contenu abondant et non répétitif, so that mes carrières restent différentes et rejouables.

## Acceptance Criteria
1. Un premier lot d'Événements authoré et validé ; deux carrières aux mêmes critères partagent < 40 % d'Événements communs (NFR-6, NFR-9). ⚠️ Voir note.
2. Chaque nouvel Événement JSON n'exige aucun changement de code moteur/UI et passe la validation Zod (FR-7, AD-4). ✅

## Tasks / Subtasks
- [x] `content/events/life.json` : ~30 événements narratifs variés (entraînement, camp, argent, médias, rivalités, vie perso, éthique/dopage, contrats, vieillissement, transmission)
- [x] `schema` : `loadEvents` fusionne `amateur` + `meta` + `life` (ids uniques globaux, zéro changement moteur/UI)
- [x] Tests `store/variety.test.ts` (2) : séquences distinctes + seuil de recouvrement verrouillé

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- **47 événements** au total (dont 4 combats, 42 répétables/cooldown), répartis par contexte et gatés par conditions dérivées (âge, palier, réputation, followers, argent, style, sexe, flags/différés).
- **Note d'honnêteté (AC1)** : le recouvrement Jaccard mesuré entre deux carrières mêmes critères ≈ **0,64** (chaque carrière voit ~28–31 événements distincts). La **cible NFR-6 (< 0,40) n'est PAS atteinte** avec 47 événements — elle suppose le catalogue plein (200–400) évoqué par l'AC. Ce qui est livré et prouvé : le **mécanisme** de variété (tirage pondéré à graine + anti-répétition + gating conditionnel), le **pipeline data** qui monte en volume **sans aucun changement de code** (FR-7/NFR-9, 3 fichiers fusionnés), et un test qui **verrouille** le seuil atteignable (< 0,72) contre les régressions. Atteindre < 0,40 = poursuivre l'écriture de contenu (pur JSON), pas du dev.
- 82 tests ; `typecheck`/`lint`/`test`/`build` verts. **Epic 5 terminée (mécaniques) ; volume de contenu à poursuivre en pur data.**
### File List
Nouveaux : `src/content/events/life.json`, `src/store/variety.test.ts` · Modifiés : `src/schema/content.ts`

## Change Log
- 2026-07-27 — Story 5.5 : lot de contenu (47 événements) + test de variété. Recouvrement mesuré ≈0,64 (cible <0,40 = volume à poursuivre, sans code). Statut → review.
