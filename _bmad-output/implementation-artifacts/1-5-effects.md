# Story 1.5: Application des effets d'un choix

Status: review

## Story
As a joueur, I want que mes choix modifient mes stats/jauges de façon lisible, so that je ressente le poids de chaque décision.

## Acceptance Criteria
1. Effets déclarés `{target, op, value}` sur canaux valides ; stats/jauges bornées 0–100 ; flags posés (AD-5, FR-2). ✅
2. Dépassement borné à 0/100 (canaux bornés) ; followers/money libres (≥0). ✅

## Tasks / Subtasks
- [x] `engine/channels.ts` : `writeChannel` (bornage par canal via `clampStat`, followers/money ≥0)
- [x] `engine/effects.ts` : `applyEffect` (add/sub/set), `applyChoice` (effets + setFlags + armFlags différés + marque vu)
- [x] `schema/content.ts` : `armFlags` (conséquences différées) sur ChoiceSchema
- [x] Tests `engine/effects.test.ts` (5) : add/sub/set, bornage, non-mutation, applyChoice flags+vu, flag différé

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- `applyChoice(state, event, choice)` = transition atomique du choix : applique les effets bornés, pose les flags immédiats, arme les flags différés (`pending`, atAge = âge+inYears), puis `markEventConsumed`. Pur.
- Bornage : canaux de combat + health/mental/reputation → [0,100] ; followers/money → ≥0.
- L'orchestration (sélection de l'événement suivant, avancée d'année) reste au store (Story 1.7).
- 24 tests au total ; `test`/`lint`/`build` verts.
### File List
Nouveaux : `src/engine/effects.ts`, `src/engine/effects.test.ts` · Modifiés : `src/engine/channels.ts`, `src/schema/content.ts`, `src/engine/index.ts`

## Change Log
- 2026-07-27 — Story 1.5 : application des effets bornés (AD-5), applyChoice (flags + différés), armFlags au schéma. 5 tests. Statut → review.
