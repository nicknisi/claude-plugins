# Narrative Framework Selection Guide

Decision engine for selecting the right narrative framework for a conference talk. Adapted for talk-specific concerns: duration, audience, code density, and delivery style.

## 1. Quick Reference Table

| # | Name | Family | One-line Description | Best For |
|---|------|--------|---------------------|----------|
| 1 | Three-Act Structure | Foundational | Setup, confrontation, resolution in three clean beats | `general`, `educational`, `any-duration` |
| 2 | Freytag's Pyramid | Foundational | Five-phase arc with rising action, climax, and falling action | `deep-dive`, `postmortem`, `extended` |
| 3 | Story Circle | Foundational | Eight-step hero's journey adapted for technical talks | `journey`, `transformation`, `standard` |
| 4 | Kishotenketsu | Foundational | Four-act structure with twist instead of conflict | `surprising-insight`, `reframing`, `no-villain` |
| 5 | Sisyphean Arc | Existential | Recurring struggle reframed as meaningful through persistence | `ops`, `support`, `reliability`, `on-call` |
| 6 | Kafkaesque Labyrinth | Existential | Navigating absurd bureaucratic or systemic complexity | `enterprise`, `legacy-systems`, `process-critique` |
| 7 | Existential Awakening | Existential | Confronting radical freedom and the weight of choosing your tools | `career`, `architecture-decisions`, `greenfield` |
| 8 | Stranger's Report | Existential | Detached, observational analysis of a system's inner contradictions | `audit`, `code-review`, `incident-review` |
| 9 | The Waiting | Absurdist | Tension and meaning found in the space where nothing happens | `async`, `queues`, `waiting-for-ci`, `distributed-systems` |
| 10 | The Metamorphosis | Absurdist | Waking up to discover everything has fundamentally changed | `migration`, `breaking-changes`, `rewrite` |
| 11 | Catch-22 | Absurdist | Exposing circular logic and no-win constraints in systems | `tech-debt`, `tradeoffs`, `impossible-requirements` |
| 12 | Comedian's Set | Absurdist | Setup-punchline rhythm with callbacks and escalating bits | `lightning`, `meetup`, `high-energy`, `entertainment` |
| 13 | In Medias Res | Non-linear | Open in the middle of the action, then rewind to explain | `incident`, `demo-first`, `hook-heavy` |
| 14 | The Spiral | Non-linear | Revisit the same concept at increasing depth each pass | `layered-concept`, `workshop`, `progressive-disclosure` |
| 15 | The Rashomon | Non-linear | Same event told from multiple perspectives | `architecture`, `cross-team`, `empathy`, `tradeoffs` |
| 16 | Reverse Chronology | Non-linear | Start with the outcome and work backward to the cause | `postmortem`, `debugging`, `root-cause` |
| 17 | The Sparkline | Rhetorical | Alternate between "what is" and "what could be" to build desire | `vision`, `product`, `persuasion`, `keynote` |
| 18 | Nested Loops | Rhetorical | Layer stories inside stories, resolving them in reverse order | `storytelling`, `extended`, `multiple-anecdotes` |
| 19 | The Petal | Rhetorical | Multiple independent stories that all support one central thesis | `examples-heavy`, `diverse-audience`, `standard` |
| 20 | Converging Ideas | Rhetorical | Separate threads that merge into a single conclusion | `interdisciplinary`, `synthesis`, `multi-topic` |
| 21 | The False Start | Rhetorical | Begin with a conventional approach, then reveal why it fails | `refactoring`, `paradigm-shift`, `myth-busting` |
| 22 | The Socratic Path | Rhetorical | Drive the talk through questions the audience is already asking | `educational`, `workshop`, `interactive` |

## 2. Auto-Suggest Decision Matrix

### Tone to Family Mapping

| Tone | Primary Family | Secondary Family |
|------|---------------|-----------------|
| Educational | Foundational | Rhetorical |
| Inspirational | Rhetorical | Existential |
| Demo-heavy | Non-linear | Foundational |
| Storytelling | Existential | Absurdist |
| Educational + Storytelling | Foundational | Non-linear |
| Inspirational + Demo-heavy | Rhetorical | Non-linear |

### Duration to Complexity Filter

