# Story 1.6: Socle de tokens visuels (thème Fight night sombre)

Status: review

## Story
As a joueur, I want une interface sombre cohérente et lisible, so that la lecture soit confortable sur mobile.

## Acceptance Criteria
1. Tokens de DESIGN.md (couleurs Direction B, typo Inter, spacing, rounded) en variables CSS, appliqués globalement (fond charbon, accent lime, Inter). ✅

## Tasks / Subtasks
- [x] `src/ui/tokens.css` : variables CSS (couleurs, typo, spacing, rayons) depuis DESIGN.md + base globale (fond, texte, `#root` mobile-first max 560px)
- [x] `src/index.css` : `@import` des tokens + styles d'accueil via variables
- [x] Build/lint/test verts

## Dev Agent Record
### Agent Model Used
claude-opus-4-8 (Amelia)
### Completion Notes List
- Tokens exposés en variables CSS (`--color-*`, `--fs-*`, `--space-*`, `--radius-*`) — consommés par les futurs composants custom.
- Police : Inter avec fallback système (pas de fetch réseau ; `@fontsource-variable/inter` possible plus tard pour l'auto-hébergement).
- `#root` mobile-first : colonne unique centrée, largeur max 560px.
- Story CSS pure → pas de test unitaire (la porte est le build vert). 24 tests moteur inchangés.
### File List
Nouveaux : `src/ui/tokens.css` · Modifiés : `src/index.css`

## Change Log
- 2026-07-27 — Story 1.6 : socle de tokens Direction B en variables CSS + base mobile-first. Statut → review.
