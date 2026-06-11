---
name: Ideation Contract Artifacts
description: Mission-brief design system for ideation's generated HTML contracts and implementation notes
colors:
  briefing-indigo: "#6565ec"
  indigo-deep: "#5753c6"
  indigo-ink: "#272962"
  indigo-wash: "#f8f8ff"
  paper: "#ffffff"
  slate-ink: "#2b333b"
  slate-mid: "#60646c"
  slate-faint: "#8b8d98"
  surface-quiet: "#f9f9fb"
  risk-red: "#e54666"
  risk-red-deep: "#ca244d"
  go-green: "#208368"
  caution-amber: "#a06e00"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
    fontSize: "56px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.022em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
    fontSize: "13.5px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.005em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.14em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "14px"
  md: "24px"
  lg: "40px"
  section: "56px"
components:
  hero:
    backgroundColor: "{colors.slate-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "40px"
  goal-card:
    backgroundColor: "{colors.indigo-wash}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
  copy-cmd:
    backgroundColor: "{colors.indigo-ink}"
    textColor: "{colors.indigo-wash}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  copy-btn-accent:
    backgroundColor: "{colors.briefing-indigo}"
    textColor: "#ffffff"
    padding: "5px 10px"
  copy-btn-accent-hover:
    backgroundColor: "{colors.indigo-deep}"
  kicker:
    textColor: "{colors.slate-faint}"
    typography: "{typography.label}"
---

# Design System: Ideation Contract Artifacts

## 1. Overview

**Creative North Star: "The Mission Brief"**

These are operational documents read before committing to action. A developer opens one after a planning interview, reviews scope, phases, and risks, and signs off — the design must carry the weight of that decision. The system is calm in the body and bold at decision points: a single inverted slate-ink hero anchors each document like a briefing-room cover, and everything below it is quiet paper, hairline-bordered panels, and precise mono metadata. Per PRODUCT.md, this is a contract, not a printout — versioning, supersedes lineage, and status are first-class visual citizens.

The system explicitly rejects the generic SaaS dashboard (card grids, hero metrics, gradient accents), the corporate report/PDF (cover-page formality, watermark energy), and the Notion/docs-tool default (flat gray everything-is-a-block sameness). It is also bilingual by construction: light and dark themes are co-equal, switched by `prefers-color-scheme`, and every token has a value in both rooms.

**Key Characteristics:**
- One drenched moment (the inverted hero), then restraint everywhere else
- Structure drawn with hairline inset borders, not cast with shadows
- Mono type is a data channel: metadata, commands, scores, kickers — never prose
- Components are precise and quiet; they recede behind the content they frame
- Single self-contained HTML files: no external fonts, no JS frameworks, print-ready

## 2. Colors

A navy-tinted neutral ramp with one indigo voice and three small status signals.

