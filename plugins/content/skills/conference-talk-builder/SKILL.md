---
name: conference-talk-builder
description: Create conference talk outlines and slide-by-slide content plans using narrative frameworks. Use when the user wants to structure a tech talk, create presentation content, or needs help organizing talk ideas into a story-driven format. Tool-agnostic — outputs a talk script, not slides.
---

# Conference Talk Builder

Transform brain dumps, transcripts, or raw ideas into structured conference talk scripts using narrative frameworks and Nick Nisi's voice.

The output is a **talk script** — a narrative outline with slide-by-slide content plan, speaker notes, and timing guidance. It is deliberately tool-agnostic: feed the script into Slidev, Gamma, iA Presenter, Keynote, or whatever you use to build the actual slides.

## Process

### Stage 0: Entry Path

Determine how the user is starting:

**From scratch** — They have a topic but no material yet. Go to Stage 1.

**From a brain dump** — They have scattered notes, bullet points, ideas. Go to Stage 1 and use their material as the starting input.

**From a transcript** — They have a recording transcript, prior talk, or existing outline. Go to Stage 1-T.

**From feedback** — They have an existing talk script from a prior session and want to revise. Skip to Stage 4.

### Stage 1: Information Gathering

Ask the user for (skip what they've already provided):

- **Talk title** (working title is fine)
- **Topic** — what's the talk about?
- **Target audience** — conference attendees, meetup crowd, internal team, workshop participants?
- **Audience knowledge level** — beginner, intermediate, expert, mixed?
- **Duration** — lightning (5 min), standard (20-30 min), extended (45+ min)?
- **Main points** they want to cover
- **The story** — what problem are they solving, what journey did they take, what do they want the audience to walk away with?
- **Code density** — is this code-heavy, concept-heavy, or balanced?
- **Constraints** — specific technologies, company context, anything off-limits?
- **Brain dump** — everything they know about the topic, unorganized is fine

Don't require all of this upfront. Ask for what's missing after the first pass.

### Stage 1-T: Transcript Analysis

When working from existing material:

1. Read the provided transcript or outline
2. Extract: key themes, narrative arc (if any), main arguments, examples, audience assumptions
3. Identify gaps — what's missing for a complete talk?
4. Summarize what you found and ask the user to fill gaps
5. Proceed to Stage 2 with the extracted material

### Stage 2: Narrative Framework Selection

Read `references/framework-guide.md` for the full selection algorithm.

**Quick-match shortcuts** (covers ~80% of talks):

- Personal journey / "I solved X" → **Story Circle**
- Teaching a concept → **The Spiral** or **Socratic Path**
- "Here's what went wrong" → **In Medias Res** or **Reverse Chronology**
- Tool/approach comparison → **The Rashomon** or **Converging Ideas**
- Vision / persuasion → **The Sparkline**
- Absurd complexity → **Kafkaesque Labyrinth** or **Catch-22**
- Recurring pain → **Sisyphean Arc**
- Myth-busting → **The False Start** or **Comedian's Set**

Run the scoring algorithm from the framework guide using the user's inputs (tone, duration, audience, topic type, code density). Present the top 2 recommendations with a brief sketch of how the talk maps to each framework's structure. Let the user choose or suggest alternatives.

Once a framework is selected, read **only** that framework's reference file from `references/frameworks/`. Do not preload all twenty-two.

### Stage 3: Build the Talk Script

Read `references/voice-tone.md` to calibrate Nick's presentation voice.

**Then calibrate against recent talks:**

1. If the user has given prior talks or published slides, reference those for voice calibration
2. Note patterns that differ from blog writing — talks are more casual, use more humor, and rely on rhythm and pacing

Structure the talk script as a markdown document with:

#### Header

```markdown
# [Talk Title]

**Duration**: [target length]
**Audience**: [who and what level]
**Framework**: [selected framework]
**Slide count target**: [based on duration — see framework reference]

## Narrative Arc

[2-3 sentence summary of the story arc using the framework's structure]
```

#### Slide-by-slide Content Plan

For each slide:

```markdown
### Slide N: [Descriptive Title]

**Framework phase**: [which step/act of the framework this maps to]
**Key visual**: [what should be on the slide — a code block, image, diagram, list, quote, or just a heading]
**On screen**: [the actual text/content the audience sees]

**Speaker notes**: [what you say while this slide is up — written in Nick's voice]

**Transition**: [how this connects to the next slide]
```

#### Appendix

```markdown
## Resources

[Links, references, further reading for the closing slide]

## Timing Guide

[Rough time allocation per framework phase]
```

### Stage 4: Refine and Iterate

After presenting the talk script:

- Ask if the narrative arc feels right
- Check if any sections need expansion or compression
- Verify code examples are appropriately scoped
- Confirm the story flows — does each transition feel natural?
- Check pacing against duration target

**Voice check**: Re-read `references/voice-tone.md` and scan the speaker notes for:

- Does it sound conversational, not scripted?
- Is there vulnerability where appropriate?
- Are there specific details (tool names, numbers, real examples)?
- Is humor self-aware, not forced?
- Would Nick actually say this on stage?

Iterate based on feedback. The talk script is the deliverable — the user takes it to their slide tool of choice.

## Key Principles

**Tell a Story**: You don't need to be an expert. Focus on how you approached a problem and solved it. The journey is more interesting than the destination.

**One Idea Per Slide**: Each slide earns its place by advancing exactly one concept. If you need a bullet list longer than 3-4 items, split across slides.

**Show, Don't Tell**: Code examples, diagrams, screenshots, and demos are more memorable than bullet points. But break complex code across multiple slides.

**Pacing Matters**: Vary the rhythm. Dense technical slides need breathing room — follow them with a simple visual or a moment of humor. Speaker notes should indicate pace changes.

**Make Follow-up Easy**: End with a memorable URL, QR code, or handle linking to slides and resources.

**Engage the Audience**: Use questions. Make eye contact. The speaker notes should include audience interaction cues where appropriate.

## Bundled Resources

### References

- `references/voice-tone.md` — Nick's voice and tone guide. Read this to calibrate speaker notes and talk style.
- `references/framework-guide.md` — Framework selection algorithm with scoring matrix. Read this in Stage 2.

**Narrative frameworks** (read only the selected one — do not preload all twenty-two):

Foundational:
- `references/frameworks/three-act.md` — Setup, confrontation, resolution in three clean beats
- `references/frameworks/freytags-pyramid.md` — Five-phase arc with rising action, climax, and falling action
- `references/frameworks/story-circle.md` — Eight-step hero's journey for personal transformation arcs
- `references/frameworks/kishotenketsu.md` — Four-act twist without conflict — recontextualize, don't confront

Existential:
- `references/frameworks/sisyphean-arc.md` — Recurring struggle reframed as meaningful through persistence
- `references/frameworks/kafkaesque-labyrinth.md` — Navigating absurd bureaucratic or systemic complexity
- `references/frameworks/existential-awakening.md` — Radical freedom and the weight of choosing your tools
- `references/frameworks/strangers-report.md` — Detached observational analysis of a system's contradictions

Absurdist:
- `references/frameworks/the-waiting.md` — Meaning found in the space where nothing happens
- `references/frameworks/the-metamorphosis.md` — Waking up to discover everything has fundamentally changed
- `references/frameworks/catch-22.md` — Circular logic and no-win constraints in systems
- `references/frameworks/comedians-set.md` — Setup-punchline rhythm with callbacks and escalating bits

Non-linear:
- `references/frameworks/in-medias-res.md` — Open mid-action, then rewind to explain
- `references/frameworks/the-spiral.md` — Revisit the same concept at increasing depth each pass
- `references/frameworks/the-rashomon.md` — Same event from multiple perspectives
- `references/frameworks/reverse-chronology.md` — Start with the outcome and work backward

Rhetorical:
- `references/frameworks/the-sparkline.md` — Alternate between "what is" and "what could be"
- `references/frameworks/nested-loops.md` — Layer stories inside stories, resolve in reverse order
- `references/frameworks/the-petal.md` — Multiple independent stories supporting one central thesis
- `references/frameworks/converging-ideas.md` — Separate threads that merge into a single conclusion
- `references/frameworks/the-false-start.md` — Begin with conventional approach, reveal why it fails
- `references/frameworks/socratic-path.md` — Drive through questions the audience is already asking

## Example Workflow

User: "I want to create a talk about how we migrated our monolith to TypeScript"

1. **Stage 0**: Brain dump — they have experience but no structure. Go to Stage 1.
2. **Stage 1**: Gather details — audience is conference (intermediate), 30 min, code-heavy, story of a migration journey.
3. **Stage 2**: Run framework scoring. Top picks: **Story Circle** (journey/transformation, high code affinity) and **The Spiral** (can revisit migration patterns at increasing depth). User picks Story Circle.
4. **Stage 3**: Read `references/frameworks/story-circle.md` and `references/voice-tone.md`. Map the migration to the 8 steps:
   - You: Current JS monolith, team shipping features
   - Need: Type safety issues causing production bugs
   - Go: Research TypeScript, propose migration
   - Search: Pilot conversion on one module, learn the hard way
   - Find: Incremental migration strategy with strict mode
   - Take: Third-party library types, team resistance
   - Return: Full codebase migration complete
   - Change: 40% fewer runtime errors, team converts to TS advocates
5. Generate slide-by-slide talk script (~25-30 slides) with speaker notes in Nick's voice.
6. **Stage 4**: Iterate — user says the "Search" section is too long, compress. Add a humor beat after the "Take" section. Done.

The user then takes this script to Slidev, Gamma, or whatever tool they prefer.
