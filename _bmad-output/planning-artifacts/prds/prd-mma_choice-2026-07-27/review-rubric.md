# PRD Quality Review — MMA Choice

*Reviewed against `prd-validation-checklist.md`. Calibration: LEAN side-project / hobby scope (a browser MMA-career choice game, "Destiny Eleven for MMA"). Rigor expectations dialed down accordingly; the substance bar still applies. Document language: French.*

## Overall verdict

**Minor-fixes (effectively ship-ready for a side-project).** This is a genuinely good lean PRD: it has a real thesis (the event engine is the product, and "no two careers alike" is the bet), the Vision is specific rather than swappable, and the Success Metrics are tied to FRs *with counter-metrics* — unusual maturity for a hobby doc. What's at risk is confined to the core the PRD itself names as priority #1: the event engine (§4.3) and combat resolution (§4.4) have two load-bearing under-specifications — deferred/scheduled consequences vs. flag-gating, and opponent generation — that downstream architecture will trip on. Everything else is clean, coherent, and internally consistent, with only cosmetic mechanical drift.

## Decision-readiness — strong

A decision-maker can act on this. The central bet is stated as a decision, not smuggled in as a consideration: §1 says outright that "toute la valeur du produit repose sur un moteur d'événements riche et bien organisé — c'est la priorité n°1 et le vrai défi (la data)", and §8 Q1 flags content volume as "le chemin critique du projet." Trade-offs are named with what's given up: §2.2 explicitly excludes real-time-sim / manager fans; §5 Non-Goals cut real-time combat, stable management, accounts, monetization. The Open Questions are actually open — Q1 (content volume), Q4 (save/resume behavior), Q5 (difficulty source), Q6 (women's Featherweight) are real forks, not rhetorical. The `[NOTE FOR PM]` on the Score formula (FR-14) and on the viral "Revivre la carrière" mode (§6.2) sit at real tensions.

No findings.

## Substance over theater — strong

Little furniture here. The Vision is category-specific and could *not* swap into another PRD unchanged — "callout façon McGregor", IMMAF amateur circuit, coupes de poids, "du néant au sommet — ou à la médiocrité." No persona theater: exactly one active protagonist (Karim, UJ-1), well-drawn and load-bearing; UJ-2 is honestly parked as a §6.2 pointer, not padded into a fake persona. The four JTBD (émotionnel / fonctionnel / social / rejouabilité) each map to a product decision. The Success Metrics are the strongest signal against theater — SM-1/2/3 measure the thesis (replay, completion, variety), not vanity activity, and SM-C1/C2 explicitly name what *not* to optimize.

No findings.

## Strategic coherence — strong

The PRD reads as a thesis, not a backlog. Feature ordering follows the bet: §4.3 (the engine) is marked *cœur du produit*, and the whole doc is organized so creation → progression feed events, events feed combats, combats feed meta-systems, meta feeds the final Score. MVP scope kind is an *experience/replayability* play and the scope logic matches (§6.1 keeps the full single-career loop + data-driven engine + a first content lot; §6.2 defers everything that merely *reuses* the engine). SMs validate the thesis and carry counter-metrics.

No findings.

## Done-ness clarity — adequate

Most FRs carry at least one testable consequence, and the "Consequences (testables)" convention is applied consistently. The soft spots:

### Findings
- **medium** Deferred consequences under-specified (§4.3 / FR-9) — The engine description says a Choix "peut poser des Flags **ou armer des conséquences différées**", and the Choix glossary entry says it can "déclencher des conséquences ultérieures." But FR-9 only specifies *flag-gated* unlocking (a passive precondition), which does not model a *scheduled* consequence that fires N turns later regardless of state. An engineer cannot tell whether "conséquences différées" == flag-gating (then the phrase is redundant) or a distinct time-delayed trigger (then there is no FR owning it). This is in the core the PRD calls priority #1. *Fix:* either state explicitly that "conséquences différées" are realized purely via Flags + Conditions de déclenchement (and drop the "armer" wording), or add an FR describing a scheduled/delayed-event mechanism with a testable consequence.
- **medium** Opponent generation has no owning FR (FR-10, depends on FR-3/FR-5) — FR-10 resolves a Combat from "la qualité des Choix" **and** "l'écart de niveau avec l'adversaire (Stats + Palier)", but no FR specifies how an opponent's Stats/level are generated or how they scale with Division/Palier. The "vivier d'adversaires" is referenced (FR-3, FR-5) but never defined as a capability. Combat resolution is not fully specifiable downstream without it. *Fix:* add a short FR (or a consequence under FR-5) defining opponent generation/scaling with one testable condition (e.g. "l'adversaire est tiré avec un niveau borné par le Palier courant ±X").
- **low** Two soft adjectives — FR-6 "reflète **en temps réel**" and FR-8 "séquences **sensiblement** différentes." FR-6 is fine in a turn-based context (means "after each Choix"). FR-8's "sensiblement" is rescued by SM-3's quantification (< 40 % common events), so it is testable-by-reference. *Fix:* reword FR-6 to "après chaque Choix"; optionally cite SM-3 inline from FR-8.

