# Nested Loops

Nested Loops layers three or more narratives inside each other like Russian nesting dolls. You open Story A, pause it to open Story B, pause that to open Story C — the innermost story — which carries the core message. Then you close C, close B, and close A in reverse order. Each outer story provides context, emotional framing, or stakes for the story inside it. The technique comes from oral storytelling traditions (notably *One Thousand and One Nights*) and works in talks because the open loops create cognitive tension — the audience's brain wants closure on each unfinished story, which keeps attention locked even during abstract or technical middle sections. The innermost story lands hardest because the audience has been primed by the outer layers.

## The Steps

### 1. Open Story A (The Frame)

Begin the outermost story. Establish characters, stakes, and a situation — then leave it unresolved. This is the emotional hook.

**In a talk**: "Last March, our CEO pulled me into a room and said, 'We're losing our biggest customer. You have two weeks.' I want to tell you how that ended. But first, I need to tell you about something that happened six months earlier."

**Slide approach**: 2-3 slides. Set the scene vividly. The cliffhanger should feel natural, not gimmicky.

### 2. Open Story B (The Context)

Pause Story A and begin a second story. This one provides context or a parallel perspective that the audience will need to understand the core message.

**In a talk**: "Six months before that meeting, we'd made a decision about our API versioning strategy. At the time, it seemed obvious. Here's what we chose — and why."

**Slide approach**: 3-5 slides. This is where you start introducing technical content. The audience accepts it because they're still waiting for Story A's resolution.

### 3. Open Story C (The Core Message)

Pause Story B and open the innermost story. This is the talk's key insight, lesson, or technical revelation. It should be the most focused, concrete, and memorable part.

**In a talk**: "But to understand why that versioning choice mattered, I need to show you what happens inside a single API request when versions collide. Watch this."

**Slide approach**: 5-10 slides. This is the heart of the talk. Demos, code walkthroughs, deep technical content. Spend the most time here.

### 4. Close Story C (The Lesson)

Resolve the innermost story. State the insight explicitly. This is the moment the audience has been waiting for without knowing it.

**In a talk**: "The version collision doesn't just break the request — it corrupts the cache for every subsequent request. One bad call poisons thousands. That's the bug."

**Slide approach**: 2-3 slides. Clear, declarative resolution. This should feel like a revelation.

### 5. Close Story B (The Connection)

Return to Story B with new understanding. The audience now sees the earlier decision differently.

**In a talk**: "Now you see why our versioning choice mattered. We'd picked the approach that made version collisions possible. Not inevitable — but possible. And at scale, possible means guaranteed."

**Slide approach**: 2-4 slides. Recontextualize the earlier decision. Show the causal chain from decision to consequence.

### 6. Close Story A (The Resolution)

Return to the outermost story and close it. The resolution should now feel inevitable — the audience has all the context they need.

**In a talk**: "So when the CEO said 'two weeks,' I knew exactly where to look. We shipped the fix in four days. The customer stayed. But the real win wasn't the fix — it was finally understanding why our 'obvious' decisions aren't."

**Slide approach**: 2-4 slides. Resolve the emotional hook. Connect the personal story to the universal lesson. End with the takeaway.

## Duration Mapping

### Lightning Talk (5 min, 10-15 slides)

Use only 2 loops (A and B). Three is too many for 5 minutes:
- **Open A** (2 slides): Quick emotional hook with a cliffhanger
- **Open + Close B** (6-8 slides): The core technical content as a complete inner story
- **Close A** (2-3 slides): Resolution and takeaway

The inner story IS the talk. The outer story is just the hook and landing.

### Standard Talk (20 min, 25-35 slides)

Full 3-loop structure:
- **Open A** (3-4 slides): Establish the frame story
- **Open B** (4-6 slides): Context and technical setup
- **Open + Close C** (8-12 slides): Deep technical core
- **Close B** (3-5 slides): Recontextualize the decision
- **Close A** (3-5 slides): Emotional resolution and takeaways

### Extended Talk (45 min, 50-70 slides)

3-4 loops with expanded inner stories:
- **Open A** (4-6 slides): Rich frame story with multiple characters
- **Open B** (6-10 slides): Detailed context with demos
- **Open C** (3-4 slides): Setup for the core
- **Core D / Close D** (12-18 slides): Extended technical deep-dive with live demos
- **Close C** (4-6 slides): First-level implications
- **Close B** (6-8 slides): Systemic analysis with audience exercises
- **Close A** (6-8 slides): Full resolution, broader lessons, Q&A

