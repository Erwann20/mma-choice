---
title: "Reconciliation — PRD ↔ Architecture Spine (MMA Choice)"
type: review
subtype: reconcile-prd
status: draft
created: 2026-07-27
reviewer: reconciliation-pass
sources:
  - _bmad-output/planning-artifacts/prds/prd-mma_choice-2026-07-27/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-mma_choice-2026-07-27/ARCHITECTURE-SPINE.md
---

# Reconciliation — What the spine failed to carry over

**Verdict: MINOR-GAPS.**

The spine carries **all 16 FRs** — every FR has an explicit home in the Capability→Architecture Map and is bound by at least one AD. The loud, functional core of the PRD (event engine, weighted+anti-repeat selection, deferred flags, graded combat, data-driven content, seeded reproducibility, score) is faithfully and often better structured than the PRD asked. The gaps are all in the **QUIET band** — the tone/feel/session-shape requirements that live between the lines of the PRD and that an AD-structured spine tends to drop because they aren't "logic." None are blocking; they are things to name before UX/epics so they don't silently evaporate.

---

## 1. FR-by-FR coverage (loud requirements) — ALL COVERED

| FR | PRD feature | Spine home | Governing AD | Status |
| --- | --- | --- | --- | --- |
| FR-1 identité (sexe/pays/âge) | 4.1 Création | `routes/create` + `engine/state` + `content/starting-criteria`, `content/divisions` | AD-4, conventions | ✅ |
| FR-2 critères de départ | 4.1 | idem | AD-4 | ✅ |
| FR-3 division UFC | 4.1 | `content/divisions` | AD-4 | ✅ |
| FR-4 déroulé annuel | 4.2 | `engine/reducer` + `store` + `ui` | AD-1, AD-2 | ✅ |
| FR-5 paliers/ceintures | 4.2 | `engine/reducer` | AD-1, AD-2 | ✅ |
| FR-6 dashboard temps réel | 4.2 | `engine/reducer` + `store` + `ui` | AD-1, AD-2 | ✅ |
| FR-7 schéma d'événement data | 4.3 | `engine/events` + `content/events` + `schema` | AD-4, AD-5, AD-6 | ✅ |
| FR-8 sélection pondérée + anti-répétition | 4.3 | `engine/events` | AD-6 | ✅ |
| FR-9 conséquences différées (flags) | 4.3 | `engine/events` | AD-5, AD-6 | ✅ |
| FR-10 issue graduée combat | 4.4 | `engine/combat` | AD-1, AD-3 | ✅ |
| FR-11 économie/sponsors | 4.5 | `engine/meta` | AD-1, conventions | ✅ |
| FR-12 réseaux sociaux | 4.5 | `engine/meta` | AD-1 | ✅ |
| FR-13 santé/blessures/coupe | 4.5 | `engine/meta` | AD-1 | ✅ |
| FR-14 score /100 + récap | 4.6 | `engine/score` | AD-3 (reproductibilité) | ✅ |
| FR-15 évolution du style | 4.1/4.2 | Création row (FR-1,2,3,**15**) + `engine/reducer` | AD-1, AD-4 | ✅ |
| FR-16 génération d'adversaire | 4.4 | `engine/combat` (Combat row FR-10,**16**) | AD-1, AD-3 | ✅ |

**No homeless FR.** The two out-of-sequence FRs (FR-15, FR-16) are both explicitly captured in the map rows, so the numbering gap in the PRD did not cause an omission.

Notable places the spine *improved* on the PRD rather than merely carrying it:
- **AD-3 (seeded PRNG in `GameState`)** turns FR-14's "score reproductible pour une même carrière" from an assertion into an enforced invariant, and pre-wires the deferred "défi du jour" (identical run for everyone).
- **AD-5 (closed, versioned effect/condition types; content declares, engine decides)** is stronger than FR-7 asked — it prevents content from smuggling executable logic, protecting the data-driven promise long-term.
- **AD-6** cleanly unifies FR-7/8/9 (pool build → "vu" flag exclusion → seeded weighted draw → delayed-flag gating).

---

## 2. QUIET requirements the AD structure silently dropped

