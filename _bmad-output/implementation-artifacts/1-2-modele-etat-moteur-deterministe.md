# Story 1.2: Modèle d'état et moteur déterministe

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur,
I want que l'état de ma carrière avance de façon déterministe,
so that mes choix produisent toujours le même résultat pour une même graine (score reproductible, base des 3 modes de jeu).

## Acceptance Criteria

1. **Reducer pur, voie de mutation unique (AD-2).** Un `reduce(state, action)` pur renvoie un nouvel état sans muter l'ancien ; c'est la seule façon de faire évoluer `GameState`. *(Source: epics.md#Story-1.2 ; ARCHITECTURE-SPINE.md#AD-2)*
2. **PRNG à graine sérialisable (AD-3).** Tout l'aléatoire passe par un PRNG dont l'état sérialisable vit dans `GameState` ; rejouer la même séquence d'actions depuis la même graine produit un état final identique au bit près. *(Source: ARCHITECTURE-SPINE.md#AD-3)*
3. **Avancer d'une année + âge-out (FR-4).** Une action « avancer d'une année » augmente l'âge ; à l'âge-limite, la carrière passe en phase « retraite ». *(Source: epics.md#Story-1.2, PRD FR-4)*

## Tasks / Subtasks

- [ ] **Task 1 — `GameState` + état initial** (AC: 1, 2)
  - [ ] `src/engine/state.ts` : type `GameState` (combattant {nom, sexe, pays, âge}, `division`, `style`, `stats` {striking, grappling, ground, cardio}, `meta` {health, mental, reputation, followers, money}, `flags`, `rng` (état sérialisable), `seed`, `phase: 'career' | 'retired'`, `saveVersion`)
  - [ ] Factory `createInitialState(seed, setup)` renvoyant un `GameState` valide. `GameState` doit être **100 % JSON-sérialisable** (AD-7) : que des types primitifs/objets/tableaux, aucune fonction ni instance de classe.
- [ ] **Task 2 — PRNG à graine sérialisable** (AC: 2)
  - [ ] `src/engine/rng.ts` : wrapper PUR autour de `pure-rand` (`xoroshiro128plus`). Exposer `initRng(seed): RngState` et `nextInt(rng: RngState, min, max): [value: number, next: RngState]` (voir Dev Notes → pure-rand)
  - [ ] `RngState` = le tableau `number[]` renvoyé par `getState()` (sérialisable). Aucune closure/fonction stockée dans l'état.
- [ ] **Task 3 — `Action` + `reduce` pur** (AC: 1, 3)
  - [ ] `src/engine/actions.ts` : type `Action` (union fermée ; commence par `{ type: 'ADVANCE_YEAR' }`)
  - [ ] `src/engine/reducer.ts` : `reduce(state, action): GameState` pur — ne mute jamais `state` (retour d'un nouvel objet). `ADVANCE_YEAR` → `age + 1` ; si `age >= RETIREMENT_AGE` → `phase: 'retired'`
  - [ ] `src/engine/config.ts` : constantes de réglage (`RETIREMENT_AGE`, bornes de stats 0–100…)
- [ ] **Task 4 — Baril d'exports** (AC: 1)
  - [ ] `src/engine/index.ts` : ré-exporter `GameState`, `Action`, `reduce`, `createInitialState`, les helpers RNG (remplacer le `export {}` placeholder)
- [ ] **Task 5 — Tests du moteur** (AC: 1, 2, 3)
  - [ ] `src/engine/reducer.test.ts` : (a) `reduce` ne mute pas l'entrée (l'objet d'origine est inchangé) ; (b) déterminisme : deux `GameState` de même graine passés par la même séquence d'actions sont **strictement égaux** (`toEqual`) ; (c) âge-out : après assez d'`ADVANCE_YEAR`, `phase === 'retired'`
  - [ ] `src/engine/rng.test.ts` : `nextInt` est déterministe pour un même état ; l'état renvoyé, ré-injecté, reproduit la même suite (round-trip sérialisation)
- [ ] **Task 6 — Vérifs** (AC: all)
  - [ ] `npm run test` (tous verts), `npm run lint` (0 erreur — le moteur reste pur, aucun import framework), `npm run build`

## Dev Notes

### Invariants à respecter
- **AD-1 (pureté)** : `src/engine` n'importe RIEN de React/store/ui/routes. `pure-rand` et `zod` sont autorisés (libs pures). ⚠️ Les garde-fous ESLint de la Story 1.1 bloquent déjà React/store/ui/routes/zustand/@tanstack/primereact dans `engine` — respecte-les.
- **AD-2** : `reduce` est la SEULE voie de mutation. Pas de setters, pas de mutation en place. Utilise le spread / des copies.
- **AD-3** : `Math.random` est INTERDIT dans `engine` (ESLint `no-restricted-properties` échoue). Tout l'aléatoire via `rng.ts`.
- **AD-7 (anticipation)** : `GameState` doit rester **JSON-sérialisable** (aucune fonction/closure/classe) car il sera persisté en localStorage (Story 1.10). Le RNG y est stocké en **état** (`number[]`), pas en générateur.

### pure-rand 8.4 — API exacte (mutable → wrapper pur)
`pure-rand` v8 a une API **mutable** (`getState()`/`fromState()` pour la sérialisation) :
```ts
import { xoroshiro128plus, xoroshiro128plusFromState } from 'pure-rand/generator/xoroshiro128plus'
import { uniformInt } from 'pure-rand/distribution/uniformInt'

export type RngState = readonly number[]

export function initRng(seed: number): RngState {
  return xoroshiro128plus(seed).getState()
}

export function nextInt(state: RngState, min: number, max: number): [number, RngState] {
  const gen = xoroshiro128plusFromState(state)   // reconstruit depuis l'état
  const value = uniformInt(gen, min, max)         // tire ET mute `gen`
  return [value, gen.getState()]                  // renvoie l'état suivant (sérialisable)
}
```
Le wrapper est **pur** : il ne mute pas `state` (il reconstruit un générateur local). `getState()` renvoie un `number[]` sérialisable → parfait pour `GameState.rng`.
⚠️ Beaucoup d'exemples en ligne montrent l'API tuple `next()` d'anciennes versions — ignore-les, utilise `getState()`/`fromState()`.

### Forme de `GameState` (guide, ajuste au besoin)
```ts
export interface GameState {
  saveVersion: number
  seed: number
  rng: RngState
  phase: 'career' | 'retired'
  fighter: { name: string; sex: 'M' | 'F'; country: string; age: number }
  division: string   // id de division (slug) — grille remplie Story 1.3+
  style: 'striker' | 'wrestler' | 'grappler' | 'allrounder'
  stats: { striking: number; grappling: number; ground: number; cardio: number }
  meta: { health: number; mental: number; reputation: number; followers: number; money: number }
  flags: Record<string, number | boolean>
}
```
`createInitialState(seed, setup)` : `age` de départ ~18, stats/jauges normalisées 0–100, `rng: initRng(seed)`, `phase: 'career'`, `saveVersion: 1`, `flags: {}`. `setup` = données de création (sexe/pays/division/style) — l'écran de création réel est Story 1.8 ; ici un `setup` par défaut/paramétré suffit pour les tests.

### Périmètre
- **Ceci n'est que le moteur pur + ses tests** — testable sans navigateur (bénéfice d'AD-1). Pas de store Zustand, pas d'UI, pas de contenu/schéma (Story 1.3), pas de persistance réelle (Story 1.10). N'ajoute qu'`ADVANCE_YEAR` comme action ; les autres actions (choix, combat…) viennent plus tard.
- Ne câble PAS encore le moteur à l'UI. `main.tsx`/routes restent inchangés.

### Standards de test
- Vitest (déjà configuré Story 1.1, `globals: true`, env jsdom). Pour le moteur, pas besoin de jsdom mais ça ne gêne pas. Importe `{ describe, it, expect }` depuis `'vitest'` (types).
- Déterminisme : compare avec `expect(a).toEqual(b)` sur des `GameState` complets.
- Non-mutation : garde une copie profonde (ex. `structuredClone`) de l'entrée et vérifie qu'elle est inchangée après `reduce`.

### Project Structure Notes
- Fichiers dans `src/engine/` uniquement (+ leurs tests). Remplace le placeholder `src/engine/index.ts` (actuellement `export {}`).
- Aligné sur le Structural Seed de la spine.

### Previous Story Intelligence (Story 1.1)
- Scaffold en place : Vite 8, React 19.2, TanStack Router (file-based, `routeTree.gen.ts` commité), PrimeReact 11 (thème Aura sombre), Zustand 5, Zod 4.4, pure-rand 8.4, Vitest 4.1.
- **Garde-fous ESLint actifs** sur `src/engine/**` : `no-restricted-imports` (React/store/ui/routes/libs UI) + `no-restricted-properties` (`Math.random`). Écris le moteur en conséquence.
- TS strict : `verbatimModuleSyntax` (utilise `import type` pour les types), `noUnusedLocals`/`noUnusedParameters`, `erasableSyntaxOnly` (pas d'`enum`/`namespace` — utilise des unions de littéraux comme ci-dessus).
- Commandes : `npm run test` / `npm run lint` / `npm run build`.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.2]
- [Source: ARCHITECTURE-SPINE.md#AD-2] — état unique, voie de mutation unique
- [Source: ARCHITECTURE-SPINE.md#AD-3] — RNG à graine, état sérialisable, no Math.random
- [Source: ARCHITECTURE-SPINE.md#AD-7] — GameState JSON-sérialisable (persistance à venir)
- [Source: PRD FR-4] — déroulé annuel + âge-out
- pure-rand 8.4 : générateur `xoroshiro128plus` + `getState`/`fromState` + `uniformInt` (vérifié web)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
