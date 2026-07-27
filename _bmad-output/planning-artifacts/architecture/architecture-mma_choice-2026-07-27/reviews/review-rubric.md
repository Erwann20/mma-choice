# Good-Spine Rubric Review — ARCHITECTURE-SPINE.md (MMA Choice)

- **Artifact:** `_bmad-output/planning-artifacts/architecture/architecture-mma_choice-2026-07-27/ARCHITECTURE-SPINE.md`
- **Reviewed:** 2026-07-27
- **Calibration:** Lean front-only React SPA game, solo dev + AI assistant. Enterprise rigor (CI gates, multi-env, observability, formal ADR ceremony) is explicitly out of scope. Findings are weighted to that stake.
- **Overall verdict:** **MINOR-FIXES** (close to ship-ready). The spine is coherent, correctly scoped, and its core paradigm is well chosen for the problem. The fixes below are small and mostly one-liners; none block downstream epic breakdown.

---

## 1. Does it fix the real divergence points for features→epics, and miss none?

**PASS.** The Capability→Architecture Map covers all 16 FRs from the PRD, with no orphans:

| FR group | Mapped | Governed by |
| --- | --- | --- |
| FR-1,2,3,15 (creation, evolving style) | ✓ | AD-4, conventions |
| FR-4,5,6 (annual progression, tiers, dashboard) | ✓ | AD-1, AD-2 |
| FR-7,8,9 (event engine, pools, deferred flags) | ✓ | AD-4, AD-5, AD-6 |
| FR-10,16 (graduated combat, opponent gen) | ✓ | AD-1, AD-3 |
| FR-11,12,13 (money/social/health) | ✓ | AD-1 |
| FR-14 (end + score /100) | ✓ | AD-3 |

The spine also correctly identifies the *structural* divergence risks an initiative-altitude spine owns and pins each: module dependency direction (AD-1), state ownership (AD-2), determinism (AD-3), content contract (AD-4/5), pool selection (AD-6), persistence boundary (AD-7), navigation/state split (AD-8), deployment shape (AD-9). It also ties SM-3 (< 40% shared events across same-criteria careers) directly to the AD-6 weighted anti-repeat mechanism — the metric is architecturally supported. This is the right set; nothing structural is missing.

---

## 2. Is every AD's Rule ENFORCEABLE and does it prevent its stated divergence?

Mostly yes. Each rule is a concrete prohibition/prescription rather than an aspiration, and each maps to its "Prevents" clause. Two observations:

**2a. AD-1 and AD-3 are review-only, not machine-enforced (MINOR).**
- AD-1 ("`src/engine` imports nothing from React/Zustand/PrimeUI/Router/DOM; the arrow direction is an invariant") and AD-3 ("`Math.random()` is forbidden in `src/engine`") are the two invariants an AI coding assistant is *most* likely to violate silently — an AI will happily `import { useStore }` into a reducer or reach for `Math.random()` for a quick draw. At this stake a single ESLint guard turns each from a hope into a guarantee, and it is cheap:
  - AD-1: `import/no-restricted-paths` (or `eslint-plugin-boundaries`) forbidding `src/engine/**` from importing `store|ui|routes|react|zustand`.
  - AD-3: `no-restricted-globals` / `no-restricted-properties` scoped to `src/engine/**` banning `Math.random`.
- Recommendation: add one line to each rule ("enforced by ESLint boundary/no-restricted rule") and list ESLint in the Stack. This is the single highest-leverage change for a solo+AI build; without it these invariants rely entirely on discipline the toolchain never checks.

**2b. AD-4 "fails at build" has no wiring (MINOR).** AD-4 says invalid content "échoue au build/chargement." Load-time failure is clear (Zod `.parse()` throws). Build-time failure has no owner — there is no mentioned validation script or Vite plugin that parses `content/**` during `vite build`. Either add a `validate-content` step (a tiny node script running the Zod schemas over the JSON, wired into the build) or soften the rule to "fails at load" and drop the build claim. As written the stronger half of the guarantee is unenforced.

All other rules (AD-2 single mutation path, AD-5 closed effect/condition union, AD-6 pool algorithm, AD-7 single localStorage writer under one versioned key, AD-8 store-is-truth, AD-9 no backend) are enforceable by construction and correctly prevent their divergence.

