# Story Circle for Technical Presentations

The Story Circle (adapted from Dan Harmon's narrative framework) maps naturally to technical talks. Every good talk takes the audience on a journey from where they are to somewhere new.

## The 8 Steps

### 1. You (Comfort Zone)

Establish where the audience is right now. Ground them in familiar territory.

**In a talk**: "You're a developer who deploys to production. You write tests. Things mostly work."

**Slide approach**: 1-2 slides. Use relatable scenarios. Keep it brief — the audience knows their own world.

### 2. Need (Desire)

Introduce the gap, problem, or desire. Why should they care?

**In a talk**: "But when things break at 2am, you're flying blind. Logs are scattered, metrics don't correlate, and the on-call runbook is from 2019."

**Slide approach**: 2-3 slides. Make the pain concrete. Use specific examples, not abstract problems.

### 3. Go (Unfamiliar Situation)

The first step into the unknown. What did you (or the industry) try first?

**In a talk**: "So we started looking at observability platforms. We tried the obvious stuff first."

**Slide approach**: 2-3 slides. This is the "we ventured forth" moment.

### 4. Search (Adaptation)

The deep dive. What approaches were tried? What was learned along the way?

**In a talk**: "We evaluated three approaches. Each taught us something, but none were quite right."

**Slide approach**: 3-5 slides. This is where the talk's depth lives. Multiple examples, code snippets, demos.

### 5. Find (Discovery)

The breakthrough moment. The "aha!" that changes everything.

**In a talk**: "Then we realized the problem wasn't our tools — it was our mental model."

**Slide approach**: 2-3 slides. This should feel like a revelation. Consider a full-slide statement or quote.

### 6. Take (Consequence)

Nothing is free. What are the tradeoffs, costs, or challenges of the solution?

**In a talk**: "This approach works, but it requires rethinking how we structure our services."

**Slide approach**: 2-3 slides. Honest assessment builds credibility. Don't skip this.

### 7. Return (Familiar)

Bring it back to the audience's world. How do they apply this?

**In a talk**: "Here's how you can start with this approach in your own codebase, today."

**Slide approach**: 2-3 slides. Practical, actionable steps.

### 8. Change (Transformed)

The audience is different now. Land the key takeaway.

**In a talk**: "You came in thinking about monitoring. You're leaving thinking about observability as a design principle."

**Slide approach**: 1-2 slides. Circle back to Step 1 but show what's changed. End with the key message.

## Duration Mapping

### Lightning Talk (5 min, 10-15 slides)

Compress to 3 acts:
- **Need** (2-3 slides): State the problem sharply
- **Find** (4-6 slides): Show the solution with one clear example
- **Change** (2-3 slides): Key takeaway + call to action

Skip You, Go, Search, Take, Return. No time for the journey — go straight to the point.

### Standard Talk (20 min, 25-35 slides)

Use all 8 steps but keep Steps 1, 7, 8 tight:
- Steps 1-2: 3-5 slides (establish + problem)
- Steps 3-4: 8-12 slides (exploration + depth)
- Steps 5-6: 5-8 slides (solution + tradeoffs)
- Steps 7-8: 4-6 slides (application + conclusion)

### Extended Talk (45 min, 50-70 slides)

Full depth on every step. Add:
- Multiple examples in Search (Step 4)
- Live demos in Find (Step 5)
- Audience exercises or reflection in Return (Step 7)
- Q&A prompt before Change (Step 8)

## When to Break the Framework

**Demo-heavy talks**: Expand Steps 3-5 into a live demo arc. Compress Steps 1, 7, 8.

**Workshop format**: Replace Steps 3-5 with Concept → Example → Exercise loops. Multiple mini story circles.

**Announcement/launch talks**: Steps 1-2 are the current state, Step 5 is the announcement, Steps 6-8 are adoption guidance. Steps 3-4 are "how we got here" (optional backstory).

**Problem-focused talks (debugging, postmortems)**: Expand Steps 2-4 (the problem space). Steps 5-6 become the resolution. Step 7 is "how to prevent this."

## Examples

### Support Engineering Talk

| Step | Content |
|------|---------|
| You | "You handle escalations every day" |
| Need | "But complex issues take too long to resolve" |
| Go | "We tried adding more docs, more training" |
| Search | "What actually slows resolution? Data from 500 tickets" |
| Find | "Pattern recognition beats documentation" |
| Take | "Requires investment in tooling and taxonomy" |
| Return | "Three changes you can make this sprint" |
| Change | "From ticket-taker to pattern-spotter" |

### Technical Deep-Dive

| Step | Content |
|------|---------|
| You | "You use TypeScript every day" |
| Need | "But your types don't catch the bugs that matter" |
| Go | "What if types could encode business rules?" |
| Search | "Branded types, template literals, conditional types" |
| Find | "Combining these creates a compile-time safety net" |
| Take | "More complex types, steeper learning curve" |
| Return | "Start with these 3 patterns in your codebase" |
| Change | "From 'types as documentation' to 'types as validation'" |
