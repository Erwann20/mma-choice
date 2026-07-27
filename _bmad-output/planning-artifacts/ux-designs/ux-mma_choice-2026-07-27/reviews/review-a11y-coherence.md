# Review — Accessibility Floor & Coherence

**Subject:** `DESIGN.md` + `EXPERIENCE.md` (ux-mma_choice-2026-07-27)
**Date:** 2026-07-27
**Reviewer:** automated contract review (a11y floor + internal coherence)
**Calibration:** lean side-project mobile web game — floor-level rigor, not enterprise. Findings are prioritized; nothing here is a launch blocker on its own.

## Verdict: **minor-fixes**

The a11y floor is genuinely strong for a side project — SR live-region announcements for stat deltas, `prefers-reduced-motion`, focus trapping, text scaling, and 48dp targets are all explicitly specified. All text colors clear WCAG AA. Coherence between the two docs is high: every `{components.*}` / `{colors.*}` token EXPERIENCE cites exists in DESIGN, no IA surface lacks a flow, no flow invents a surface, and no behavior contradicts the architecture constraints. The gaps are a small set of undeclared UI surfaces (toast, confirm dialog) and a WCAG 1.4.11 boundary-contrast note.

---

## 1. Accessibility Floor

### 1a. Contrast (computed WCAG 2.x ratios)

All ratios computed against actual backgrounds. Body-text threshold 4.5:1; large-text/UI 3:1.

| Foreground | Background | Ratio | Verdict |
|---|---|---|---|
| text `#E9EBF0` | bg `#0C0D10` | **16.29:1** | ✅ pass |
| text `#E9EBF0` | surface `#15171C` | **15.03:1** | ✅ pass |
| text-secondary `#A7ADBA` (event prose) | eventCard `#101216` | **8.33:1** | ✅ pass — excellent for the reading loop |
| text-secondary `#A7ADBA` | surface `#15171C` | **7.97:1** | ✅ pass |
| text-muted `#7A818E` | bg `#0C0D10` | **4.96:1** | ✅ pass |
| text-muted `#7A818E` | surface `#15171C` | **4.57:1** | ⚠️ pass, thin margin |
| text-faint `#4D525C` (choice index nums) | bg `#0C0D10` | **2.48:1** | ⚠️ below 4.5 — see finding A |
| text-faint `#4D525C` | surface `#15171C` | **2.29:1** | ⚠️ below 4.5 — see finding A |
| accent lime `#C7FF3D` | bg `#0C0D10` | **16.47:1** | ✅ pass |
| accent lime `#C7FF3D` | surface `#15171C` | **15.20:1** | ✅ pass |
| btnPrimary text `#0C0D10` on lime `#C7FF3D` | — | **16.47:1** | ✅ pass |
| danger coral `#FF7A6B` | surface `#15171C` | **7.04:1** | ✅ pass |
| warning amber `#E0B64A` | surface `#15171C` | **9.36:1** | ✅ pass |
| accent-dim `#8FBF2E` (stat fill) | sunken `#191B21` | **7.92:1** | ✅ pass (non-text) |
| **border `#262A32`** | bg `#0C0D10` | **1.35:1** | ❌ below 3:1 — see finding B |
| **border `#262A32`** | surface `#15171C` | **1.25:1** | ❌ below 3:1 — see finding B |
| **surface vs bg** (tonal step) | — | **1.08:1** | ❌ near-invisible step — see finding B |
| sunken `#191B21` vs surface `#15171C` | — | **1.04:1** | ❌ near-invisible step — see finding B |

**Finding A — text-faint `#4D525C` is sub-4.5:1 (2.29–2.48:1).** DESIGN scopes it to "de-emphasized ornament like choice index numbers (01/02/03)." That is defensible *only if* the index numbers carry zero information — but they are the label a screen reader would use to distinguish choices, and a sighted low-vision user may want to read "choice 2." Keep the color, but ensure the index is never the sole way to identify a choice (choice titles already are), and that it is decorative to AT. If it ever becomes semantically load-bearing, it must be lightened. **Low severity.**

