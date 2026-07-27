# Story 4.2: Réseaux sociaux — followers et buzz

Status: review

## Story
As a joueur, I want gérer ma présence sur les réseaux, so that je gagne en visibilité et en opportunités.

## Acceptance Criteria
1. Victoires + événements de trash talk/clash ⇒ Followers augmentent, débloquant sponsors et plus gros combats (FR-12). ✅
2. Un événement de clash propose ≥1 choix à fort gain de Followers avec risque de bad buzz (baisse Mental/Réputation). ✅

## Tasks / Subtasks
- [x] `content` : `evt-clash-conference` (choix clash = +4000 followers, arme un `bad_buzz` différé) + `evt-bad-buzz` (conséquence, baisse Mental/Réputation)
- [x] Tests `engine/social.test.ts` (2) : arme différée + éligibilité après délai

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Le « risque » de bad buzz est modélisé de façon déterministe et honnête (AD-5) : le clash affiche son gain de followers immédiat ET arme une conséquence différée (`armFlags`, FR-9) ; un an plus tard, `evt-bad-buzz` se déclenche et fait payer la note (Mental/Réputation). Le choix de gestion (assumer / s'excuser) referme le flag.
- Les followers gagnés alimentent déjà les seuils sponsors (Story 4.1) et de combats — la boucle de visibilité est bouclée.
- 65 tests ; `typecheck`/`lint`/`test` verts.
### File List
Nouveaux : `src/engine/social.test.ts` · Modifiés : `src/content/events/meta.json`

## Change Log
- 2026-07-27 — Story 4.2 : clash/trash-talk + bad buzz différé. 2 tests. Statut → review.
