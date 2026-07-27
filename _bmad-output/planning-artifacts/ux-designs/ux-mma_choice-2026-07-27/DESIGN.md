---
name: 'MMA Choice'
status: final
created: '2026-07-27'
updated: '2026-07-27'
sources:
  - '_bmad-output/planning-artifacts/prds/prd-mma_choice-2026-07-27/prd.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-mma_choice-2026-07-27/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-mma_choice-2026-07-27/.working/directions-3.html'
description: 'Dark premium "fight night" identity for a text-forward, mobile-first MMA career game. Charcoal canvas, one electric-lime accent, esport-manager restraint. French UI, realistic tone.'
colors:
  background: '#0C0D10'
  surface: '#15171C'
  surface-sunken: '#191B21'
  text: '#E9EBF0'
  text-bright: '#F4F6FA'
  text-secondary: '#A7ADBA'
  text-muted: '#7A818E'
  text-faint: '#4D525C'
  border: '#262A32'
  border-strong: '#2B2F38'
  accent: '#C7FF3D'
  accent-dim: '#8FBF2E'
  accent-wash: 'rgba(199,255,61,0.10)'
  accent-line: 'rgba(199,255,61,0.42)'
  success: '#C7FF3D'
  danger: '#FF7A6B'
  danger-wash: 'rgba(255,122,107,0.10)'
  warning: '#E0B64A'
typography:
  display:
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    fontSize: 34px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: '-0.02em'
  title:
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    fontSize: 19px
    fontWeight: '800'
    lineHeight: '1.3'
    letterSpacing: '-0.015em'
  body:
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-strong:
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.35'
  label:
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    fontSize: 11px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: '0.2em'
  stat:
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: '0'
  meta:
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    fontSize: 11.5px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 6px
  md: 10px
  lg: 14px
  xl: 20px
  avatar: 16px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '7': 32px
  gutter: 16px
  margin-mobile: 20px
components:
  fighterHeader:
    background: 'transparent'
    padding: '{spacing.4} {spacing.5} {spacing.3}'
    avatarSize: '54px'
    avatarRadius: '{rounded.avatar}'
    avatarBorder: '{colors.border-strong}'
    avatarInitials: '{colors.accent}'
    nameType: '{typography.title}'
    metaColor: '{colors.text-muted}'
    recordEmphasis: '{colors.text}'
  dataChip:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.md}'
    padding: '{spacing.2} {spacing.2}'
    labelColor: '{colors.text-muted}'
    valueColor: '{colors.text}'
    accentBorder: '{colors.accent-line}'
    accentValue: '{colors.accent}'
  statBar:
    trackBackground: '{colors.surface-sunken}'
    trackHeight: '6px'
    trackRadius: '{rounded.sm}'
    fillGradient: 'linear-gradient(90deg, {colors.accent-dim}, {colors.accent})'
    labelColor: '{colors.text-muted}'
    valueColor: '{colors.text}'
  eventCard:
    background: 'linear-gradient(180deg, {colors.surface}, #101216)'
    border: '{colors.border-strong}'
    radius: '{rounded.xl}'
    padding: '{spacing.5} 18px'
    accentEdge: '{colors.accent}'
    overline: '{typography.label}'
    overlineColor: '{colors.accent}'
    riskColor: '{colors.warning}'
    headlineType: '{typography.title}'
    headlineColor: '{colors.text-bright}'
    bodyType: '{typography.body}'
    bodyColor: '{colors.text-secondary}'
  choiceCard:
    background: '{colors.surface}'
    border: '{colors.border-strong}'
    radius: '{rounded.lg}'
    padding: '{spacing.3} 15px'
    titleType: '{typography.body-strong}'
    titleColor: '{colors.text}'
    indexColor: '{colors.text-faint}'
    primaryBackground: 'linear-gradient(180deg, {colors.accent-wash}, rgba(199,255,61,0.03))'
    primaryBorder: '{colors.accent-line}'
    deltaUpColor: '{colors.accent}'
    deltaUpBackground: '{colors.accent-wash}'
    deltaDownColor: '{colors.danger}'
    deltaDownBackground: '{colors.danger-wash}'
    deltaNeutralColor: '{colors.text-secondary}'
    deltaNeutralBackground: '{colors.surface-sunken}'
  buttonPrimary:
    background: '{colors.accent}'
    text: '{colors.background}'
    radius: '{rounded.lg}'
    labelWeight: '800'
    minHeight: '48px'
  buttonSecondary:
    background: 'transparent'
    border: '{colors.border}'
    text: '{colors.text}'
    radius: '{rounded.lg}'
    minHeight: '48px'
  bottomSheet:
    background: '{colors.surface}'
    topRadius: '{rounded.xl}'
    border: '{colors.border}'
    grabberColor: '{colors.border-strong}'
    shadow: '0 -20px 50px -12px rgba(0,0,0,0.7)'
    padding: '{spacing.5}'
  resultBanner:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.lg}'
    padding: '{spacing.4}'
    winColor: '{colors.success}'
    lossColor: '{colors.danger}'
    upsetColor: '{colors.warning}'
    labelType: '{typography.label}'
  toast:
    background: '{colors.surface}'
    border: '{colors.border-strong}'
    radius: '{rounded.md}'
    text: '{colors.text}'
    padding: '{spacing.3} {spacing.4}'
    minHeight: '44px'
    shadow: '0 8px 24px -8px rgba(0,0,0,0.7)'
  confirmDialog:
    overlay: 'rgba(0,0,0,0.6)'
    background: '{colors.surface}'
    border: '{colors.border-strong}'
    radius: '{rounded.lg}'
    padding: '{spacing.5}'
    titleType: '{typography.title}'
    bodyType: '{typography.body}'
    destructiveColor: '{colors.danger}'
  skeleton:
    baseColor: '{colors.surface-sunken}'
    shimmerColor: '{colors.border}'
    radius: '{rounded.md}'