**2c. Status-tag inconsistency (MINOR, hygiene).** AD-1/2/3/4/7/9 carry `[ADOPTED]`; **AD-5, AD-6, AD-8 carry no status tag.** These are not lesser rules — AD-5 and AD-6 *are* the event engine, the stated core of the product. Untagged, they read as provisional. Either tag all `[ADOPTED]` or state the convention. Cheap to fix, avoids a downstream reader treating the core ADs as unsettled.

---

## 3. Could anything under Deferred let two independently-built units diverge?

**Mostly safe, one soft spot.** Walking each deferral:

- **Score formula** — lives in `engine/score.ts`+`config.ts`, code-owned, single consumer. Safe.
- **Opponent-generation algorithm** — internal to `engine/combat`, code-owned. Safe (and its determinism is already pinned by AD-3, so reproducibility can't diverge even though the algorithm is open).
- **Content authoring / AI pipeline** — output is still gated by the AD-4 Zod contract, so however content is produced it can't diverge in shape. Safe.
- **"Revivre" / "Mission du jour" modes** — same engine (AD-1), only content + seed config remain; out of V1. Safe.
- **Persistent meta-progression** — door left open by AD-7 + `saveVersion`. Safe.
- **Test setup** — see §5.
- **PrimeUI styling approach (themed vs unstyled/Tailwind)** — **this is the one deferral with genuine cross-unit divergence potential.** Styling approach is a cross-cutting convention every UI epic consumes. If screens are built at different times (even by the same solo dev), one themed and one Tailwind-based, the UI layer diverges visually and structurally with no invariant to catch it. Combined with PrimeUI itself being unpinned (§4), the UI dimension is the softest in the spine. At lean stake this is acceptable to defer, but it should be the *first* thing decided when the first UI epic starts, not drifted into. Recommend a one-line note: "styling approach is chosen once, before the first `ui/` epic, and applies to all screens."

No deferral touches the functional core's contract, so the parts most at risk from parallel construction (engine, schema) are all pinned.

---

## 4. Is the named tech verified-current?

**PASS, trusting the provided web-verification.** React 19.2, TanStack Router 1.170, Vite 8, Zod 4.4 were web-verified by the caller and are reflected accurately in the Stack table. PrimeUI, Zustand, pure-rand, and TypeScript are honestly marked "à épingler au bind" rather than given false precision — appropriate.

One good instinct worth keeping visible: PrimeUI (successor to PrimeReact) carries the note "vérifier l'intégration React 19 + Vite tôt." That is the correct risk flag — it is the least-proven dependency (React 19 compat + Vite 8), it is unpinned, and it sits under the softest dimension (§3). No change needed to the versions; just keep that spike genuinely early.

---

## 5. Is every dimension the altitude owns decided/deferred/open? Any whole SILENT dimension?

**No whole dimension is silent.** Sweep:

| Dimension | Status |
| --- | --- |
| Module boundaries / dep direction | AD-1 ✓ |
| State ownership & mutation | AD-2 ✓ |
| Determinism / RNG | AD-3 ✓ |
| Content contract | AD-4/5 ✓ |
| Event selection | AD-6 ✓ |
| Persistence | AD-7 ✓ |
| Navigation vs state | AD-8 ✓ |
| **Deployment** | **AD-9 ✓ (static assets, CDN, no backend)** |
| Naming / data formats | Conventions ✓ |
| Error handling | Conventions (fail-at-load, no silent degradation) ✓ |
| Logging / auth / i18n | Conventions (none / none / FR V1) ✓ — correctly decided-as-absent |
| **Build** | Partially covered (Vite) but content-validation step unwired — §2b |
| **Test** | Deferred to "implied by AD-1" — soft, see below |
| Environments / CI | Not mentioned — acceptable N/A for single static target, solo dev |

**Operational/environmental envelope specifically:** Deployment is covered well by AD-9. Build is covered at the "Vite → static assets" level, which is adequate for the altitude, with the one gap that the AD-4 build-time content validation has no home (§2b). Environments/CI are legitimately N/A for a front-only static game with one deploy target — not a silent omission, just genuinely empty.

**Test dimension (MINOR):** deferring test setup to "impliqué par AD-1, pas un invariant" undersells it. The *entire justification* for the Functional Core paradigm is that the core is cheaply and deterministically unit-testable — AD-3's seeded RNG exists precisely so `reduce`/`resolveCombat`/`computeScore` are testable to the assertion. Leaving testing as a pure implication risks the payoff never being collected. This does not need to become an AD, but one Consistency-Convention line ("the pure core in `src/engine` is unit-tested with Vitest; determinism per AD-3 makes fixtures reproducible") would convert an implication into a norm at near-zero cost. Acceptable to ship without at this stake, but recommended.

---

## 6. Is the core (event engine, AD-4/5/6) specified well enough for downstream architecture?

**Strong, with one contract asymmetry to close.**

What's good:
- **AD-4** nails the content-as-data contract: one Zod schema per content type, TS type *derived* via `z.infer` (single source of truth, redeclaration forbidden). This is exactly the invariant that keeps the schema epic and the content-authoring epic from diverging.
- **AD-5** is the strongest AD in the spine. Effects as pure data `{ target, op, value }`, conditions as declarative predicates, content never executable, and — critically — the effect/condition *types* form a **closed, versioned set extended in the engine, never invented per event.** That closed union is precisely what prevents "logique planquée dans le contenu" and keeps every content author inside one vocabulary the engine can interpret.
- **AD-6** specifies the pool algorithm concretely enough to build: filter all events on trigger conditions against current `GameState`, exclude "seen"-flagged events unless `repeatable`, weighted seeded draw (AD-3), set the seen flag on play, and delayed flags gate re-entry until a delay elapses. This directly and sufficiently backs FR-7/8/9 and SM-3.

The one gap:
- **The condition/predicate shape is under-specified relative to the effect shape (MINOR–MEDIUM, top core finding).** AD-5 gives effects a concrete, buildable JSON shape (`{ target, op, value }`) but describes conditions only as "prédicats déclaratifs sur les champs de `GameState`." That asymmetry matters because the condition format is the trickier of the two — it must express field comparisons, flag presence/absence, tier/division gating, and almost certainly AND/OR composition (FR-5 threshold gating, FR-9 branching all need it). It is exactly the seam where the **schema epic** (author of the condition Zod schema) and the **engine epic** (interpreter of conditions) can build to two different mental models and diverge. Engine ownership of the *interpreter* is fine; but the spine should pin the *shape* of a condition object the way it pinned the effect object — e.g. one line: "a condition is a declarative predicate object over `GameState` fields (`{ field, op, value }`), composable via `all`/`any`; the operator set is part of the same closed versioned union as effects." Without it, the closed-union guarantee of AD-5 has a hole exactly where content and engine meet.

Reproducibility chain (FR-14) is intact: seed+counter live in `GameState` (AD-3/AD-7), combat and opponent generation draw from that seeded stream, so "same seed + same choices → identical career + identical score" holds even though the opponent algorithm itself is deferred. The Deferred opponent-gen algorithm cannot break reproducibility because determinism is pinned upstream. Good separation.

---

## Findings summary (ranked by severity)

1. **[Core, MINOR–MEDIUM] AD-5 condition contract asymmetry** — effects have a concrete `{target,op,value}` shape; conditions are only "declarative predicates" with no pinned shape. This is the schema-epic ↔ engine-epic seam and the likeliest place two units diverge. Pin the condition object shape + composition (`all`/`any`) as part of the same closed versioned union.
2. **[Hygiene, MINOR] Status tags inconsistent** — AD-5, AD-6, AD-8 lack `[ADOPTED]`; the two core-engine ADs reading as untagged/provisional is misleading. Tag them.
3. **[Enforceability, MINOR] AD-1 & AD-3 are review-only** — the two invariants an AI assistant most easily violates. Add ESLint `import/no-restricted-paths` (engine boundary) and `no-restricted-globals` (no `Math.random` in engine); list ESLint in Stack. Cheap, high leverage.
4. **[Coverage, MINOR] Test dimension + AD-4 build-time validation are soft** — testing is left as an implication of the paradigm whose whole point is testability (add a one-line Vitest convention); AD-4's "fails at build" has no wired validation step (add a `validate-content` build step or soften to "fails at load").
5. **[Deferred, MINOR] UI dimension is the softest** — PrimeUI unpinned + styling approach (themed vs Tailwind) deferred; both feed every UI epic. Acceptable to defer, but decide styling once before the first `ui/` epic and keep the PrimeUI+React 19+Vite spike genuinely early.

None of these block the epics→stories breakdown. Address #1 and #2 before generating event-engine epics; #3–#5 can land as the corresponding epics start.
