# Three-Act Structure for Technical Presentations

The Three-Act Structure is the oldest and most universal narrative framework, traceable to Aristotle's *Poetics*. It divides any story into Setup, Confrontation, and Resolution. Its power is its simplicity — audiences intuitively expect this shape, so it requires almost no structural overhead to follow. For technical talks, it works as a reliable baseline when you have a clear problem and a clear solution but don't need the granularity of more elaborate frameworks.

## The Acts

### Act I: Setup (The World and the Problem)

Establish the audience's current reality, then introduce the problem that disrupts it. By the end of Act I, the audience should understand *what exists* and *why it's insufficient*. The transition into Act II is the "inciting incident" — the moment that makes the status quo untenable.

**In a talk**: "Your team ships features weekly. Deploys are automated, tests pass, PRs get reviewed. Life is decent. But last quarter, three customer-facing incidents shipped past every safeguard you had. The process that felt solid has a crack in it."

**Slide approach**: 4-8 slides. Open with the familiar world (1-2 slides), then build tension toward the problem (2-4 slides), and end with a sharp inciting incident slide (1-2 slides) that commits you to the journey.

### Act II: Confrontation (Attempts and Obstacles)

This is the longest act — typically half the talk. The speaker explores approaches, encounters obstacles, and deepens the audience's understanding. Act II is where credibility is built. You show that you didn't just stumble onto a solution; you earned it through investigation. Structure Act II as a series of escalating attempts: each one gets closer, each one reveals a new constraint.

**In a talk**: "First, we added more integration tests. Coverage went up, but incident rate didn't budge — the bugs were in the interactions between services, not within them. So we tried contract testing. Better, but the contracts drifted from reality within weeks. Then we instrumented production traffic and replayed it against staging. That caught real issues, but the infrastructure cost was brutal."

**Slide approach**: 12-25 slides depending on talk length. Structure as 2-4 sub-sections, each following a mini attempt-obstacle-learning cycle. This is where code, demos, and data live.

### Act III: Resolution (Solution and Impact)

Deliver the solution that emerged from the confrontation, then show its real-world impact. Act III must do three things: present the solution clearly, acknowledge its tradeoffs honestly, and send the audience home with something actionable. A weak Act III — where the solution feels rushed or the ending is just "questions?" — undercuts everything that came before.

**In a talk**: "The answer wasn't more testing — it was changing *when* we tested. We moved validation into the deployment pipeline itself, using production traffic shadows against canary instances. Incident rate dropped 70% in one quarter. The tradeoff: deploy times went from 4 minutes to 11, and we needed dedicated infrastructure. Here's how you evaluate whether this tradeoff makes sense for your team."

**Slide approach**: 6-12 slides. Present the solution (2-4 slides), show evidence of impact (2-3 slides), acknowledge tradeoffs (1-2 slides), and close with actionable takeaways (2-3 slides).

## Duration Mapping

### Lightning Talk (5 min, 10-15 slides)

Ruthlessly compress:
- **Act I** (2-3 slides): One slide for the world, one for the problem, one for the inciting incident
- **Act II** (4-7 slides): One attempt only — show the most instructive failure, then pivot to the solution
- **Act III** (3-5 slides): Solution, one piece of evidence, one takeaway

In a lightning talk, Act II collapses almost entirely. You state the problem, show the key insight, and land the solution. This is fine — the Three-Act Structure degrades gracefully because even at minimum, Setup-Confrontation-Resolution gives the audience a satisfying arc.

### Standard Talk (20 min, 25-35 slides)

The natural home for Three-Act:
- **Act I** (4-8 slides): Full setup with relatable context and a well-developed inciting incident
- **Act II** (12-18 slides): 2-3 attempts with real code, data, or demos. Each attempt deepens understanding
- **Act III** (6-10 slides): Solution with evidence, honest tradeoffs, and actionable steps

### Extended Talk (45 min, 50-70 slides)

Act II expands significantly:
- **Act I** (8-12 slides): Rich context-setting. Multiple stakeholder perspectives. Data on the problem's scope
- **Act II** (28-40 slides): 3-4 full attempt-obstacle-learning cycles. Live demos. Audience checkpoints ("Who's tried this?"). Deep code walkthroughs
- **Act III** (12-18 slides): Solution deep-dive, production results over time, tradeoff analysis, multiple levels of "try this" (beginner, intermediate, advanced)