| Duration | Max Complexity | Excluded Frameworks |
|----------|---------------|-------------------|
| Lightning (5 min) | Low | Freytag's Pyramid, Story Circle (full 8-step), Nested Loops, The Spiral, Reverse Chronology |
| Standard (20-30 min) | Medium | Nested Loops (risky, needs tight control) |
| Extended (45+ min) | High | Comedian's Set (hard to sustain), In Medias Res (impact fades at length) |

Complexity ratings:

- **Low**: Three-Act, Kishotenketsu, In Medias Res, Comedian's Set, The False Start, The Petal
- **Medium**: Story Circle, Sparkline, Socratic Path, Converging Ideas, Catch-22, Sisyphean Arc, Stranger's Report, The Metamorphosis, The Waiting
- **High**: Freytag's Pyramid, Nested Loops, The Spiral, The Rashomon, Reverse Chronology, Kafkaesque Labyrinth, Existential Awakening

### Audience to Formality Adjustment

| Audience | Formality | Effect |
|----------|-----------|--------|
| Conference | High | Favor Rhetorical and Foundational families. Absurdist frameworks need confident delivery notes. |
| Meetup | Medium | All families viable. Absurdist and Non-linear frameworks play well. |
| Internal team | Low | Existential and Absurdist families resonate (shared context). Comedic tone is safer. |
| Workshop | Medium | Favor Foundational, Spiral, and Socratic Path. Needs participatory beats. |
| Lightning talk | Medium-High | Favor low-complexity frameworks. Every slide must earn its place. |

### Topic Type Signals

| Topic Type | Strong Signal Frameworks | Rationale |
|-----------|------------------------|-----------|
| Support Engineering | Sisyphean Arc, Catch-22, Story Circle | Recurring struggle, impossible constraints, transformation arcs |
| Developer Tools | The False Start, Sparkline, In Medias Res | "Old way was wrong", vision-casting, demo-first hooks |
| Product | Sparkline, Converging Ideas, The Petal | Persuasion, synthesis, multi-example proof |
| Technical Deep-dive | The Spiral, Freytag's Pyramid, Story Circle | Layered depth, classical arc, transformation journey |
| Career/Growth | Existential Awakening, Three-Act, Nested Loops | Freedom of choice, clean arc, layered personal stories |
| Incident/Postmortem | Reverse Chronology, In Medias Res, Stranger's Report | Work backward from outcome, start in the action, detached analysis |

### Code Density Adjustment

When the talk is code-heavy, deprioritize frameworks that lack natural code insertion points:

| Framework | Code Affinity | Notes |
|-----------|--------------|-------|
| Story Circle | High | Code fits naturally in Search, Find, Return |
| The Spiral | High | Code deepens on each pass |
| Three-Act | High | Code in Act 2 (confrontation) |
| In Medias Res | High | Open with the code that broke/worked |
| Freytag's Pyramid | High | Code throughout rising/falling action |
| The Rashomon | High | Same code from different perspectives |
| Reverse Chronology | High | Walk backward through code changes |
| The False Start | High | Show the wrong code, then the right code |
| The Socratic Path | High | Code answers each question |
| Sparkline | Medium | Code in "what could be" segments |
| Kishotenketsu | Medium | Code in twist (ten) phase |
| The Waiting | Medium | Code for the "waiting" visualization |
| The Metamorphosis | Medium | Before/after code comparisons |
| Catch-22 | Medium | Code that demonstrates the circular constraint |
| Sisyphean Arc | Medium | Code in the recurring cycle |
| Stranger's Report | Medium | Code as evidence in the report |
| The Petal | Medium | Code examples as individual petals |
| Converging Ideas | Medium | Code threads that merge |
| Comedian's Set | Low | Code breaks comedic rhythm |
| Nested Loops | Low | Story layering conflicts with code focus |
| Existential Awakening | Low | Abstract framework, code feels forced |
| Kafkaesque Labyrinth | Low | Narrative-driven, code is secondary |

## 3. Scoring Algorithm

Score each of the 22 frameworks against the collected inputs and present the top recommendations.

### Procedure

Start every framework at a base score of zero. Apply modifiers in order:

**Step 1: Family Affinity (0-3 points).** Look up the speaker's tone in the tone-to-family mapping table. Frameworks in the primary family get 3 points. Secondary family gets 1 point. Others get 0.