Note on deferred thresholds: many FRs defer numbers to "en data" (FR-5 seuils de Palier, FR-11 gains de camp, FR-15 règles de migration de Style). For a lean data-driven design this is acceptable and even correct — but it does mean "done" for the *balancing* FRs is defined by data that doesn't yet exist. That is an inherent property of the design, not a defect; flagged only so it is a conscious choice.

## Scope honesty — strong

Omissions are explicit, not inferred. §5 Non-Goals does real work (real-time combat, stable management, accounts/leaderboards/multiplayer, monetization all cut for V1). §6.2 de-scopes the fast-follow modes honestly, with rationale ("réutilise le moteur"). Hypotheses are tagged and indexed (§9). Open-items density is appropriate for the stakes — a handful of genuinely open questions on an explicitly exploratory side-project is healthy, not a blocker.

### Findings
- **low** Assumptions-index roundtrip is one-directional — §0 states the convention "les hypothèses sont taguées `[HYPOTHÈSE]` puis indexées (§9)", but only the content-volume hypothesis actually carries an inline `[HYPOTHÈSE]` tag (Q8.1). The other four index entries (mobile-friendly/zero-friction/free model; départ 16-18 ans; équipe solo; 4 stats + 5 jauges) appear only in the §9 index, not tagged at their point of use in §6.1 / FR-1 / §9-glossary. The index is complete; the *inline* half of the convention is not honored. *Fix:* add inline `[HYPOTHÈSE]` markers at the four points of first use, or soften §0 to say assumptions are "consolidées en §9."

## Downstream usability — adequate

The PRD is meant to feed UX → architecture → epics/stories (§0), so this dimension carries weight. The glossary (§3) is present and domain nouns are used consistently (spot-checked: Combattant, Événement, Choix, Pool d'événements, Flag, Palier, Division de poids, Degré de victoire, Score de carrière all defined and used identically). FR/UJ/SM IDs are unique and resolve; cross-references (SM→FR) all point at the right FRs (verified below). UJ-1 has a named protagonist carrying context inline. The one substantive risk is architectural extractability of the engine — see the two Done-ness findings, plus:

### Findings
- **low** Event cadence and weight semantics left implicit — §4.2/FR-4 says each year presents "une séquence d'Événements" but never bounds how many events per tour, and FR-7/FR-8 treat "poids" as a schema field without saying whether weights are static per event or context-dependent. §8 Q1 back-of-envelopes "~15-20 tours × quelques Événements ≈ 40-80 slots", but that estimate lives in an Open Question, not in the FRs the architect will source from. Acceptable for lean, but architecture will have to invent it. *Fix:* add a one-line consequence to FR-4 bounding events-per-year, and one word to FR-7/FR-8 on whether weights are static or dynamic.

## Shape fit — strong

The shape matches the product. This is a consumer-facing experience game, so a UJ with a named protagonist (Karim) is load-bearing and present; it is not over-formalized (no UJ sprawl — one active UJ, one parked). Rigor is appropriately light for hobby/solo while substance holds. UJ-2 as a stub pointer to §6.2 is the right call, not a floating UJ. No forcing.

No findings.

## Mechanical notes

- **Glossary drift (minor):** "Palier de carrière" is the glossary term; the body uses the shortened "Palier" throughout (FR-5, FR-10, etc.). Clear, but not identical. Similarly "Effets" is used capitalized as if a glossary term (FR-6, FR-7, Choix def.) but is only defined inline within the Choix entry, never as its own glossary line. Both are cosmetic.
- **ID continuity:** FR-1 through FR-15 all present, unique, none duplicated, none missing. FR-15 appears in §4.2 out of numeric sequence — **confirmed acceptable per global-stable-ID convention; not a defect.** UJ-1, UJ-2 present. SM-1/2/3 + SM-C1/C2 present.
- **SM → FR cross-refs (all valid):** SM-1 → FR-8 (variété/anti-répétition) ✓; SM-2 → FR-4, FR-14 (déroulé annuel + score/récap → completion) ✓; SM-3 → FR-7, FR-8 (schema data + sélection) ✓; SM-C1 contrebalance SM-1 ✓; SM-C2 contrebalance SM-3 ✓. No SM points at a wrong FR.
- **Internal contradiction (low-medium):** FR-3 states as a *testable consequence* that women's divisions are four categories (Strawweight 115, Flyweight 125, Bantamweight 135, Featherweight 145), but §8 Q6 *reopens* whether Featherweight is in V1 or the game limits to the 3 main categories. A testable consequence and an open question disagree on the same fact. *Fix:* make FR-3's consequence conditional ("3 or 4 women's divisions, pending Q6") or resolve Q6 and drop the qualifier. (Men's grid — 8 divisions, Flyweight 125 → Heavyweight 265 — is stated correctly.)
- **Assumptions Index roundtrip:** index complete; inline tagging incomplete (see Scope-honesty finding).
- **UJ protagonist naming:** UJ-1 named (Karim) with context inline ✓. UJ-2 intentionally a §6.2 pointer, no protagonist — acceptable given it's out of V1.
- **Glossary terms — usage check:** every glossary term is used somewhere in the FRs/UJs; no orphan definitions found. No used-but-undefined core noun found (Effets is the only borderline case, defined inline rather than as its own entry).
- **Required sections:** Vision, target player/JTBD, glossary, features/FRs, Non-Goals, MVP scope, Success Metrics, Open Questions, Assumptions Index — all present and appropriate for the stakes.