**Finding B — hierarchy leans on sub-3:1 boundaries (WCAG 1.4.11).** DESIGN's stated mechanism is "separation is by lightness and a hairline border, not shadow." But the hairline border is ~1.3:1 against its neighbours and the surface-vs-background tonal step is only **1.08:1** (sunken-vs-surface 1.04:1). WCAG 1.4.11 wants 3:1 for the visual boundary of an *essential* control. Mitigation is real: choice cards and chips also carry a fill and text content, so the border is reinforcing rather than the sole cue — so this is not a hard failure. But on a **mobile game played outdoors in sunlight**, a 1.08:1 card-vs-canvas step is effectively invisible; card boundaries may vanish. Recommend nudging `border`/`border-strong` up a few points (or accepting a slightly stronger step for interactive surfaces only) so the choice-card outline reaches ≥3:1 against its background. **Medium severity — the only substantive contrast issue.**

**Note — text-muted at 4.57:1 on surface** (dataChip/statBar labels, 11–11.5px). Passes 4.5:1 but with almost no margin at the smallest sizes. Acceptable; just be aware there is no headroom if the surface ever darkens.

### 1b. Tap targets, focus, reduced motion, SR labels, text scaling

| Requirement | Status | Evidence |
|---|---|---|
| Tap targets ≥44px | ✅ **exceeds** — spec says ≥48dp | EXPERIENCE §Accessibility Floor; DESIGN buttons `minHeight: 48px`; choice cards full-width; chip *row* (not individual chip) is the target |
| Focus order | ✅ specified | "header → chips → event card → choices → primary action"; Création field→field→Valider; sheet traps focus, returns to chip row on close |
| Reduced motion | ✅ specified | Honors `prefers-reduced-motion`: skips stat-bar fill + sheet slide, snaps to value |
| SR labels for stat changes | ✅ **specified well** | Polite live region: "Réputation +8, maintenant 61 sur 100."; statBar carries accessible value; resultBanner announces grade+method on appear |
| Roles + state | ✅ specified | Choice cards as buttons; recommended state announced; locked modes as disabled + "bientôt disponible" |
| Text legibility / scaling (reading game) | ✅ specified | body tuned up to 15/1.6 for sustained reading; "Respect the OS/browser text-size setting… legible at the largest step with no truncated controls or clipped prose" |

