# Story 2.2: Résolution graduée du combat

Status: review

## Story
As a joueur, I want que mes choix pendant le combat déterminent la manière de gagner ou perdre, so that un bon combat rapporte plus qu'une victoire terne.

## Acceptance Criteria
1. Degré de victoire parmi : victoire nette / médiocre / défaite / upset (FR-10). ✅
2. Adversaire nettement plus faible + mauvais choix ⇒ gagner « moche » (faible gain). ✅
3. Adversaire fort + bons choix ⇒ upset (fort bond) ; mauvais choix ⇒ défaite + risque de blessure. ✅

## Tasks / Subtasks
- [x] `schema` : `fight` sur l'événement (+ `titleFight`), `tactic` sur le choix
- [x] `engine/combat.ts` : `resolveFight(state, event, choice, opponent)` → degré + deltas + palmarès (PUR)
- [x] `engine/config.ts` : `PURSE_BY_TIER` (bourses par palier)
- [x] `store/session.ts` : `opponent`/`lastResult` dans Session+SavedSession, `pickNext` (génère l'adversaire sur un combat), `continueAfterFight`
- [x] `store/game.ts` : action `continueFight`
- [x] `content` : événement de combat `fight-amateur-carte-locale` (3 tactiques)
- [x] `ui/CareerScreen` : affichage adversaire + écran résultat minimal (affiné en 2.3)
- [x] Tests `engine/combat-resolve.test.ts` (5)

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Résolution PUR/déterministe : `perf = tactique×0.6 + cardio×0.2 + mental×0.2` (+12 si la tactique exploite la faiblesse adverse, +6 si elle colle au style), `margin = perf − niveau adverse + bruit(±10 à graine)`.
- Degré : win + outsider ⇒ **upset** ; win + margin≥20 ⇒ **nette** ; win sinon ⇒ **médiocre** ; sinon **défaite**. Récompenses (répu/followers/bourse/forme) modulées par le degré ; palmarès (wins/losses/finishes) mis à jour.
- Blessure (`flag blessure`) posée sur défaite quand la forme est ≤ 35 (ébauche FR-13, approfondie en 4.3).
- Combat intégré à la boucle : `pickNext` génère l'adversaire quand l'événement est un combat ; l'écran s'arrête sur le résultat puis `continueFight` reprend le cours.
- 46 tests ; `typecheck`/`lint`/`test`/`build` verts.
### File List
Nouveaux : `src/engine/combat-resolve.test.ts` · Modifiés : `src/engine/combat.ts`, `src/engine/config.ts`, `src/engine/index.ts`, `src/schema/content.ts`, `src/store/session.ts`, `src/store/game.ts`, `src/content/events/amateur.json`, `src/ui/CareerScreen.tsx`

## Change Log
- 2026-07-27 — Story 2.2 : résolution graduée du combat (degré, deltas, palmarès) + intégration boucle. 5 tests. Statut → review.