**Step 2: Duration Filter (pass/fail).** Check the framework's complexity rating against the duration's max complexity. If a framework exceeds the ceiling, eliminate it entirely.

**Step 3: Topic Signal Boost (+3 points).** If the framework appears in the strong signal list for the speaker's topic type, add 3 points. This is the strongest signal — topic-framework fit matters most.

**Step 4: Audience Modifier (+1 or -1 point).** +1 bonus if the framework belongs to a family the audience table marks as favorable. -1 penalty if the audience context makes the framework risky.

**Step 5: Code Affinity (+2 / 0 / -2 points).** Only applies when the talk is code-heavy. High affinity gets +2. Medium gets 0. Low gets -2.

**Step 6: Tiebreaker.** If frameworks share the top score, prefer lower complexity (easier to execute well). If still tied, prefer earlier in the quick reference table (reflects general versatility).

### Presenting Results

Present the top 2 scoring frameworks as primary recommendations. For each, include:

- Framework name and family
- 2-3 sentence explanation of why it fits this specific talk
- Brief sketch of how the talk's topic maps onto the framework's structure

Below the top 2, group remaining eligible frameworks by family. Display each as a one-line note explaining what it would emphasize differently.

If the top score is 3 or below (weak match), flag this and ask the speaker to describe their talk's "shape" in their own words for manual mapping.

## 4. Framework Compatibility Notes

Some frameworks combine well as layers rather than alternatives.

### Universal Openers

**In Medias Res** works as an opening gambit for nearly any framework. Start with a dramatic moment, then transition into your chosen framework's structure. Particularly effective paired with Story Circle (open at step 5, rewind to step 1), Reverse Chronology (open at the end, keep going backward), and Three-Act (open in Act 2, flash back to Act 1).

### Strong Combinations

- **Sparkline + Sisyphean Arc** — The "what is / what could be" oscillation maps onto the cycle of struggle and reset. Strong for reliability and operational talks.
- **The Spiral + Socratic Path** — Each spiral pass framed as answering a deeper question. "What is this?" → "How does it work?" → "What are the edge cases?"
- **The Petal + Converging Ideas** — Petals provide independent examples; Converging Ideas provides the merge moment.
- **Three-Act + The False Start** — Act 1 is the false start. The break becomes the Act 1/Act 2 boundary. Clean and dramatic.
- **Comedian's Set as tone layer** — The setup-punchline rhythm and callback technique can overlay any framework. Apply to Three-Act for a lighthearted meetup version, or Sisyphean Arc to make recurring pain funny.
- **Stranger's Report as analytical overlay** — The detached voice works as a delivery style on top of any framework for postmortems and code reviews.

### Combinations to Avoid

- **Nested Loops + The Spiral** — Both revisit material but for different reasons. Creates confusion.
- **Reverse Chronology + Kishotenketsu** — Running backwards removes the surprise the twist needs.
- **Kafkaesque Labyrinth + Socratic Path** — Labyrinth needs disorientation; Socratic Path needs clarity.

## 5. Family Overviews

### Foundational

The workhorses. Clear, reliable structures audiences instinctively understand. Reach for these when you want the structure to disappear and the content to dominate, when the audience is large or unfamiliar, or when unsure what else to use.

### Existential

Drawn from existentialist literature. They give language to the particular absurdity of working in technology. Treat struggle, alienation, and radical choice as conditions to navigate honestly. Reach for these when the talk is about recurring pain with no clean fix, when the audience shares institutional context, or when you want to validate the difficulty of the work.

### Absurdist

Where Existential frameworks acknowledge the struggle, Absurdist frameworks laugh at it. They find humor, irony, and insight in the contradictions. Reach for these when the audience needs catharsis, when the topic involves impossible tradeoffs everyone recognizes, or when you want the talk to be memorable for honesty and wit.

### Non-linear

Frameworks that break chronological order to serve comprehension. Reach for these when the most interesting part isn't at the beginning, when the topic benefits from multiple viewpoints, or when progressive deepening serves the audience better than a single pass.

### Rhetorical

Persuasion engines. Designed to move an audience from one position to another through deliberate structural choices. Reach for these when you need the audience to believe something, adopt something, or change behavior, or when the talk serves a strategic purpose beyond information transfer.