---

<!-- Distilled at Finalize from .memlog.md + Direction B (.working/directions-3.html). Do not hand-author. -->

## Brand & Style

MMA Choice is a text-forward career game: you read a beat of a fighter's life, then choose what happens next. The identity has to serve reading first and spectacle second — this is a documentary of a career, not a hype reel. The chosen direction is **"Fight night sombre"**: the hush of a darkened arena the moment before a walkout, rendered as a premium esport-manager interface.

The posture is **épuré & moderne** — clean, restrained, confident. A deep charcoal canvas keeps the eye calm across long passages of prose; a single electric-lime accent does all the pointing, so the one thing that matters on any screen is unmistakable. Everything else is tonal: surfaces defined by a half-step of lightness, hairline borders, quiet data chips. Numbers exist, but they never shout over the narrative. Mobile-first throughout: single column, generous tap targets, French UI, second-person and sober in voice.

The rule that governs the whole system: **one accent, used with discipline.** Lime is a privilege, not a decoration.

## Colors

The palette is a dark spine plus exactly one voice of color. Everything structural is a shade of charcoal; meaning comes from lime and two tightly-scoped semantic signals.

- **Background (`#0C0D10`)** — the near-black arena floor. The base canvas for every screen. A faint lime radial glow may bleed from the top edge (`{colors.accent-wash}` fading to transparent) to suggest cage lighting — subtle, never a gradient wash.
- **Surface (`#15171C`)** — cards, chips, choice rows, the stats bottom-sheet. Sits one tonal step above the background; separation is by lightness and a hairline border, not shadow.
- **Surface-sunken (`#191B21`)** — inset wells: the empty track behind a stat meter, neutral chip fills. Reads as "carved into" the surface.
- **Text (`#E9EBF0`)** — primary reading color for narrative and values. **Text-bright (`#F4F6FA`)** lifts headlines a half-step for emphasis. **Text-secondary (`#A7ADBA`)** carries long-form event prose at a comfortable, lower-contrast weight for sustained reading. **Text-muted (`#7A818E`)** is for labels, metadata, captions. **Text-faint (`#4D525C`)** is for de-emphasized ornament like choice index numbers.
- **Border (`#262A32`)** — the hairline that defines nearly every surface. **Border-strong (`#2B2F38`)** for slightly more present edges (avatar frame, sheet grabber).
- **Accent — Lime (`#C7FF3D`)** — the single brand color. Reserved for: primary actions, active/selected state, section overlines, rising stats and positive deltas, and victory. **Accent-dim (`#8FBF2E`)** is only the darker end of the stat-fill gradient. **Accent-wash** and **accent-line** are its low-opacity tint and border for selected surfaces. Never use lime as a large fill behind body text, and never for more than one emphasis per view.
- **Success (`#C7FF3D`)** — deliberately the same lime. In this world, "up" *is* the brand color: a rising stat and a win share one visual language.
- **Danger (`#FF7A6B`)** — a warm coral for the negative pole only: defeat, injury, and falling stats/deltas. Paired with **danger-wash** as a soft chip fill. It is a signal, never a theme.
- **Warning (`#E0B64A`)** — muted amber, scoped to risk flags ("⚠ Risque santé") and the "upset" result grade. Rare by design.

