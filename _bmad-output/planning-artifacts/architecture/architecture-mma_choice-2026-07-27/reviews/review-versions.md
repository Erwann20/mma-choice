# Review — Reality-check of committed technology decisions (Stack)

- **Reviewed spine:** `ARCHITECTURE-SPINE.md` § Stack
- **Date:** 2026-07-27
- **Method:** Each named technology verified via web (npm / official docs / GitHub) for existence, current-version plausibility as of 2026, and fit for a front-only React SPA.
- **Verdict:** **ALL VERIFIED — with two minor caveats** (PrimeUI package-name precision; Vite 8 = fresh major). No non-existent, out-of-date, deprecated, or ill-fitting technology found. Every version in the spine matches what is currently shipping.

---

## Summary table

| Tech (spine) | Spine version | Current reality (2026) | Verdict |
| --- | --- | --- | --- |
| TypeScript | latest (à épingler) | current line ~5.x/6.x | OK — no version asserted |
| React | 19.2.x | 19.2.8 (21 Jul 2026); 19.2 line current, no React 20 announced | ✅ Confirmed, exact match |
| TanStack Router | 1.170.x | @tanstack/react-router 1.170.x is the current published line | ✅ Confirmed, exact match |
| PrimeUI (successor to PrimeReact) | à épingler | Ships as `primereact` **11.0.0** + `@primereact/ui` **11.0.0** under the PrimeUI umbrella; React 17/18/**19**; official Vite guide | ✅ Confirmed — real, shipping, React 19 + Vite; caveat below |
| Zustand (+ `persist`) | à épingler | 5.0.14; `persist` middleware defaults to localStorage, supported | ✅ Confirmed |
| Zod | 4.4.x | 4.4.3 (04 May 2026) | ✅ Confirmed, exact match |
| Vite | 8.x | 8.0 released 12 Mar 2026 (Rolldown, Rust bundler) | ✅ Confirmed; caveat below |
| pure-rand | à épingler | 8.4.0, actively maintained, TS-native, seeded PRNG | ✅ Confirmed, ideal fit |

---

## Per-technology findings

### TypeScript — OK
Spine intentionally leaves it at "latest (à épingler au bind)". No version is asserted, so nothing to falsify. TypeScript remains actively released. No action beyond pinning at build time.

### React — ✅ 19.2.x confirmed
Current published line is **19.2.x**; latest patch **19.2.8** (21 Jul 2026), preceded by 19.2.7 (Jun), 19.2.6 (May). React 19.2 itself shipped Oct 2025. No React 19.3 or React 20 announced — so `19.2.x` is precisely the live line, not a guess. Perfect fit for a front-only SPA.

### TanStack Router — ✅ 1.170.x confirmed
`@tanstack/react-router` is currently on the **1.170.x** line (multiple 1.170.x patches published within the last two weeks of the review date). Actively maintained across React/Vue/Solid. Client-side routing, no server dependency — fits AD-8 (route owns navigation, not game state) and AD-9 (front-only). Exact match.

### PrimeUI — ✅ HIGH-RISK ITEM CONFIRMED (real, shipping, React 19 + Vite)
This was flagged as the highest-risk item; verified rigorously:

- **PrimeUI exists and is real.** It is PrimeTek's "next chapter" — a sustainable, unified foundation/licensing home for PrimeNG (Angular), PrimeReact (React), and PrimeVue (Vue), plus a premium "PrimeUI PRO" tier. Announced at `primeui.dev/nextchapter`.
- **The old open-source repo was archived.** `github.com/primefaces/primereact` was **archived (read-only) on 28 Jun 2026**. This is a *governance/home move, not a deprecation of the React library*: existing MIT releases stay MIT forever, existing imports/package names keep working, and active development + new releases continue under the PrimeUI home.
- **The React library ships and is current.** The React components are published as **`primereact` v11.0.0** and **`@primereact/ui` v11.0.0** (both published ~11 days before review). `@primereact/ui` components are tree-shakable via subpath imports (`@primereact/ui/button`).
- **React 19 supported.** Peer range is `^17.0.0 || ^18.0.0 || ^19.0.0` — React 19 explicitly in range.
- **Vite supported.** An official Vite installation guide exists (`v11.primereact.org/docs/installation/vite`): `npm install primereact @primeuix/themes`, wrap app in `PrimeReactProvider`, use a theme preset (e.g. Aura). Theming is now via the `@primeuix/themes` package.

**Caveat (naming precision, not a blocker):** "PrimeUI" is the *umbrella/brand/foundation*, not the npm package you install. The spine's phrase "PrimeUI (successeur de PrimeReact)" is conceptually correct but slightly imprecise for a build instruction. When pinning at the bind, install the actual packages — **`primereact` (or `@primereact/ui`) ^11** plus **`@primeuix/themes`** — rather than a package literally named "primeui". Recommend the spine's pin line record these concrete package names to avoid a scaffolding dead-end. Also decide the theming approach (the spine already defers "thémé vs unstyled/Tailwind" — `@primeuix/themes` is the styled path).

### Zustand (+ persist) — ✅ confirmed
Current version **5.0.14**. The `persist` middleware (`zustand/middleware`) defaults to **localStorage** and supports `createJSONStorage` + `partialize` (to exclude non-serializable values). This directly satisfies AD-7 (persist as sole localStorage writer, single versioned key, JSON-serializable `GameState`) and AD-2 (single store owns state). Excellent fit.

### Zod — ✅ 4.4.x confirmed
Current stable **4.4.3** (04 May 2026); the 4.4.x line is live (4.5 only exists as canary). Matches the spine exactly. `z.infer` for type derivation (AD-4, single source of truth) and load-time throw on invalid content are core Zod features. Ideal fit.

### Vite — ✅ 8.x confirmed
**Vite 8.0** released **12 Mar 2026**; ships **Rolldown** (Rust bundler) as the single unified bundler, replacing the esbuild-dev/Rollup-prod split, with large build-speed gains and stated plugin compatibility. Compiles to static assets — fits AD-9 (front-only static deploy).

**Caveat (fresh major, not a blocker):** Vite 8 is the most significant architectural change since Vite 2 (Rolldown swap). Plugin compatibility is advertised as maintained, but for a brand-new project this is fine — just smoke-test the `@vitejs/plugin-react` + PrimeReact combination early (the spine already flags "vérifier l'intégration React 19 + Vite tôt" for PrimeUI, which naturally covers this). If any friction appears, Vite 7 is a trivial fallback.

### pure-rand — ✅ confirmed, ideal fit
Current version **8.4.0**, published within ~1 month of review, actively maintained (267+ dependents), written in TypeScript. It is a *pure, seedable* PRNG — exactly what AD-3 requires (seeded RNG whose state lives inside `GameState`, `Math.random()` banned in the engine, reproducible careers for FR-14). The spine's alternative "mulberry32 inline" is also a valid, dependency-free seeded PRNG. Either satisfies AD-3.

---

## Recommendations (non-blocking)
1. **PrimeUI pin:** record concrete install as `primereact`/`@primereact/ui` **^11** + `@primeuix/themes` in the bind, not a package named "primeui".
2. **Early smoke test:** validate React 19.2 + Vite 8 (Rolldown) + PrimeReact 11 provider/theme render together before deep feature work — the single highest integration risk, all three being recent.
3. **Otherwise pin as written.** React 19.2.x, TanStack Router 1.170.x, Zod 4.4.x, Vite 8.x, Zustand 5.x, pure-rand 8.x are all current, maintained, and correct for a front-only React SPA.

## Sources
- React releases: https://github.com/facebook/react/releases (19.2.8, 21 Jul 2026); https://react.dev/versions
- TanStack Router: https://www.npmjs.com/package/@tanstack/react-router ; https://github.com/TanStack/router/releases
- PrimeUI: https://primeui.dev/nextchapter ; https://github.com/primefaces/primereact (archived 28 Jun 2026) ; https://www.npmjs.com/package/primereact ; https://www.npmjs.com/package/@primereact/ui ; https://v11.primereact.org/docs/installation/vite
- Zustand: https://www.npmjs.com/package/zustand ; https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data
- Zod: https://www.npmjs.com/package/zod ; https://zod.dev/v4/versioning
- Vite 8: https://vite.dev/blog/announcing-vite8 ; https://www.infoq.com/news/2026/05/vite-v8-rust/
- pure-rand: https://www.npmjs.com/package/pure-rand