### G1 — Mobile-friendly (MINOR GAP, worth naming)
- **PRD source:** §6.1 "Web app **mobile-friendly**"; UJ-1 is load-bearing — Karim opens it *on his phone, from a TikTok link, in the metro*. This is the primary acquisition + play surface, not a nice-to-have.
- **Spine coverage:** none. No invariant, convention, or Deferred note mentions responsive layout, viewport, or touch targets. PrimeUI is chosen and its styling approach is explicitly "code en est propriétaire" / deferred — which means *nobody currently owns the mobile requirement*.
- **Why it slipped:** it reads as "a UI detail," and the spine (correctly) keeps UI out of the invariant set. But "mobile-first / responsive" is a product constraint, not a component choice, and the whole core user journey assumes phone.
- **Recommendation:** add a one-line UI convention or a Deferred entry: "V1 layout is mobile-first / responsive; primary target is phone portrait (UJ-1)." Not an AD, but it should be written down so UX/epics inherit it.

### G2 — Session length "quelques minutes" / snackable "encore une" (MINOR GAP)
- **PRD source:** §1 ("une carrière complète se joue en **quelques minutes**", "pensé pour le « allez, encore une »"); JTBD §2.1 fonctionnel ("tuer 5 minutes"); counter-metric **SM-C1** (don't inflate #careers by *shortening* the career into meaninglessness).
- **Spine coverage:** partial/implicit only. Career length (~15-20 tours × ~2-5 events) is a **tuning value** that will live in `engine/config.ts` (the spine says config constants are grouped there). So the *mechanism* exists, but the "few-minutes session budget" is nowhere anchored as a design constraint — it's an emergent property of unset config.
- **Verdict:** acceptable for a lean side-project (it *is* a tuning concern), but the SM-C1 tension (session brevity vs. meaningfulness) has no owner. Flag so it isn't discovered late as "careers feel too long / too thin."

### G3 — Zero-friction / no account — COVERED
- **PRD:** §6.1 "**zéro friction** (pas de compte)"; §9 hypothesis.
- **Spine:** covered by conventions ("Pas d'auth en V1") + AD-7 (localStorage, no login) + AD-9 (front-only, no backend, no network for gameplay). Faithfully carried. ✅

### G4 — Free / no monetization — COVERED
- **PRD:** §5 Non-Goals, §6.1 "gratuit".
- **Spine:** AD-9 (static deploy, no backend) is consistent; nothing contradicts. ✅ (No cost/ads surface exists to drift.)

### G5 — Realism / "ton réaliste et crédible" + SM-C2 (variety-vs-coherence) — MOSTLY COVERED
- **PRD:** §1 tone (real UFC divisions, weight cuts, injuries, sponsors, McGregor-style callouts); counter-metric **SM-C2** (don't maximize variety at the cost of events *incohérents avec le contexte*).
- **Spine:** the *coherence enforcement mechanism* is present — AD-5 declarative trigger conditions + AD-6 pool filtering on `GameState` guarantee an event only fires when its context predicate holds, which is exactly the guardrail SM-C2 needs. FR-3 pins divisions to real UFC grids.
- **Residual:** tone/realism of the *prose* is a content-authoring concern, structurally out of scope — correct. But SM-C2 as a metric ("variety without incoherence") has no explicit anchor; it's satisfied *if authors write good trigger conditions*. The architecture enables it but does not enforce quality. Acceptable; note for content-authoring guidelines.

### G6 — Variety metric SM-3 (<40% overlap) — COVERED structurally, but see G7
- **PRD:** SM-3 validated by FR-7/FR-8; the differentiator ("deux carrières ne se ressemblent jamais").
- **Spine:** AD-6 (seeded weighted draw + anti-repeat) is the direct mechanism. ✅ *as an engine capability.* The metric's *achievability*, however, depends on content volume — see G7.

---

## 3. Contradictions / drift verification

### D1 — localStorage (AD-7) vs. the PRD's snackable/ephemeral framing and open Q4 — VERIFIED as intentional evolution, NOT drift (but a silent resolution)
- **The task's hypothesis** was: "PRD said sessionStorage-like snackable but spine chose localStorage." **Finding: the PRD never specified sessionStorage.** It says only "sauvegarde locale navigateur" (§6.1) / "sauvegarde navigateur" (§9), and it explicitly leaves the behavior **open** in §8 Q4: *"comportement si le joueur ferme l'onglet en pleine carrière (reprise ou perte ?)."*
- **What the spine did:** AD-7 chooses **localStorage** via Zustand `persist`, single versioned key (`mmachoice.save.v1`), `saveVersion` for migration — i.e. it decides **"reprise" (persist/resume)** and, via the Deferred entry, deliberately opens the door to meta-progression (badges/Panthéon/daily challenge).
- **Assessment:** this is a **defensible, forward-looking evolution**, not a drift. localStorage is the right substrate for the fast-follow social/meta-progression modes the PRD names in §6.2, and it's consistent with AD-9 (front-only). It does **not** contradict the "snackable / encore une" vibe — persistence is orthogonal to session length (you can resume *and* still play a full career in minutes).
- **The one thing to flag:** AD-7 **silently resolves open PRD question Q4** ("reprise ou perte?") in favor of *reprise*, without recording that it did so. That's a legitimate architect's call, but it should be surfaced back to the PRD as "Q4 resolved: careers persist and resume." There is also a mild latent tension worth a sentence in the spine: a persistent single-slot save means "closing the tab mid-career = resume the same career," which slightly cuts against the pure "fresh run every time" reading of "encore une." Recommend one explicit line stating the intended close-tab behavior (resume in-progress career; a new career overwrites the slot).

### D2 — Content authoring pipeline / volume (200-400 events) — DEFERRED by spine vs. PRD's declared CRITICAL PATH (tension, not contradiction)
- **PRD:** §8 Q1 calls the 200-400 event first-lot the project's **"chemin critique"**; Q2 says maintaining that volume "**probablement** un format d'authoring simple (voire un outil/éditeur ou une génération assistée)"; §9 hypothesis repeats "nécessite un format/outil d'authoring de masse (à valider — chemin critique)." SM-3 (<40% overlap) is only *reachable* at sufficient volume.
- **Spine:** explicitly **Deferred** — "V1 = JSON écrit à la main ou généré par IA, validé par Zod (le contrat AD-4 suffit). Revisiter quand le volume l'exigera."
- **Assessment:** reasonable for a lean side-project — the *contract* (AD-4 Zod schema + `z.infer` single source of truth) is exactly what makes AI-generation or a future editor safe, so the architecture doesn't block it. **But** the spine downgrades to "detail, revisit later" the very thing the PRD flags as the #1 project risk. That is a legitimate scope decision, yet it means the critical path is unowned in V1. Recommend the spine explicitly acknowledge: "the AD-4 JSON+Zod contract *is* the authoring interface for V1; mass-authoring tooling is deferred but the content volume (SM-3) is the product's critical path and should gate the schema's ergonomics." Otherwise the schema may be designed for the engine's convenience, not the author's throughput.

---

## 4. Non-Goals / constraints — consistent
- No real-time combat sim (§5) → narrative+stats resolution in `engine/combat`, no combat-loop module. ✅
- No multi-fighter/stable management (§5) → single `Fighter`/`Career` in the entity model. ✅
- No mandatory accounts / online leaderboards / multiplayer V1 (§5) → AD-9 front-only, no auth. ✅ (Panthéon/social correctly Deferred.)
- French V1 → conventions ("Langue V1 = français, textes dans le contenu"). ✅

---

## 5. Summary of gaps (priority order)

1. **G1 — Mobile-friendly** has no home (PRD §6.1 + UJ-1). Add a UI/responsive convention; it's load-bearing for the core journey.
2. **D2 — Content authoring / 200-400 events** is the PRD's declared critical path (§8 Q1/Q2, §9) but the spine defers it; the AD-4 contract enables it but nobody owns volume/ergonomics in V1.
3. **D1 — AD-7 localStorage** silently resolves open PRD Q4 (reprise vs perte) as "resume"; verified intentional & forward-looking (enables §6.2 meta-progression), not drift — but should be recorded as a resolution and the close-tab behavior stated in one line.
4. **G2 — Session length "quelques minutes" / SM-C1** is an unowned tuning constraint (lives in `config.ts` but unanchored as a design budget).
5. **G5/G6 — SM-C2 realism-coherence & SM-3 variety** are structurally enabled by AD-5/AD-6 but their *quality* depends on content authoring discipline; note for content guidelines, not an architecture defect.

**Bottom line:** the spine is a faithful and in places stronger carrier of the PRD's functional core — no FR was lost. The misses are the quiet product-feel requirements (mobile-first, session budget) and one silently-resolved open question (persistence). All are one-line fixes to the spine/conventions, not structural rework.
