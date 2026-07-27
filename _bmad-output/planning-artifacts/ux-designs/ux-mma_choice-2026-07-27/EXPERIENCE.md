---
name: 'MMA Choice'
status: final
created: '2026-07-27'
updated: '2026-07-27'
sources:
  - '_bmad-output/planning-artifacts/prds/prd-mma_choice-2026-07-27/prd.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-mma_choice-2026-07-27/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-mma_choice-2026-07-27/DESIGN.md'
---

# MMA Choice — Experience Spine

> Behavioral / IA / flow spine for a text-forward, mobile-first MMA career game. `DESIGN.md` is the visual reference — this document never restates hex values or type sizes; it references DESIGN tokens by `{path}` name and governs behavior, flow, and copy. Where the two touch, DESIGN owns the look, this spine owns the conduct. French UI, second-person, documentary-sober.

## Foundation

Single-surface **mobile-first web app**, single column, portrait-shaped. No native shell — it runs in the browser and installs to no store. The whole product is a reading loop: you read a beat of a fighter's life, you choose, the numbers move, the year turns. Everything below serves that loop.

**Zero-friction is a hard rule, not a preference.** No account, no login, no email gate — the first tap after "Faire ma carrière" is character creation, never a wall. Career state lives in `localStorage` under one versioned key and **survives tab close, refresh, and return** (AD-7): a player who closes the tab mid-career and comes back lands on the exact event they left, the RNG state restored (AD-3), the run reproducible to the score. There is exactly one save slot for the active career; starting a new career replaces it after an explicit confirm.

The engine is **deterministic and content-driven** (AD-1, AD-4): the same start criteria plus the same choices always yield the same career. This is invisible to the player but shapes the experience — nothing is "rolled" behind the curtain that the interface then hides; consequences are earned, not random theater. Free, no ads, no monetization surface anywhere in V1.

`DESIGN.md` is the visual identity: the "Fight night sombre" charcoal canvas, the single electric-lime accent used once per view, Inter across the board. This spine assumes that look and never contradicts it.

## Information Architecture

Four screens plus one bottom-sheet. The sheet is deliberately **not** a fifth screen — the stats dashboard rises over the career view so the reading context is never lost (locked decision; AD-8 keeps the store, not the URL, as the source of truth).

| Surface | Reached from | Purpose |
|---|---|---|
| **Accueil** | App open (cold), or "Nouvelle carrière" from Récap | Three modes. V1: **Faire ma carrière** is the one live, primary action; **Revivre la carrière** and **Mission du jour** are visible but marked *bientôt*. |
| **Création** | Accueil → "Faire ma carrière" | Multi-step fighter setup: sexe → pays/âge → origine/style → entourage → division. Each step commits to the store; back is non-destructive. |
| **Carrière / Événement** | End of Création, or "Continuer" on resume | The core screen. `{components.fighterHeader}` + `{components.dataChip}` row on top, the narrative `{components.eventCard}`, then the `{components.choiceCard}` stack. Combats render here as an event variant. |
| **Stats (bottom-sheet)** | Career screen — tap the chips row or a "Stats" affordance | `{components.bottomSheet}` sliding up over Carrière. Full `{components.statBar}` set (Frappe, Lutte, Sol, Cardio), méta gauges, division, style, palier, palmarès. Dismiss returns to the exact reading position. |
| **Récap de fin** | Reached automatically at age-out | End-of-career screen: score `/100` in `{typography.display}`, career timeline, highlights, ranking line. Exits to Accueil / "Nouvelle carrière". |

**Navigation model.** Forward is by commitment (a choice, a step, a year-advance), not by a nav bar — there is no persistent tab bar; the game is linear by design. The only "up" gestures are: the stats sheet (opens over Carrière, closes back to it) and Création's step-back. Modal depth never exceeds one level: the stats sheet never stacks another sheet; a confirm dialog (« Abandonner cette carrière ? ») is the only thing allowed on top of anything.

The three Accueil modes are all visible so the player reads the ambition of the product on first open, but only one is a door in V1. Tapping a *bientôt* mode acknowledges the tap without navigating (see State Patterns → locked-mode).

→ Visual composition reference: `DESIGN.md` components and the "Fight night sombre" direction. Spine wins on behavioral conflict; DESIGN wins on look.

## Voice and Tone

Second person, sober, immersive — a documentary of a career, not a hype broadcast. « Ton coach te propose… », never « GO GO GO, EXPLOSE-LE ! ». Results are stated as facts, not celebrated. Numbers are consequences, not confetti. French throughout. (Aesthetic posture and the "never celebratory color on results" rule live in `DESIGN.md`; this table is microcopy.)