Avoid: any second saturated hue competing with lime, red error fills as backgrounds, and pure `#000`/pure `#FFF` (the charcoal and off-white are intentional).

## Typography

One family does everything: a **modern grotesque sans — Inter** (with the native system stack as fallback), chosen for its legibility at small sizes and its neutrality across long French text blocks on mobile. No serif, no second family; hierarchy comes from size and weight, not typeface.

The ramp, mobile-tuned:

- **`display`** (34/800, tight) — reserved for big moments: the end-of-career score `/100`, major milestone headers.
- **`title`** (19/800, −0.015em) — the fighter name and the event headline. The two anchors of a screen.
- **`body`** (15/1.6) — the event narrative. Set slightly larger and looser than a typical UI body because reading is the core loop; this is a considered tuning up from the 13.5px in the source frame, for comfort over long passages.
- **`body-strong`** (14/700) — choice-card titles: dense, decisive, scannable.
- **`label`** (11/800, 0.2em, uppercase) — overlines and section kickers ("L'APPEL DU COACH", "TA DÉCISION"). Tracked wide for a premium, restrained feel.
- **`stat`** (12/700, tabular-nums) — every numeric value. Tabular figures are mandatory so meters and deltas don't jitter as numbers change.
- **`meta`** (11.5/400) — muted metadata and captions.

Numbers always use `font-variant-numeric: tabular-nums`. All-caps is confined to `label`.

## Layout & Spacing

An 8px-derived scale: **4 / 8 / 12 / 16 / 20 / 24 / 32**. Small values bind related elements (a stat label to its meter); large values separate major zones (header → event card → choices). `margin-mobile` is **20px** — content is framed, never bleeding to the device edge. `gutter` (16px) is the standard card-to-card and card-to-edge rhythm.

Layout is **single-column, always** — this is a phone-shaped reading experience. Vertical flow per screen: fighter header → data chips → stat meters → event card → choice stack. The stats dashboard is not a separate screen; it rises as a bottom-sheet over the career view so the reading context is never lost. Choice cards stack with an 8–9px gap and stretch full-width for confident thumb targets.

## Elevation & Depth

Depth is **tonal, not shadowed.** The three-layer stack — `background` → `surface` → `surface-sunken` — plus hairline `border` does almost all hierarchy work. Cards do not cast shadows on the canvas; they are defined by their border and a barely-there internal gradient (`{components.eventCard.background}`).

Shadow is spent in exactly two places: the **bottom-sheet**, which needs a real upward shadow (`0 -20px 50px -12px rgba(0,0,0,0.7)`) to read as an overlay lifting off the page, and any true modal. The lime top-edge glow is atmosphere, not elevation. The event card also carries a 3px lime left-edge bar as an accent anchor — a flourish, used once per card.

## Shapes

Rounded, calm, modern — never pill-shaped, never sharp. The scale climbs with surface size: **`sm` (6px)** for the smallest bits (delta pills, chip corners, meter tracks), **`md` (10px)** for data chips, **`lg` (14px)** for choice cards and buttons, **`xl` (20px)** for the event card and the bottom-sheet's top corners. The **`avatar` (16px)** is a deliberately-softened square — an identity mark, not a circle, which keeps the esport-manager, roster-card feel. `full` is reserved for genuinely circular elements only (the live-status pulse dot).

