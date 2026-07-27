# Adversarial Review — ARCHITECTURE-SPINE (MMA Choice)

**Reviewer stance:** adversary. Method: for each AD, construct a concrete pair of units one level
down that each obey **every** AD to the letter, yet build **incompatibly**. Each pair is a hole to
close with a new or tightened AD.

**Verdict: HOLES FOUND.** The spine's dependency direction (AD-1) and single-mutation-path (AD-2)
skeleton are sound, but the *content contract* (AD-4/5), *pool semantics* (AD-6), and
*serialization boundary* (AD-3/7) are under-specified in ways that let two conforming builders
diverge irreconcilably. Ten pairs below, ranked by severity. Each names two units, the exact
incompatibility, and the AD to tighten.

---

## Pair A — `target`/`field` grammar: closed enum vs open GameState path (AD-5, boundary leak)

**Units:** Content author writing an `Effect` / `Condition`, vs the engine dev writing the effect
interpreter in `reducer.ts`.

AD-5 fixes the *shape* — `{ target, op, value }` and "prédicats sur les champs de `GameState`" —
but never says whether `target`/`field` is a **closed enum of named channels** or an **open dotted
path into `GameState`**. Two conforming readings:

- Author/engine A: `target: "striking"`, `field: "age"` — a closed vocabulary the engine maps to
  known write/read channels. Everything the spine implies ("ensemble fermé et versionné, étendu
  dans le moteur").
- Author/engine B: `target: "stats.striking"`, `field: "money"`, and — nothing stops it —
  `target: "rng.counter"`, `field: "flags['seen:evt-x']"`, `target: "saveVersion"`. Still a
  "champ de `GameState`", still declarative, still pure JSON. **Obeys AD-5 to the letter.**

Reading B is a direct **engine↔content boundary leak that no AD forbids**: content can read and
mutate engine internals (the RNG state → breaks AD-3 reproducibility; `saveVersion` → breaks AD-7
migration; the seen-flag store → breaks AD-6). A and B produce incompatible interpreters and
incompatible content corpora. AD-4's "invalid content fails at load" does **not** save you: a dotted
path is a valid `string`; Zod passes it.

**Tighten:** AD-5 must declare `target` and condition `field` as a **closed, versioned enum of
allowed channels** (stat/gauge/money/followers/flag-name…), interpreted by the engine — never a raw
`GameState` path. Content may touch *only* those channels; engine internals (`rng`, `saveVersion`,
engine-reserved flags) are unreachable by content by construction.

## Pair B — Opponent has two owners: content data vs engine generation (AD-4 vs Deferred)

**Units:** Content author of `content/opponents/*.json` (declared content under AD-4 — "adversaires"
are explicitly bound), vs `engine/combat.ts` opponent generator (Deferred: *"Algorithme de
génération d'adversaire — interne au moteur ; le code en est propriétaire"*).

The spine **simultaneously** declares Opponent to be authored data (AD-4 binds "adversaires";
Structural Seed ships `content/opponents/*.json`; ER diagram `Combat }o--|| Opponent`) **and**
procedurally engine-generated (`combat.ts` "génération d'adversaire", Deferred section). These are
the two classic incompatible ownership models for one entity:

- Content author builds a hand-authored roster and expects fights to draw from it (AD-4: "ajouter du
  contenu = éditer du JSON").
- Combat dev generates opponents from seeded RNG at fight time and treats `opponents/*.json` as dead
  weight — or worse, both run and the game has two disjoint opponent populations.

Both devs are locally faithful to the text. The result does not compose: is a fought Opponent a
content id or a generated struct? Is it stored in `GameState` (AD-7) as an id or an inline object
(see Pair C)? Does the score (AD-3 reproducibility) depend on RNG-generated stats or on static data?

**Tighten:** a new AD that fixes Opponent ownership — e.g. "content provides opponent **archetypes/
templates**; the engine **parametrizes** them deterministically (AD-3) at fight time." Pick one
source of truth; the current two-owner text is a contradiction, not a division of labor.

## Pair C — GameState references content: stable id vs embedded copy (AD-7 / AD-4 / AD-2)

**Units:** Reducer dev A stores `currentEventId: "evt-title-shot"` (slug) in `GameState`; reducer
dev B stores `currentEvent: { id, choices:[...], effects:[...] }` — the whole validated `Event`
object — "for convenience."

Because AD-5 forbids executable code in content, a validated `Event` is **plain JSON**, so embedding
it in `GameState` **passes AD-7's letter** ("pas d'instances de classe ni de fonctions"). B is not
violating the serialization rule. Yet:

- The save now contains a **frozen snapshot** of content. Editing `content/events/*.json` no longer
  changes an in-progress career — violating AD-4's promise ("éditer du contenu = éditer du JSON") in
  spirit while obeying it in letter.
- The `Event` entity now has **two owners** (the content file and the save), which is exactly the
  double-ownership AD-2 exists to prevent — but AD-2 binds `GameState` mutation, not
  content-reference discipline, so it doesn't reach this.

A's and B's saves are non-interchangeable, and B's saves silently rot across content updates.

**Tighten:** AD-7 (or a new AD) must state that `GameState` references content **only by stable
`id`**; content objects are re-resolved from the content corpus on read and are **never** embedded
in the persisted state. This also caps save size and keeps content the single source of content.

## Pair D — Empty pool softlock & self-retriggering loop (AD-6)

**Units:** Content author who authors a division's events all as non-`repeatable`, vs
`engine/events.ts` `buildPool` + the progression reducer that must present an event each step.

AD-6 guarantees exclusion of seen non-repeatable events but guarantees **nothing about the pool
being non-empty**. Two conforming failure modes:

- **Softlock (empty pool):** late in a career, every eligible non-repeatable event is seen and no
  `repeatable` fallback qualifies → `buildPool` returns `[]` → the reducer has no event to draw and
  no defined behavior. Both units obeyed AD-6.
- **Infinite loop / non-termination:** a `repeatable: true` event whose trigger condition is
  re-satisfied by its own effects (or is unconditional) is never excluded (AD-6 exempts repeatables
  from the seen-flag) and, if it dominates the weighted draw, is presented forever. AD-6 has **no
  loop guard and no per-career repeat cap.**
- **Delayed-consequence deadlock:** a deferred flag whose delay unit is ambiguous (see Pair E-delay)
  can gate the *only* remaining event behind a delay that never elapses because the delay counter
  advances on a step type that never fires again.

**Tighten:** AD-6 must assert a **pool non-emptiness invariant** (a guaranteed always-eligible
fallback event, or a defined "career-advances / no-event" outcome) and a **bound on repeatable
re-selection** per career phase, so buildPool can neither starve nor loop.

## Pair E — Pool iteration order → seeded draw non-determinism (AD-6 / AD-3)

**Units:** The content loader (`import.meta.glob('content/events/*.json')` or a `Record<id,Event>`),
vs the weighted seeded draw in `events.ts` that consumes AD-3's RNG.

A seeded weighted draw is only reproducible if it runs over a **canonically ordered** sequence. If
the pool is materialized from a glob (bundler/filesystem order) or from object-key order, the
*order* of the eligible list can differ between builds/platforms while seed + counter (AD-3) are
identical → the **same seed selects a different event** → AD-3's "à graine + choix identiques,
carrière rejouée à l'identique" and FR-14 reproducible score are silently broken. Nothing in AD-6 or
AD-3 mandates a stable order.

**Related delay-unit divergence:** AD-6's "délai" has no unit. Author writes `delay: 3` meaning
"3 years/paliers"; engine implements it as "3 event draws." Deferred consequences fire at the wrong
time — two faithful readings, incompatible content.

**Tighten:** AD-3/AD-6 must require the eligible pool to be **sorted by `id` (stable) before the
weighted draw**, and AD-6 must define the **unit and storage** of a flag's delay (in `GameState`,
counted in a named tick — years/paliers).

## Pair F — RNG state model: seed+counter vs pure-rand internal state (AD-3 / AD-7 / Stack)

**Units:** `rng.ts` dev X implementing mulberry32 as `{ seed:number, counter:number }`, vs `rng.ts`
dev Y using `pure-rand` (offered in the Stack).

AD-3 fixes the RNG state model as **"graine + compteur"**. That is faithful to a counter-based PRNG
(mulberry32: reconstruct state by re-seeding and skipping `counter` draws). But the Stack also
offers `pure-rand`, whose generators (e.g. xoroshiro128plus) have **multi-word internal state that
is not reconstructible from a scalar counter** and whose `RandomGenerator` may be a **class instance
/ frozen object** — storing it directly violates AD-7 ("pas d'instances de classe"), and storing
only seed+counter cannot rebuild it. Saves written by X and Y are **mutually unloadable**, and Y may
be unable to honor AD-3's serialization shape at all.

Second-order fragility (cross-version, note): counter-only state means reproducibility depends on the
**number of RNG draws per action never changing**. If `combat.ts` later draws 3 randoms where it
drew 2, a resumed/replayed career diverges even at the same seed+counter.

**Tighten:** AD-3 must **pin the exact serialized RNG shape** (algorithm + field layout, e.g.
mulberry32 `{ seed, counter }`) and require that resume/replay be draw-count-stable, OR forbid PRNGs
whose state is not scalar-serializable. Remove the ambiguous `pure-rand`-or-mulberry32 choice from
the substrate, or gate it behind this AD.

## Pair G — Rehydration is an unchecked second mutation path (AD-2 / AD-7)

**Units:** The engine reducer (AD-2's sole sanctioned mutation), vs Zustand's `persist` rehydrate
which **sets the whole `GameState` from localStorage** on load.

AD-2 says the *only* way to evolve `GameState` is dispatching an `Action` to the reducer. But
`persist` rehydration injects an entire `GameState` **bypassing the reducer** — a de facto second
mutation path AD-2 doesn't cover. And **localStorage is user-writable**: a tampered or
stale-`saveVersion` save enters the store **un-validated** (no Zod guards `GameState`; AD-4's
load-time validation covers *content*, not *state*). The reducer then operates on an out-of-invariant
state → crash, cheat, or non-reproducible career.

**Tighten:** AD-7 (or AD-2) must require rehydrated `GameState` to pass a **`GameState` schema
validation / reducer-based migration** before entering the store — closing rehydration as an
unchecked mutation path and extending "invalid input fails at load" from content to persisted state.

## Pair H — Flag namespace collision: engine seen-flags vs content-set flags (AD-6 / AD-5)

**Units:** The engine's seen-flag writer in `events.ts` (AD-6: playing a non-repeatable event
"pose son flag « vu »"), vs a content author's `pose de flags` effect (AD-5).

Both write into one flat string flag store in `GameState`, with **no reserved namespace**. A content
author can set (or an AD-5 effect could clear) a flag whose name collides with the engine's seen-flag
encoding for some event → that event is permanently excluded (**softlock**) or wrongly re-shown
(**non-determinism**). Two authors also disagree on encoding (`seen:evt-x` vs `evt-x-seen` vs bare
`evt-x`), so seen-detection and content triggers silently miss each other.

**Tighten:** AD-6 must **reserve an engine-owned flag namespace** (e.g. `sys:*` / `seen:*`) that
content effects cannot write, define the canonical seen-flag encoding, and confine content flags to a
disjoint namespace.

## Pair I — Global id uniqueness not enforced (AD-4 / Conventions)

**Units:** Two content files, each independently Zod-valid, that happen to share an `id`
(`evt-title-shot` in two event files, or an event id equal to an opponent id).

Per-file Zod validation (AD-4) validates each file in isolation and **passes both** — a duplicate id
across files is not a per-file schema error. At load the pool `Record<id, Event>` **silently
overwrites** one event with the other (content lost), and the shared id **aliases their seen-flags**
(playing one marks the other seen). AD-4 promises "un contenu invalide échoue au chargement," but
cross-file id collision is invisible to it.

**Tighten:** the Conventions / AD-4 must require a **load-time global id-uniqueness check across the
whole content corpus** (per type, and for any id used as a flag/target), failing the load — not just
per-file Zod.

## Pair J — Effect `op` vocabulary & clamp timing (AD-5 / AD-3)

**Units:** Two content/engine authors interpreting `op` and multi-effect application.

- **`op` divergence:** Author A writes `op: "add"`; Author B writes `op: "increment"` / `op: "+"`.
  Both are "un objet `{ target, op, value }` déclaratif." Unless `op` is a pinned enum in the shared
  Zod schema, the two corpora don't interoperate. (Mitigated *only if* the schema enumerates ops —
  which the spine never mandates.)
- **Clamp/order timing:** stats are normalized 0–100 (Conventions). A Choice with
  `[{op:add,+20},{op:mul,×2}]` yields different results if the engine clamps **after each effect**
  vs **once at the end** (e.g. `95 +20 →115` then `×2`: clamp-each = 200→100→…; clamp-end differs on
  subtraction paths). Two engine devs, both AD-5-faithful, produce **different reproducible outcomes**
  → different AD-3 scores from identical seed+choices.

**Tighten:** AD-5 must pin the **closed `op` enum** and its exact semantics, and define
**deterministic effect-application order + a single clamp rule** (per-effect vs terminal), so
"le moteur décide" is one decision, not two.

---

## Summary of tightenings

| Pair | Boundary stressed | AD to add/tighten |
| --- | --- | --- |
| A | content↔engine (write/read internals) | AD-5: `target`/`field` = closed channel enum, never raw GameState paths |
| B | entity ownership | New AD: Opponent = content template parametrized by engine (one owner) |
| C | serialization / content freshness | AD-7: GameState references content by stable id only, never embedded copies |
| D | pool liveness | AD-6: pool non-emptiness invariant + repeatable re-selection bound |
| E | determinism | AD-3/6: sort pool by id before draw; define delay unit + storage |
| F | RNG serialization | AD-3: pin exact serialized RNG shape; forbid non-scalar-serializable PRNGs |
| G | mutation path / state validation | AD-2/7: validate GameState on rehydrate |
| H | flag namespace | AD-6: reserve engine flag namespace + canonical seen-flag encoding |
| I | content integrity | AD-4/Conventions: load-time global id-uniqueness check |
| J | effect semantics | AD-5: pin `op` enum + effect order + single clamp rule |

**Bottom line:** the spine is directionally correct but its content contract and serialization
boundary are too loose to keep two independent, fully-conforming builders on the same rails. Pairs
A, B, C, D, and F are the load-bearing holes — close them before content authoring or engine work
begins.
