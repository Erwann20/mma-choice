---
baseline_commit: NO_VCS
---

# Story 1.1: Scaffold du projet et garde-fous d'architecture

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a développeur,
I want une application Vite + React + TanStack Router + Zustand + Zod + pure-rand échafaudée avec des garde-fous de lint,
so that toutes les stories suivantes reposent sur une base conforme à la spine d'architecture et que les invariants (pureté du moteur, déterminisme) soient impossibles à violer par accident.

## Acceptance Criteria

1. **Le projet démarre, se build et se teste.** `npm run dev`, `npm run build` et `npm run test` (Vitest) réussissent sur une page d'accueil minimale. *(Source: epics.md#Story-1.1)*
2. **Dépendances épinglées** aux versions de la spine : React 19.2, TanStack Router 1.170, Zustand 5, `primereact` ^11 + `@primeuix/themes` + `primeicons`, Zod 4.4, Vite 8, pure-rand 8.4, Vitest. *(Source: ARCHITECTURE-SPINE.md#Stack)*
3. **Garde-fou de pureté du moteur (AD-1)** : ESLint échoue si un fichier de `src/engine/` importe React, le store, l'UI ou les routes.
4. **Garde-fou de déterminisme (AD-3)** : ESLint échoue si un fichier de `src/engine/` utilise `Math.random`.
5. **Squelette de dossiers** conforme au Structural Seed de la spine (`engine/`, `schema/`, `content/`, `store/`, `routes/`, `ui/`).

## Tasks / Subtasks

- [ ] **Task 1 — Scaffold Vite react-ts** (AC: 1, 2)
  - [ ] `npm create vite@latest . -- --template react-ts` (Node 20+ requis pour Vite 8)
  - [ ] Épingler les versions exactes dans `package.json` (voir Dev Notes → Versions)
  - [ ] Vérifier `npm run dev` et `npm run build`
- [ ] **Task 2 — Squelette de dossiers** (AC: 5)
  - [ ] Créer `src/{engine,schema,content,store,routes,ui}/` avec un fichier `index.ts` placeholder par dossier (commentaire de rôle, cf. Structural Seed). Le contenu réel arrive dans les stories suivantes.
- [ ] **Task 3 — TanStack Router** (AC: 1)
  - [ ] Installer `@tanstack/react-router` + `-D @tanstack/router-plugin`
  - [ ] Ajouter le plugin dans `vite.config.ts` **avant** `react()` (voir Dev Notes)
  - [ ] Créer `src/routes/__root.tsx` + `src/routes/index.tsx` (page d'accueil vide « MMA CHOICE ») ; bootstrap `RouterProvider` dans `main.tsx`
- [ ] **Task 4 — PrimeReact 11 + thème sombre** (AC: 1)
  - [ ] Installer `primereact@11 @primeuix/themes primeicons`
  - [ ] Envelopper l'app dans `PrimeReactProvider` (import depuis `@primereact/core`) avec le preset `Aura` et `darkModeSelector: '.dark'`
  - [ ] Poser la classe `dark` sur `<html>` (le jeu est sombre par défaut, cf. DESIGN.md). Importer `primeicons/primeicons.css`. *(Les tokens de couleur/typo précis = Story 1.6 ; ici, juste le câblage du provider.)*
- [ ] **Task 5 — Dépendances du moteur** (AC: 2)
  - [ ] Installer `zustand@5 zod@4 pure-rand@8` (utilisées dès les stories 1.2–1.3–1.10 ; pas de code métier ici)
- [ ] **Task 6 — Garde-fous ESLint (flat config)** (AC: 3, 4)
  - [ ] `eslint.config.js` : override `files: ['src/engine/**']` avec `no-restricted-imports` (patterns `react`, `**/store/**`, `**/ui/**`, `**/routes/**`) et `no-restricted-properties` (objet `Math`, propriété `random`)
  - [ ] ⚠️ Utiliser **`no-restricted-properties`**, PAS `no-restricted-globals` (voir Dev Notes → Piège)
  - [ ] `npm run lint` dans `package.json`
- [ ] **Task 7 — Vitest + test de fumée** (AC: 1)
  - [ ] Installer `-D vitest @testing-library/react @testing-library/jest-dom jsdom`
  - [ ] Config `test: { globals: true, environment: 'jsdom', setupFiles: './src/test-setup.ts' }` ; `test-setup.ts` importe `@testing-library/jest-dom/vitest`
  - [ ] Un test de fumée qui monte la page d'accueil et vérifie « MMA CHOICE »
- [ ] **Task 8 — Vérifier les garde-fous** (AC: 3, 4)
  - [ ] Prouver que le lint échoue sur une violation : ajouter temporairement dans un fichier `src/engine/` un `import React` et un `Math.random()`, lancer `npm run lint`, constater 2 erreurs, puis retirer.

## Dev Notes

### Paradigme & invariants (à respecter absolument)
- **Functional Core / Imperative Shell (AD-1)** : `src/engine` est PUR — aucun import de React/Zustand/PrimeReact/TanStack/DOM. `store`/`routes`/`ui` peuvent importer `engine`, jamais l'inverse. *(Source: ARCHITECTURE-SPINE.md#AD-1)*
- **Déterminisme (AD-3)** : aucun `Math.random()` dans `engine` ; tout l'aléatoire passera par un PRNG à graine (pure-rand) sérialisable. *(Source: ARCHITECTURE-SPINE.md#AD-3)*
- Cette story ne fait que **câbler** ces garde-fous ; l'implémentation du moteur/store/contenu arrive aux stories 1.2+.

### Versions (épingler exactement)
| Package | Version | Note |
|---|---|---|
| vite | ^8.1 | Rolldown ; Node 20+ requis |
| create-vite | 9.x | `--template react-ts` |
| react / react-dom | ^19.2 | baseline de primereact 11 |
| typescript | latest | |
| @tanstack/react-router | ^1.170 | |
| @tanstack/router-plugin | ^1.168 | (versionné à part, compatible ^1.170) |
| primereact | ^11.0 | ⚠️ provider dans `@primereact/core` |
| @primeuix/themes | ^3.0 | preset `Aura` |
| primeicons | latest | |
| zustand | ^5.0 | |
| zod | ^4.4 | |
| pure-rand | ^8.4 | API mutable (voir 1.2) |
| vitest | ^4.1 | supporte Vite 8 |

### Config exacte (évite les erreurs de setup)

**`vite.config.ts`** — plugin router AVANT react :
```ts
import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [ tanstackRouter({ target: 'react', autoCodeSplitting: true }), react() ],
  test: { globals: true, environment: 'jsdom', setupFiles: './src/test-setup.ts' },
})
```
Le plugin génère `src/routeTree.gen.ts` à partir de `src/routes/`. Bootstrap : `createRouter({ routeTree })` puis `<RouterProvider router={router} />`.

**`main.tsx`** — PrimeReact 11 :
```ts
import { PrimeReactProvider } from '@primereact/core'   // ⚠️ PAS 'primereact/core'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
// <PrimeReactProvider theme={{ preset: Aura, options: { darkModeSelector: '.dark' } }}>
// poser className="dark" sur <html> (jeu sombre par défaut, cf. DESIGN.md)
```

**`eslint.config.js`** (flat config) — le garde-fou :
```js
{ files: ['src/engine/**'], rules: {
  'no-restricted-imports': ['error', { patterns: ['react', '**/store/**', '**/ui/**', '**/routes/**'] }],
  'no-restricted-properties': ['error', { object: 'Math', property: 'random', message: 'Utilise le PRNG à graine (AD-3).' }],
}}
```

### ⚠️ Piège à éviter (garantit l'AC-4)
`no-restricted-globals` **ne bloque PAS** `Math.random` (c'est une propriété d'un objet global, pas un identifiant global bare). Il FAUT `no-restricted-properties` avec `{ object: 'Math', property: 'random' }`. Les epics/spine mentionnent « no-restricted-globals » par raccourci — l'implémentation correcte est `no-restricted-properties`.

### Structure de dossiers (Structural Seed — cible)
```
src/
  engine/   # cœur pur (AD-1) — vide pour l'instant
  schema/   # schémas Zod + types z.infer (Story 1.3)
  content/  # JSON de contenu (Story 1.3+)
  store/    # Zustand + persist (Story 1.2/1.10)
  routes/   # écrans TanStack Router
  ui/       # composants PrimeReact
```
*(Source: ARCHITECTURE-SPINE.md#Structural-Seed)*

### Standards de test
- Vitest sur le cœur pur (les stories 1.2+ testeront le moteur sans navigateur — un des bénéfices d'AD-1).
- Ici : un test de fumée React (`@testing-library/react` + jsdom) suffit.

### Hors périmètre (ne PAS faire dans cette story)
- Pas de logique moteur, pas de store réel, pas de schéma de contenu, pas de tokens de design complets (Story 1.6), pas de persistance réelle (Story 1.10). Uniquement le squelette + les garde-fous + le smoke test.

### Project Structure Notes
- Aligné sur le Structural Seed de la spine. Aucun conflit : projet greenfield, dossier `src/mma_choice` vide au départ.
- Le `routeTree.gen.ts` généré doit être en `.gitignore` ? Non — le convention TanStack le commit ; suivre la doc officielle. À trancher par le dev, sans impact sur les ACs.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.1] — user story + ACs
- [Source: _bmad-output/planning-artifacts/architecture/architecture-mma_choice-2026-07-27/ARCHITECTURE-SPINE.md#AD-1] — pureté du moteur
- [Source: ARCHITECTURE-SPINE.md#AD-3] — déterminisme / no Math.random
- [Source: ARCHITECTURE-SPINE.md#Stack] — versions
- [Source: ARCHITECTURE-SPINE.md#Structural-Seed] — arborescence
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-mma_choice-2026-07-27/DESIGN.md] — thème sombre (classe `dark`, preset Aura)
- Setup 2026 vérifié web : create-vite `--template react-ts` ; `@tanstack/router-plugin/vite` avant react ; `@primereact/core` + `@primeuix/themes/aura` ; Zustand `persist`+`createJSONStorage`; pure-rand `xoroshiro128plus`/`getState`; ESLint `no-restricted-properties` pour Math.random ; Vitest 4 + jsdom.

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