Consider adding a brief intermission or audience reflection point at the Act II/Act III transition in extended talks.

## When to Use

- **Any talk where you're not sure what framework to use** — Three-Act is the safest default
- **Problem/solution talks** — the structure maps directly: problem is Act I, investigation is Act II, solution is Act III
- **Postmortems and incident reviews** — what happened, what we tried, what we learned
- **Tool or library introductions** — the pain before, the search for a tool, the tool in action
- **Talks with a single clear throughline** — Three-Act rewards linear narratives

## When NOT to Use

- **Talks with no clear "problem"** — exploratory or educational talks where you're teaching a concept (not solving a problem) can feel forced into Three-Act. Consider Kishotenketsu instead
- **Talks with multiple distinct insights** — if you have 3-4 independent points to make, Three-Act forces you to serialize them into a single arc, which can feel artificial. A modular structure may work better
- **Talks where the journey matters more than the destination** — if the process of exploration is the point (not the solution), Story Circle gives you more steps to develop that journey
- **Very dramatic reveals** — if your talk builds to a single explosive "aha!" moment, Freytag's Pyramid gives you better tools for building to and descending from a climax

## Example Mapping

### Support Engineering: "Reducing Escalation Response Time by 60%"

| Act | Content | Slides |
|-----|---------|--------|
| **I: Setup** | "Your team handles 200 escalations/month. Average resolution: 4.2 hours. Customers are frustrated, engineers are burned out. Last month, a P1 sat for 6 hours because three engineers worked it independently without knowing." | 5 |
| **II: Confrontation** | Attempt 1: Better runbooks — helped new hires, didn't move the needle for experienced engineers. Attempt 2: Centralized triage queue — reduced duplicate work but created a bottleneck. Attempt 3: Pattern tagging + routing rules — promising but tags were inconsistent. Show real ticket data, routing logic code, dashboard screenshots. | 16 |
| **III: Resolution** | Automated pattern detection on incoming tickets using embedding similarity. Routes to the engineer who resolved the most similar past tickets. Resolution time dropped to 1.6 hours. Tradeoff: requires 3 months of historical ticket data, cold-start problem for new issue types. "Start by tagging your last 100 resolved tickets with root cause categories." | 9 |

### Developer Tools: "Why We Rewrote Our CLI in Rust"

| Act | Content | Slides |
|-----|---------|--------|
| **I: Setup** | "Our CLI is used by 12,000 developers daily. It's written in Node.js, it works, and nobody loves it. Startup time is 1.8 seconds. On CI, that's 14 minutes of wasted compute per day across all pipelines." | 4 |
| **II: Confrontation** | Attempt 1: Optimize the Node.js code — got startup to 900ms, hit a floor. Attempt 2: Bundle with pkg — faster cold start but binary was 120MB. Attempt 3: Rewrite critical path in Rust with Node.js shell — two codebases, two bug surfaces. Show profiling data, bundle analysis, and the hybrid architecture diagram. | 14 |
| **III: Resolution** | Full Rust rewrite with backwards-compatible command interface. Startup: 40ms. Binary: 8MB. But: 4-month rewrite, team had to learn Rust, plugin ecosystem had to be rebuilt. "Here's the decision matrix we used — and here's when a rewrite is NOT the answer." | 8 |

## Combination Notes

**Three-Act + Story Circle**: Three-Act is essentially a compressed Story Circle. If you outline in Three-Act and find Act II feels flat, expand it using Story Circle's Steps 3-6 (Go, Search, Find, Take) to add texture to the confrontation.

**Three-Act + Freytag's Pyramid**: If your Act II has a natural climax — a moment where everything clicks — consider using Freytag's rising/falling action to structure Act II internally. Act II becomes its own mini-pyramid.

**Three-Act + Kishotenketsu**: Kishotenketsu's "twist" (Ten) can replace Act II's final obstacle. Instead of the last attempt failing, it reframes the entire problem. This works when your solution came from a perspective shift rather than iteration.

**Nested Three-Act**: For extended talks, each major section of Act II can itself follow a mini three-act structure: setup the attempt, show the obstacle, resolve with a learning. This creates a satisfying rhythm without requiring a different framework.