### Primary
- **Briefing Indigo** (#6565ec): the attention channel. Status text in the hero, the MVP tier fill, accent buttons, the slug dot. It marks "this is the decision-relevant part," never decoration.
- **Indigo Deep** (#5753c6): hover state for accent actions and accent-toned kickers in light mode.
- **Indigo Ink** (#272962): the command-bar background — terminal-dark but unmistakably the brand's own hue, not black.
- **Indigo Wash** (#f8f8ff): tinted panel background for goal cards, first-move, and approval bars; the faintest possible "this panel matters" signal.

### Neutral
- **Paper** (#ffffff): document background in light mode (`#0c111c` deep navy in dark mode).
- **Slate Ink** (#2b333b): body text and the hero's inverted surface. Navy-tinted, never pure black.
- **Slate Mid** (#60646c): secondary prose, reasons, descriptions.
- **Slate Faint** (#8b8d98): metadata, counts, kickers — the quietest legible voice.
- **Surface Quiet** (#f9f9fb): recessed panels (future-scope, check commands).

### Tertiary
- **Risk Red** (#e54666 / deep #ca244d): out-of-scope strikethroughs, risk markers, danger kickers.
- **Go Green** (#208368): phase-card top rails, go-state verdicts.
- **Caution Amber** (#a06e00): judgment-needed criteria labels.

### Named Rules
**The Inverted Hero Rule.** Exactly one drenched surface per document: the slate-ink hero with its indigo blueprint grid. Everything after it sits on paper. A second dark panel competes with the cover and is prohibited (the indigo-ink command bar is a control, not a panel).

**The Signal Budget Rule.** Briefing Indigo marks decisions and status — roughly 10% of any viewport. Red, green, and amber appear only with their semantic meaning (cut, go, judgment). Color never appears "for warmth."

## 3. Typography

**Display Font:** system-ui stack (native sans)
**Body Font:** system-ui stack (same family, weight-differentiated)
**Label/Mono Font:** SF Mono / Fira Code / Cascadia Code / Menlo / Consolas

**Character:** A single native sans worked hard across weights, paired against a mono that handles everything machine-flavored. The contrast axis is sans-vs-mono, prose-vs-data — not font-personality.

### Hierarchy
- **Display** (700, 56px → 36px mobile, line-height 1, -0.03em): the contract title in the hero. One per document.
- **Headline** (700, 32px, 1.05, -0.022em): section titles and the first-move headline.
- **Title** (600, 13.5px, 1.25): phase titles, tier titles, command titles — dense structural labels.
- **Body** (400, 15.5px, 1.65): prose. Approval descriptions cap at 64ch.
- **Label** (mono, 600, 11px, 0.14em tracking, uppercase): kickers, statuses, counts, line numbers. Scores use 18px mono with tabular numerals.

### Named Rules
**The Mono Means Data Rule.** Mono type appears only where content is machine-flavored: commands, metadata, scores, kickers, counts. Mono prose is forbidden.

**The Kicker System.** The mono uppercase kicker (11px, 0.14em, slate-faint) is this system's one deliberate labeling voice — tied to the brief's data-channel grammar, with accent (`indigo-deep`), danger (`risk-red-deep`), and muted variants. It labels data blocks, not generic marketing sections.

## 4. Elevation

Flat, ink-drawn. Structure is drawn with hairline inset borders (`inset 0 0 0 1px` at 9–14% alpha), and shadows are near-subliminal paper lift — navy-tinted (`rgba(3, 2, 13, …)`) at 4–6% opacity. Depth is never the hierarchy mechanism; borders and background tints are. In dark mode the inset borders brighten (white at 10–22% alpha) and shadows go pure black, preserving the same drawn-not-cast feel.

### Shadow Vocabulary
- **Paper lift** (`--shadow-2`: `0 2px 3px -1px rgba(3,2,13,0.05), 0 1px 2px 0 rgba(3,2,13,0.04)`): default for bordered panels and phase cards.
- **Slight hover** (`--shadow-3`: `0 3px 6px -1px rgba(3,2,13,0.06), 0 1px 2px 0 rgba(3,2,13,0.04)`): reserved for elements that gain focus.
- **Border inset** (`--border-inset`: `inset 0 0 0 1px var(--gray-a5)`): the true structural stroke; combine with paper lift on cards.

### Named Rules
**The Ink-Drawn Rule.** If a surface needs definition, draw it (inset hairline or background tint). Shadows above 6% opacity are prohibited; drop-shadow depth as hierarchy is the SaaS-dashboard move this system rejects.

## 5. Components

Precise and quiet: tight radii, mono labels, restrained color. Components frame content and then get out of the way.

### Hero (signature component)
- **Surface:** Slate Ink (#2b333b) panel, 12px radius, 40px padding, inverted text.
- **Blueprint grid:** 40px indigo line grid (`--purple-a3`), masked to fade out by 80% height. The one decorative element in the system, and it's still a drafting reference.
- **Contents:** slug dot + mono slug, 56px display title, right-aligned mono metadata (status in Briefing Indigo, supersedes lineage), readiness gates with 18px tabular-numeral scores.

### Cards / Panels
- **Corner Style:** 6px (inline cards), 8px (panels), 12px (hero, first-move).
- **Background:** Indigo Wash for "this matters" panels (goals, first-move, approval); Surface Quiet for recessed context (future scope); red-tinted (#fff7f8) only for the out-of-scope panel.
- **Shadow Strategy:** border inset + paper lift, per Elevation.
- **Internal Padding:** 12–14px inline cards; 18–32px panels.
- **Phase cards:** 3px Go Green top rail, 200px min-height, chevron arrows between phases (hidden on mobile); gate phases get Indigo Wash.

### Buttons
- **Shape:** small (4px radius), mono-adjacent uppercase 11px labels.
- **Default (`copy-btn`):** translucent gray fill (`--gray-a4`), slate text; hover deepens fill.
- **Accent (`copy-btn-accent`):** Briefing Indigo fill, white 600-weight text; hover shifts to Indigo Deep.
- Buttons exist only as copy-to-clipboard controls inside command bars; this is a document, not an app shell.

### Command Bar (`copy-cmd`)
- **Style:** Indigo Ink background, Indigo Wash mono 13px text, 6px radius, ellipsized single line (or `pre-wrap` wide variant).
- The "terminal moment" of the document — brand-hued, not black.

### Inputs / Fields
None. Artifacts are read-and-approve documents; the only interactivity is copy buttons and `<details>` disclosures (animated chevron marker, 0.15s ease).

### Navigation
None — single-page linear read, 1040px max width, 56px section rhythm. Section headers carry mono counts as wayfinding.

## 6. Do's and Don'ts

### Do:
- **Do** keep exactly one inverted surface per document — the hero. Everything else is paper (The Inverted Hero Rule).
- **Do** draw structure with hairline inset borders at ≤14% alpha plus ≤6%-opacity navy shadows (The Ink-Drawn Rule).
- **Do** use mono + uppercase + 0.14em tracking only for data: kickers, statuses, commands, counts, scores (The Mono Means Data Rule).
- **Do** verify every text/background pair in BOTH themes at WCAG AA (4.5:1 body, 3:1 large) — light and dark are co-equal.
- **Do** keep artifacts self-contained: system fonts only, inline CSS, print stylesheet intact.
- **Do** use tabular numerals (`font-variant-numeric: tabular-nums`) for any score or count column.

### Don't:
- **Don't** build the "generic SaaS dashboard": no identical card grids, no hero-metric blocks, no gradient accents (PRODUCT.md anti-reference).
- **Don't** drift toward "corporate report/PDF" formality: no cover-page ceremony, no watermark energy, no decoration standing in for substance (PRODUCT.md anti-reference).
- **Don't** flatten into the "Notion/docs-tool default": panels must commit to a tint or a border; flat gray block-sameness is prohibited (PRODUCT.md anti-reference).
- **Don't** use pure black anywhere — ink is navy-tinted (#2b333b), shadows are navy (3,2,13), the dark theme floor is deep navy (#0c111c).
- **Don't** add side-stripe accent borders thicker than 1px, gradient text, or glassmorphism. The phase card's 3px top rail is the one sanctioned rail; it carries go/risk semantics.
- **Don't** introduce a second typeface personality; the system is one sans + one mono, differentiated by weight and case.
