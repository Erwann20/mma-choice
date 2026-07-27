# Story 4.3: Santé, blessures et coupe de poids

Status: review

## Story
As a joueur, I want gérer l'usure de mon corps, so that mes décisions physiques aient un coût réaliste.

## Acceptance Criteria
1. Combats, blessures et coupes de poids dégradent la Forme/Santé ; une blessure peut poser un flag (FR-13). ✅
2. Changer de Division déclenche un événement de coupe de poids avec impact Forme/Santé. ✅

## Tasks / Subtasks
- [x] `schema` : condition `sex` + effet `setDivision` sur le choix
- [x] `engine/events.ts` : `evalCondition` gère `sex`
- [x] `engine/effects.ts` : `applyChoice` change de division ET arme le flag `coupe_de_poids`
- [x] `content` : `evt-coupe-de-poids` (flag), `evt-blessure` (flag), `evt-pesee-limite`, `evt-changer-categorie-h/f` (sex-gated, `setDivision`)
- [x] Tests `engine/health.test.ts` (4)

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Coût physique bouclé : la défaite entame la forme + pose `blessure` (Story 2.2) ; `evt-blessure` gère la convalescence ; `evt-pesee-limite` modélise l'usure des coupes récurrentes.
- Changement de division piloté par la data (`setDivision`) : le moteur pose déterministe le flag `coupe_de_poids`, consommé par `evt-coupe-de-poids` (impact forme). Événements de montée de catégorie gatés par le sexe (nouvelle condition `sex`).
- 69 tests ; `typecheck`/`lint`/`test` verts. **Epic 4 terminée : argent, réseaux et santé s'entrelacent aux choix.**
### File List
Nouveaux : `src/engine/health.test.ts` · Modifiés : `src/schema/content.ts`, `src/engine/events.ts`, `src/engine/effects.ts`, `src/content/events/meta.json`

## Change Log
- 2026-07-27 — Story 4.3 : santé/blessure/coupe de poids + changement de division. 4 tests. Statut → review. **Epic 4 terminée.**