Meters and imagery follow their container's radius.

## Components

- **fighterHeader** `{components.fighterHeader}` — Roster identity block: a 54px soft-square avatar with lime initials on a dark gradient, the name in `{typography.title}`, and a muted metadata line (age · division · record · circuit). The win–loss record emphasizes the numerals in `{colors.text}` against muted surrounding text. No fill, no border on the block itself — it sits directly on the canvas.

- **dataChip** `{components.dataChip}` — Compact stat pills across the top (Forme, Mental, Répu., Follow., €): `{colors.surface}` on a `{rounded.md}` corner with a hairline border, muted label + bright `{typography.stat}` value. One chip may carry the accent treatment (`accentBorder` + `accentValue`) to spotlight the single most relevant metric.

- **statBar** `{components.statBar}` — Thin 6px meter: a `{colors.surface-sunken}` track filled by the lime gradient `linear-gradient(90deg, {colors.accent-dim}, {colors.accent})`. Label + tabular value sit above. This is the primary way attributes (Frappe, Lutte, Sol, Cardio) are shown — quiet, horizontal, text-forward.

- **eventCard** `{components.eventCard}` — The narrative centerpiece: `{rounded.xl}`, subtle top-to-bottom surface gradient, hairline border, and a **3px lime left edge**. A lime `{typography.label}` overline names the beat; an optional amber risk flag floats top-right; the headline is `{typography.title}` in `{colors.text-bright}`; the body is `{typography.body}` in `{colors.text-secondary}` for reading comfort.

- **choiceCard** `{components.choiceCard}` — Full-width tappable decision row: `{colors.surface}`, hairline border, `{rounded.lg}`, title in `{typography.body-strong}`, a faint index number (01/02/03) bottom-right. Each choice shows **effect chips**: up-deltas in lime on `accent-wash`, down-deltas in coral on `danger-wash`, neutral in muted on `surface-sunken`. The **recommended/primary** variant swaps to the lime-wash background and `accent-line` border — the only lime-filled surface in the flow, and only one per screen.

- **buttonPrimary** `{components.buttonPrimary}` — Solid lime fill with near-black text, `{rounded.lg}`, 800 weight, ≥48px tall. The one high-emphasis action per view (Valider, Continuer).

- **buttonSecondary** `{components.buttonSecondary}` — Transparent with a hairline border and `{colors.text}` label. For "Retour", "Plus tard", and lower-stakes actions. Never lime.

- **bottomSheet** `{components.bottomSheet}` — The stats dashboard, sliding up over the career screen. `{colors.surface}` panel, `{rounded.xl}` top corners only, a `{colors.border-strong}` grab handle, and the single sanctioned upward shadow. Houses the full stat-meter set and meta gauges without leaving the reading flow.

- **resultBanner** `{components.resultBanner}` — Graded combat outcome. A `{typography.label}` verdict tinted by grade: **victoire nette / moche** in lime `success`, **défaite** in coral `danger`, **upset** in amber `warning` — over a one-line factual recap ("TKO sur enchaînement — +18 followers"). Sober, documentary, never celebratory.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use lime for exactly one emphasis per view — the primary action or the single key signal | Scatter lime across chips, headings, and buttons on the same screen |
| Build depth from tonal layers (`background`→`surface`→`surface-sunken`) + hairline borders | Reach for drop shadows for hierarchy (reserve them for the bottom-sheet/modals) |
| Keep lime and coral strictly semantic: lime = up/win/action, coral = down/loss/injury | Introduce a third saturated hue or color-code by mood/category |
| Set numbers in tabular figures so meters and deltas stay steady | Let value widths jitter as stats change |
| Let event prose breathe in `{typography.body}` at 15/1.6, `{colors.text-secondary}` | Compress narrative to fit more on screen — reading is the loop |
| Keep one type family (Inter); build hierarchy from size/weight | Add a serif or second display face for "flavor" |
| Frame content with 20px mobile margins, single column | Bleed cards edge-to-edge or introduce multi-column layouts |
| Keep the tone sober and second-person (French) | Use hype-commentator language or celebratory color on results |