| Do | Don't |
|---|---|
| « Ton coach veut t'inscrire au tournoi IMMAF. » | « C'est PARTI pour la gloire ! 🔥 » |
| « Victoire par TKO au 2e round. » | « INCROYABLE FINISH !!! » |
| « Tu prends l'ascendant, mais la coupe de poids t'a vidé. » | « Petite forme aujourd'hui, ça arrive 😅 » |
| « Défaite par décision unanime. » | « Pas de chance cette fois ! » |
| « Reprise sauvegardée. » | « ✓ Progression enregistrée avec succès » |
| « Ta carrière s'arrête ici. » | « GAME OVER » |
| Overlines factuels : « L'APPEL DU COACH », « TA DÉCISION », « COUPE DE POIDS ». | Slogans, points d'exclamation, emojis de hype. |
| Nommer le combattant et l'adversaire, situer le lieu et l'enjeu. | Adresser le joueur en méta (« tu as débloqué… »). |

Tone shifts by grade but never breaks the sober register: a *victoire nette* reads confident and dry; a *défaite* reads flat and factual; an *upset* reads with restrained weight (« Personne ne t'attendait. Tu l'as fini au 3e. »). Injury and age-out copy is plain and a little grave — this is a career that costs a body.

## Component Patterns

Behavioral only. Visual specs — fills, radii, borders, type — live in `DESIGN.md.Components` and are referenced here by token name.

