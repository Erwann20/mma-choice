# Story 3.2: Ceintures de division

Status: review

## Story
As a joueur, I want combattre pour et défendre des ceintures, so that j'aie un objectif clair et prestigieux.

## Acceptance Criteria
1. Combat de titre gagné (palier + réputation suffisants) ⇒ ceinture remportée, enregistrée, comptée au Score (FR-5/14). ✅
2. Perte d'un combat de titre en étant champion ⇒ perte de la ceinture, enregistrée. ✅

## Tasks / Subtasks
- [x] `engine/combat.ts` : logique de titre dans `resolveFight` (conquête / défense / perte) + prime de prestige
- [x] `engine/score.ts` : score refondu (palmarès, ceinture + défenses, palier) tout en restant borné/déterministe
- [x] `content` : combat de titre `fight-title-shot` (tier≥2 ET réputation≥60)
- [x] `ui/RecapScreen` : temps forts palmarès + statut champion + palier max
- [x] Tests `engine/belts.test.ts` (4)

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Combat `titleFight` : victoire sans ceinture ⇒ conquête (`wonBelt`) ; victoire en tant que champion ⇒ défense (`titleDefenses++`) ; défaite en tant que champion ⇒ perte (`lostBelt`). Prime de prestige (réputation/followers) sur titre gagné.
- Score V2 : combat 24 % + bilan sportif 24 % (taux de victoire + volume + finitions) + réputation 20 % + prestige 14 % (palier + ceinture) + followers 10 % + longévité 8 %. Bornes/déterminisme préservés (tests de score toujours verts).
- `ResultBanner` affiche déjà la mention ceinture (Story 2.3).
- 59 tests ; `typecheck`/`lint`/`test` verts.
### File List
Nouveaux : `src/engine/belts.test.ts` · Modifiés : `src/engine/combat.ts`, `src/engine/score.ts`, `src/content/events/amateur.json`, `src/ui/RecapScreen.tsx`

## Change Log
- 2026-07-27 — Story 3.2 : ceintures de division (conquête/défense/perte) + score enrichi. 4 tests. Statut → review.