Adding a 4th loop is only worth it if each layer genuinely adds a distinct perspective. Don't nest for nesting's sake.

## When to Use

- **Postmortem and incident talks**: The natural structure of "what happened → why it happened → the root cause → what we learned" maps perfectly to nested loops. Each layer peels back a cause.
- **Talks where context is essential but boring alone**: Technical context (API design, architecture decisions) becomes compelling when the audience is waiting for an outer story to resolve.
- **Persuasion through discovery**: When you want the audience to feel like they uncovered the insight themselves, nesting stories creates a breadcrumb trail.
- **Talks with a personal + technical dual thread**: The outer loop is personal/emotional; the inner loop is technical. They reinforce each other.

## When NOT to Use

- **Talks where the audience needs information fast**: Nested Loops delays the core message by design. If the audience is there for a specific answer (a how-to, a tutorial), the delayed resolution feels like stalling.
- **When you don't have 3+ genuine stories**: Forcing nested structure on a single narrative creates artificial detours. If there's only one story, use Story Circle.
- **Highly interactive or workshop-style talks**: The open loops create forward momentum that breaks if the audience does exercises mid-story. Use Petal Structure for workshop-friendly modularity.
- **When combined with Sparkline**: The oscillation of Sparkline and the nesting of Nested Loops create competing rhythms. Pick one.

## Example Mapping

### "The Versioning Incident" — A Postmortem Talk

| Loop | Action | Slides | Content |
|------|--------|--------|---------|
| A | Open | 1-3 | "CEO says we're losing our biggest customer. Two weeks." |
| B | Open | 4-8 | "Six months ago, we chose our API versioning strategy. Here's what we picked." |
| C | Open | 9-11 | "What happens inside a single request when versions collide?" |
| C | Close | 12-16 | "One bad call poisons the cache. That's the bug." |
| B | Close | 17-20 | "Our 'obvious' versioning choice made this possible. At scale, possible = guaranteed." |
| A | Close | 21-25 | "Fixed in 4 days. Customer stayed. The lesson: audit your 'obvious' decisions." |

### "How I Learned to Stop Worrying and Love the Monorepo" — A Architecture Talk

| Loop | Action | Slides | Content |
|------|--------|--------|---------|
| A | Open | 1-3 | "My team was mass-quitting. The reason surprised me." |
| B | Open | 4-7 | "Our microservices architecture, 18 months in. 47 repos." |
| C | Open + Close | 8-18 | "Tracing a single feature across 6 repos. The dependency graph. The deploy coordination. The ownership ambiguity." |
| B | Close | 19-23 | "The architecture wasn't the problem — the repo boundary was. Same architecture, one repo." |
| A | Close | 24-28 | "Nobody quit. The frustration was the tooling friction, not the work. Monorepo migration took 3 sprints." |

## Closure Techniques

The close of each loop must feel satisfying. Three approaches:

- **Echo**: Repeat a phrase or image from the opening. "Remember the CEO pulling me into that room? Here's what I said back." The callback rewards audience attention.
- **Reframe**: Return to the same situation but with changed meaning. "Six months earlier, we called it 'the obvious choice.' Now we call it 'the expensive assumption.'"
- **Resolve**: Answer the literal question or cliffhanger from the opening. "Four days. The fix was four days. The customer stayed."

The outermost loop's closure carries the most emotional weight. Invest in its landing — it is both the end of the story and the beginning of the audience's takeaway.

## Combination Notes

- **Nested Loops + False Start**: Powerful combination. Use a False Start as Story A — open with the "wrong" story, interrupt it, then nest the real stories inside. When you close Story A at the end, the audience sees why the initial story was wrong.
- **Nested Loops + Socratic Path**: Make the innermost story a Socratic sequence of questions. The outer stories provide context; the inner story is a guided discovery.
- **Nested Loops + Petal Structure**: Use Nested Loops as the macro structure but make Story C a Petal — multiple mini-stories around the core insight. Works for extended talks where the core message has multiple facets.
- **Avoid**: Don't combine with Sparkline (competing rhythms) or Converging Ideas (the merging of separate threads conflicts with the opening/closing symmetry of loops).