**Minor gaps in 1b:**
- **Sheet grabber size** — listed as an interactive element "≥48dp," but DESIGN specifies only `grabberColor`, no dimensions. Since the sheet also dismisses via tap-outside and back gesture, the grabber is not a sole target; still, give it an explicit ≥44px hit area. **Low.**
- **Focus handling for the confirm dialog and Récap** is not spelled out (the sheet's is). Given "modal depth never exceeds one level," specify that the confirm dialog traps focus and returns it to the invoking button. **Low.**

---

## 2. Coherence

### 2a. Token references (EXPERIENCE → DESIGN)

Every token EXPERIENCE cites resolves in DESIGN. Spot-check:

- Components: `fighterHeader`, `dataChip`, `eventCard`, `choiceCard`, `buttonPrimary`, `buttonSecondary`, `bottomSheet`, `statBar`, `resultBanner` — **all present** in DESIGN `components:`.
- Colors: `{colors.success}`, `{colors.danger}`, `{colors.warning}` — **all present**.
- Typography: `{typography.display}`, `{typography.label}` — **present**.

No dangling token references. ✅

### 2b. Behavior vs architecture constraints

| Constraint | Honored? | Notes |
|---|---|---|
| Deterministic engine (AD-1/AD-3) | ✅ | "same start + same choices → same career"; RNG state restored on resume; score reproducible |
| localStorage resume (AD-7) | ✅ | one versioned key, one save slot, survives close/refresh/return; overwrite gated by explicit confirm |
| No account / zero-friction | ✅ | "first tap after 'Faire ma carrière' is character creation, never a wall" |
| Choice previews show only declared effects (AD-5) | ✅ | choiceCard "preview declared, deterministic effects only — never hidden or randomized" |
| Combat exception | ✅ coherent | Combat chips express *intent/risk*, not guaranteed outcome, because the deterministic engine computes the result against a calibrated opponent (FR-10/16). This does **not** contradict determinism — the outcome is still fixed given RNG state; only the *preview* differs. Consistent. |

No behavior contradicts an architecture constraint. ✅

### 2c. IA ↔ flows

IA surfaces: **Accueil, Création, Carrière/Événement, Stats (bottom-sheet), Récap.** Combat is explicitly an event *variant* of Carrière, not a surface.

- Every IA surface is exercised by a flow: Accueil, Création, Carrière, bottomSheet, Récap all appear in Flows 1–3. ✅
- No flow references a surface absent from the IA. ✅
- Navigation model (forward-by-commitment, single modal depth, sheet-over-Carrière) is internally consistent between IA and Interaction Primitives. ✅

---

## 3. Gaps (load-bearing, unspecified)

**Finding C — undeclared UI surfaces referenced by EXPERIENCE but absent from DESIGN's component set.** This is the strongest coherence gap. EXPERIENCE relies on three pieces of UI that have **no visual token or component** in DESIGN:

1. **Toast** — "Toast « Reprise sauvegardée. » fires on write" (State Patterns → Resume). No toast component, position, duration, or dismissal spec anywhere in DESIGN.
2. **Confirm dialog** — « Abandonner cette carrière ? » / « Nouvelle carrière » over an existing save. This is the **only guard against destructive data loss** in the whole product (Interaction Primitives call it out as such), yet it has no component spec. DESIGN mentions "any true modal" gets a shadow, but defines no modal/dialog component.
3. **Loading skeleton** — "quiet skeleton of the eventCard" (State Patterns → Loading). Derivable from eventCard, lowest concern.

For a lean project this is minor-fixes, not needs-work — but the confirm dialog in particular is load-bearing and should get at least a one-line component definition (reuse `bottomSheet` styling as a centered modal + `buttonPrimary`/`buttonSecondary`?) so a developer isn't inventing the only data-loss guard freehand. **Medium severity.**

**Finding D — locked-mode acknowledgement is self-flagged as inferred.** State Patterns literally annotates: "*[Exact ack treatment inferred — see report.]*" The inline "Bientôt disponible." note has no component. Since the docs already flag it, treat as a known TODO. **Low.**

**Finding E — combat choice-loop shape is thin.** Combat renders as an "event variant" resolving to a `resultBanner` + « Continuer ». Whether a fight is a single choice→result or a multi-exchange sequence of choiceCards is not specified at the UX layer (it's partly FR-10/16 territory). Flow 1 step 5 implies choices *produce* a result but not how many decision points a fight has. A developer can proceed with single-exchange, but confirm this is intended. **Low.**

**Finding F — style-evolution surfacing.** "the shift is stated once in-narrative — not as a system popup" (Choice & Consequence) and the stats sheet reflects the new style label. Fine, but there's no spec for *how* the narrative statement is authored/triggered — likely a content rule, not a UX gap. **Informational.**

---

## Priority summary

| # | Finding | Severity | Fix |
|---|---|---|---|
| B | Card/surface boundaries sub-3:1 (surface-vs-bg **1.08:1**, border **1.25–1.35:1**) — WCAG 1.4.11, real risk outdoors | Medium | Raise border/tonal step so interactive card outlines reach ≥3:1 |
| C | Toast + confirm dialog (the only data-loss guard) + skeleton referenced by EXPERIENCE, absent from DESIGN | Medium | Add minimal component specs, esp. the confirm dialog |
| A | text-faint index nums **2.29–2.48:1** below 4.5 | Low | Keep decorative-only to AT; lighten if it ever carries meaning |
| — | text-muted **4.57:1** on surface — passes, no headroom | Low | Awareness only |
| D/E | Locked-mode ack (self-flagged) + combat choice-loop shape underspecified | Low | Confirm intent |

**Everything the brief asked to verify was checked.** All text passes AA; targets/focus/reduced-motion/SR-stat-labels/text-scaling are all specified; token references, architecture constraints, and IA↔flow mapping are coherent. The two real to-dos are the sub-3:1 UI boundaries and the undeclared toast/confirm-dialog components.