| Component | Use | Behavioral rules |
|---|---|---|
| `{components.fighterHeader}` | Top of Carrière | Static identity anchor; not tappable in V1. Metadata line (age · division · palmarès · circuit) updates the instant a choice or year-advance changes it. |
| `{components.dataChip}` row | Top of Carrière | Compact méta pills (Forme, Mental, Répu., Follow., €). The whole row is the tap target that opens the stats `{components.bottomSheet}`. One chip may carry the accent treatment to spotlight the single métric most relevant to the current beat (e.g. Forme after a hard cut). |
| `{components.eventCard}` | Carrière + Combat | One card per beat. Lime `{typography.label}` overline names the beat; optional amber risk flag (« ⚠ Risque santé ») floats top-right when a choice below carries a real Forme/Santé cost. Never scrolls independently of the choice stack — card and choices are one reading unit. |
| `{components.choiceCard}` | Below every event | Full-width tap target. Shows effect chips (up = lime, down = coral, neutral = muted) that **preview declared, deterministic effects only** — never hidden or randomized outcomes (AD-5). At most one card carries the primary/recommended lime-wash variant per screen, and only when the content marks it. 2–4 choices per event (glossary). Tap = commit (see Interaction Primitives). |
| `{components.buttonPrimary}` | Création steps, "Continuer" after a result, Récap | The single high-emphasis action per view (« Valider », « Continuer », « Nouvelle carrière »). One per screen, ever. |
| `{components.buttonSecondary}` | "Retour", "Plus tard", "Abandonner" | Lower-stakes actions. Never lime. Création step-back uses this. |
| `{components.bottomSheet}` | Stats dashboard | Slides up over Carrière on chip-row tap; carries the one sanctioned upward shadow. Reads the store live (AD-2) — reflects the last choice's effects with no refresh. Dismiss by grabber-drag-down, tap-outside, or back gesture; returns to the exact scroll position. Never stacks a second sheet. |
| `{components.statBar}` | Inside the stats sheet | Thin meters for the 4 combat stats and méta gauges. Fill animates from old to new value on change (see Reduced Motion). Tabular values so widths never jitter. A stat that just rose/fell announces its delta to screen readers (see Accessibility). |
| `{components.resultBanner}` | Combat resolution | Renders the graded outcome: verdict in `{typography.label}` tinted by grade — *victoire nette / moche* in lime `{colors.success}`, *défaite* in coral `{colors.danger}`, *upset* in amber `{colors.warning}` — over one factual recap line (« TKO sur enchaînement — +18 followers »). Sober, documentary, never a celebration animation. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| **Loading (cold open)** | Accueil / Carrière | Content and engine are local (AD-9) — load is near-instant. If a frame is needed, show the canvas with a quiet skeleton of the `{components.eventCard}`; no spinner theater, no « Chargement… » copy unless > ~400ms. |
| **Resume (returning mid-career)** | Accueil → Carrière | If a save exists, Accueil's primary action reads « Continuer ta carrière » (with fighter name + record); « Nouvelle carrière » is secondary and confirms before replacing the slot. Landing restores the exact event and RNG state (AD-3/AD-7). Toast « Reprise sauvegardée. » fires on write, never on read. |
| **Empty (no career yet)** | Accueil | First-run: primary action reads « Faire ma carrière ». No dashboard to show, no empty-state apology — creation is the first screen. |
| **Locked mode (bientôt)** | Accueil | « Revivre la carrière » / « Mission du jour » are visible, dimmed, tagged *bientôt*. Tap acknowledges without navigating — a brief inline note (« Bientôt disponible. ») near the tapped card, no modal, no dead-end screen. *[Exact ack treatment inferred — see report.]* |
| **Error (corrupt / unreadable save)** | Accueil | If the persisted state fails schema validation on load (AD-4), do not crash into a broken career: fall back to a clean Accueil and offer « Recommencer une carrière ». Copy: « Ta sauvegarde n'a pas pu être lue. » — plain, no stack trace, no blame. |
| **Win (combat)** | Carrière (Combat) | `{components.resultBanner}` in lime for *nette* / *moche*. Stats that rose flash their lime delta chip; méta gauges update in the sheet. Copy states the method and the concrete gain. *Moche* wins say so plainly (« Victoire aux points, sans convaincre. »). |
| **Loss (combat)** | Carrière (Combat) | `{components.resultBanner}` in coral. Falling stats show coral deltas. A defeat may arm an injury flag (below) and/or a delayed consequence (AD-6). Never softened — « Défaite. » is allowed to just sit there. |
| **Upset** | Carrière (Combat) | `{components.resultBanner}` in amber. Reserved and rare. Copy carries restrained weight; the ranking/legacy jump is real but stated, not shouted. |
| **Injury** | Carrière | Triggered by defeats, brutal cuts, or over-training choices. Poses a blessure Flag (AD-6) and drops Forme/Santé (coral deltas). The next relevant `{components.eventCard}` may carry the amber risk flag; some choices become gated or costed while injured. A delayed-consequence event can surface the injury's return weeks/years later. |
| **Aging (year-advance)** | Carrière | Each year turn updates age in `{components.fighterHeader}` and may erode Forme/Santé (FR-4). Past a threshold, décline events enter the pool. The interface states the year passing plainly (« Une année passe. Tu as 34 ans. ») — no dramatization. |
| **End of career (age-out)** | Récap | At the age limit the career ends automatically. The transition is deliberate, not abrupt: a closing line (« Ta carrière s'arrête ici. »), then the Récap with score `/100` in `{typography.display}`, timeline, highlights (ceintures, upsets, meilleurs combats), and the ranking line (« 7ᵉ meilleur combattant de tous les temps »). Score is reproducible for the run (AD-3, FR-14). |

## Interaction Primitives

- **Tap to act.** Every action is a single tap on a full-width, thumb-reachable target. No hover-dependent affordance exists — the product assumes touch first (long-press is reserved for the OS's own text selection).
- **Choice-commit.** Tapping a `{components.choiceCard}` commits the choice: it dispatches an Action to the engine reducer (AD-2), applies the declared effects (bounded 0–100, AD-5), advances to the next beat, and — where the choice sets a flag — arms downstream/delayed events (AD-6). **Commit is immediate and final; there is no "are you sure" on a choice** — the consequence *is* the game. The only guarded actions are destructive-to-run ones (« Abandonner », « Nouvelle carrière » over an existing save).
- **Sheet open/close.** Tapping the `{components.dataChip}` row (or a Stats affordance) opens the stats `{components.bottomSheet}` over Carrière. Close by grabber drag-down, tap-outside, or the system back gesture. Opening and closing never lose reading position and never mutate state.
- **Year-advance.** When a year's events are exhausted, a « Continuer » `{components.buttonPrimary}` turns the year: age ticks, Forme may shift, the next year's event sequence (~2–5 events, ≥1 combat when apt — FR-4) is built by weighted, anti-repetition draw (AD-6). The turn is an explicit tap, never automatic mid-read.
- **Result acknowledgement.** After a `{components.resultBanner}`, a single « Continuer » returns to the flow — the player must read the outcome before moving on; results are never auto-dismissed.
- **Banned:** carousels, infinite scroll, celebratory hero animations, streak counters, badge counts, push re-engagement, any modal stack deeper than one level, any randomized outcome that the choice chips didn't declare.

## Choice & Consequence Feedback

This section is product-specific because the entire value proposition is *the weight of choices* (PRD §1, §2.1). The interface's job is to make consequence legible without breaking sobriety.

- **Declared, not hidden.** Effect chips on `{components.choiceCard}` preview the deterministic effects a choice will apply (AD-5) — the player sees the trade before committing (« +Followers / −Réputation » on a clash choice, FR-12). Combat *outcomes* are the exception: a combat choice shapes odds against a calibrated opponent (FR-10/16), so its chips express intent/risk (« Aller au sol », amber risk flag) rather than a guaranteed result.
- **Trade-offs are visible and semantic.** Up-deltas are lime, down-deltas coral, neutral muted (DESIGN). A choice with no free lunch shows both — the coral chip is not hidden to make the option look better.
- **Consequence lands where the player is looking.** After commit, changed méta chips update in place at the top of Carrière; the full picture is one tap away in the stats sheet. The player never has to navigate to *find out what happened*.
- **Delayed consequences are honored, not spoiled.** A flag armed now (a toxic manager, an untreated injury, a burned bridge) surfaces its event later (AD-6). The interface does not foreshadow it — when it lands, the event copy makes the causal link legible (« Ton ancien manager ressort le contrat que tu avais signé. »).
- **Style can evolve.** A puncheur who keeps choosing ground work migrates toward grappler over the career (FR-15); when the current style changes, the stats sheet reflects the new style label and the shift is stated once in-narrative — not as a system popup.

## Content Variety & Replay

Replay is a primary metric (SM-1: ≥3 careers/session; SM-3: <40% event overlap). The experience must *feel* non-repeating, which is a UX concern as much as a data one.

- **No two careers alike, by construction.** The weighted, seen-flag anti-repetition draw (AD-6) means a unique event never recurs within a run, and two runs from the same start criteria diverge quickly. The player should never see the same event text twice in one career.
- **Relance is one tap and instant.** From Récap, « Nouvelle carrière » returns to Création with the previous inputs *not* pre-filled — a fresh run is a fresh identity. The « encore une » loop (PRD §1) must have zero friction: no reload wait, no re-consent beyond the save-overwrite confirm.
- **The pool never dead-ends.** A filler repeatable event always keeps the pool non-empty (AD-6), so the reading loop never stalls into an empty screen mid-career; repeatable events carry a cooldown so nothing loops back-to-back and breaks the illusion of variety.
- **Start criteria are felt, not just recorded.** Origine, style, entourage, division each gate and unlock content (FR-2). A *bagarreur de rue* with a *manager véreux* should read a visibly different early career than a *lutteur universitaire* with a *coach mentor* — this divergence is the demo of the product and must be perceptible in the first few beats.

## Accessibility Floor

Behavioral. Visual contrast lives in `DESIGN.md` (the charcoal/off-white palette and lime accent are chosen for legibility across long French passages).

- **Tap targets** ≥ 48dp on every interactive element — `{components.choiceCard}`, buttons (already ≥48px min-height in DESIGN), the chip row, the sheet grabber. Choice cards are full-width for confident thumb reach.
- **Focus order follows reading order** on every screen: header → chips → event card → choices → primary action. In Création, focus flows step field → step field → « Valider ». The stats sheet traps focus while open and returns focus to the chip row on close.
- **Screen-reader labels for stat changes are mandatory.** When a choice or combat changes a stat or gauge, the delta is announced via a polite live region: « Réputation +8, maintenant 61 sur 100. » `{components.statBar}` fills carry an accessible value, not just a visual bar. `{components.resultBanner}` announces grade + method on appear (« Défaite par décision. »).
- **Every interactive element has role + state.** Choice cards announce as buttons with their title, and the effect chips read as part of the label. The primary/recommended choice announces its recommended state. Locked *bientôt* modes announce as disabled with « bientôt disponible ».
- **Reduced motion.** Honor `prefers-reduced-motion`: skip the stat-bar fill animation and the sheet slide — snap the meter to its new value and present the sheet without transit; the numbers and outcomes are identical, only the motion is dropped.
- **Reading is the loop, so text must scale.** Respect the OS/browser text-size setting; layout stays single-column and legible at the largest step with no truncated controls or clipped event prose.

## Key Flows

### Flow 1 — Karim crée sa légende dans le métro (UJ-1, cold open → retirement)

1. Karim opens MMA Choice from a TikTok link on his phone. **Accueil** loads: « Faire ma carrière » live and primary; « Revivre la carrière » and « Mission du jour » visible but *bientôt*. No login, no wall.
2. He taps « Faire ma carrière » → **Création** begins. Step by step: sexe (Homme) → pays (France) / âge (17) → origine (*bagarreur de rue*) / style de départ (puncheur) → entourage (*coach mentor*) → division. The division step shows only the **men's** UFC grid (sex-gated, FR-3). Each « Valider » commits; « Retour » is non-destructive.
3. The career opens on the **IMMAF amateur** circuit. `{components.fighterHeader}` shows « Karim · 17 ans · amateur · 0-0 ». The first `{components.eventCard}` — overline « L'APPEL DU COACH » — offers a first choice: s'inscrire au tournoi vs continuer l'entraînement. Effect chips preview the trade.
4. He commits choices year by year. He taps the chip row once to check his stats in the `{components.bottomSheet}`, sees Frappe climbing, closes it back to the exact beat. A clash event (FR-12) tempts him with « +Followers / −Réputation »; he takes it.
5. A **combat** renders as an event variant. Against a calibrated opponent (FR-16) his choices produce a `{components.resultBanner}`: « Victoire par TKO — +14 followers. » A later defeat arms an injury flag; the next year carries an amber risk flag, and a delayed-consequence event surfaces the injury's toll two years on (AD-6).
6. Years turn (« Une année passe. Tu as 34 ans. »); décline events appear; Forme erodes.
7. **Climax:** at the age limit the career ends on its own. « Ta carrière s'arrête ici. » gives way to the **Récap**: score in `{typography.display}` — **74/100** — a timeline of his fights, highlights (une ceinture régionale, un upset), and « 7ᵉ meilleur combattant de tous les temps ». The weight of every choice is now a single number and a story he can read back.
8. He taps « Nouvelle carrière » → straight back to **Création**, fresh identity, no wait. The « encore une » loop closes.

*Failure branch:* Karim closes the tab after step 4. Reopening, **Accueil**'s primary action reads « Continuer ta carrière — Karim, 3-1 »; tapping lands him on the exact event he left, RNG restored, the run still reproducible (AD-3/AD-7).

### Flow 2 — Nadia façonne sa combattante (create-fighter, sex-gated division)

1. From **Accueil**, Nadia taps « Faire ma carrière ». **Création** opens on the **sexe** step.
2. She chooses **Femme**. This is the gating decision: it fixes which UFC weight grid the division step will later show (FR-1/FR-3).
3. **pays / âge:** Canada, 19 ans. « Valider ».
4. **origine / style:** *lutteuse universitaire* / grappler — the interface notes (in-narrative, not as a system popup) that this seeds her starting stats and unlocks certain events (FR-2). « Valider ».
5. **entourage:** *seule* — a harder start; a flag is set that will gate early-career events. « Valider ».
6. **division:** only the **women's** grid appears — Strawweight 115, Flyweight 125, Bantamweight 135 (Featherweight per PRD §8 Q6). A men's category is simply absent, never blocked-with-error. She picks Flyweight.
7. **Climax:** she taps « Valider » on the final step. The career screen materializes with a `{components.fighterHeader}` that is unmistakably *hers* — « Nadia · 19 ans · Flyweight · 0-0 · IMMAF » — and a first `{components.eventCard}` already shaped by *lutteuse universitaire* + *seule*. Before a single fight, the choices she made in Création are legible in the fiction in front of her. She reads the first beat and taps her first `{components.choiceCard}`.

*Back branch:* at the division step she reconsiders her style. « Retour » twice returns her to origine/style with her earlier inputs intact — no data lost, no confirm — she switches to *polyvalente* and moves forward again.

### Flow 3 — La conséquence différée (climax on a flag armed years earlier)

1. Early in a run, an event offers a lucrative but shady deal (« Signer avec le manager qui te promet la lune »). The `{components.choiceCard}` shows « +€ / +Followers » — no coral chip, because the cost is not immediate. Karim signs. A flag is armed with a delay (AD-6); nothing else changes on screen.
2. Several years and many events later — after the player has forgotten the deal — a delayed-consequence event enters the pool. Overline: « LE CONTRAT ». The `{components.eventCard}` makes the causal link explicit: « Ton manager fait valoir la clause que tu avais signée. Il réclame la moitié de ta prochaine bourse. »
3. The choices now are all costed: pay (« −€ »), fight it (« −Mental, risque de Réputation »), or walk (« −Followers, flag posé »).
4. **Climax:** whatever Karim picks, the moment retro-justifies a decision he made minutes-of-play ago. The game just proved that a choice with no visible downside had one all along — the core promise of the product (« le poids de ses choix », PRD §2.1) delivered as a felt event, not a tooltip. The méta chips at the top update in place; he can open the stats sheet to see the full damage.

*No-flag branch:* a player who declined the shady deal never sees « LE CONTRAT » at all — its trigger condition is unmet (AD-6), and a different event fills that slot, so his run reads genuinely different (SM-3).
