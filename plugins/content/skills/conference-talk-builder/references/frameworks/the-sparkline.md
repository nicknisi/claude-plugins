# The Sparkline (Nancy Duarte)

The Sparkline alternates between "what is" (current reality) and "what could be" (ideal future) throughout the entire talk. The tension between these two states creates emotional energy that pulls the audience forward. Nancy Duarte identified this pattern by analyzing hundreds of great speeches — from Martin Luther King Jr.'s "I Have a Dream" to Steve Jobs' iPhone launch — and documented it in her book *Resonate*. It works for talks because the oscillation prevents the audience from settling into passive listening; each swing back to "what is" re-engages their frustration, and each swing to "what could be" re-engages their hope. The talk ends by collapsing the gap, showing a clear path from the current state to the future state.

## The Steps

### 1. What Is (Opening Reality)

Establish the current state. Ground the audience in a shared, concrete reality they recognize and live in every day.

**In a talk**: "Right now, deploying our frontend takes 45 minutes. Developers open a PR, wait for CI, wait for staging, wait for approval, wait for the deploy pipeline. Most of that time is waiting."

**Slide approach**: 2-3 slides. Paint the picture with real numbers, screenshots, or a brief demo of the current painful workflow.

### 2. What Could Be (First Contrast)

Swing to the ideal. Don't explain how — just show what the world looks like if the problem were solved.

**In a talk**: "Imagine pushing to main and seeing your change live in under 90 seconds. No waiting. No approval bottleneck. Just confidence."

**Slide approach**: 2-3 slides. Use aspirational language. Show a mock timeline, a cleaned-up dashboard, or a single impressive metric.

### 3. What Is (Deeper Problem)

Swing back to reality, but go deeper. Peel back a layer the audience hadn't considered. The gap between where they just were (the ideal) and where they are now should sting.

**In a talk**: "But it's worse than slow deploys. Because of the wait time, developers batch changes. Batched changes are harder to review. Harder reviews get rubber-stamped. Rubber-stamped reviews ship bugs."

**Slide approach**: 2-3 slides. Build a causal chain. Each slide reveals the next consequence.

### 4. What Could Be (Expanded Vision)

Swing back to the ideal, but expand it. Now that the audience sees the deeper problem, show them the deeper benefit.

**In a talk**: "With fast deploys, changes are small. Small changes are easy to review. Easy reviews are thorough. Thorough reviews catch bugs before production. The deploy speed isn't the point — the feedback loop is."

**Slide approach**: 2-3 slides. Mirror the causal chain from Step 3 but invert it. Show the virtuous cycle.

### 5. What Is (The Obstacle)

Swing back one more time. Name the specific thing standing in the way. This is the crux — the obstacle the audience can actually act on.

**In a talk**: "The bottleneck isn't our CI pipeline. It's the manual approval gate we added after that one incident two years ago. We've been optimizing around a policy nobody's revisited."

**Slide approach**: 2-3 slides. Be specific. Name the thing. Show evidence.

### 6. The New Bliss (Collapse the Gap)

The final swing — but this time, instead of returning to "what is," you show the path. The gap between is and could-be collapses. The audience leaves with a clear trajectory.

**In a talk**: "Here's what we did: replaced the manual gate with automated canary analysis. Deploy time dropped to 80 seconds. Review quality went up because PRs were smaller. Incidents went down. Here's how you can do the same thing."

**Slide approach**: 3-5 slides. Show the solution, the results, and the actionable steps. End with a call to action or key takeaway.

## Duration Mapping

### Lightning Talk (5 min, 10-15 slides)

One full oscillation plus the collapse:
- **What Is** (2-3 slides): One sharp problem statement
- **What Could Be** (2-3 slides): One clear vision
- **What Is — Obstacle** (2-3 slides): Name the one thing in the way
- **New Bliss** (3-4 slides): Solution + takeaway

Skip the deepening oscillations. One contrast is enough to create tension in 5 minutes.

### Standard Talk (20 min, 25-35 slides)

Two full oscillations plus the collapse:
- **What Is — Opening** (3-4 slides): Establish shared reality
- **What Could Be — First** (3-4 slides): Initial vision
- **What Is — Deeper** (3-5 slides): Peel back the layer
- **What Could Be — Expanded** (3-5 slides): Expanded vision
- **What Is — Obstacle** (3-4 slides): Name the blocker
- **New Bliss** (5-7 slides): Solution, results, actions

### Extended Talk (45 min, 50-70 slides)

Three or more oscillations plus the collapse:
- **What Is — Opening** (4-6 slides): Rich context with data and anecdotes
- **What Could Be — First** (4-6 slides): Vision with concrete examples
- **What Is — Deeper** (5-8 slides): Second-order problems, live demos
- **What Could Be — Expanded** (5-8 slides): Systemic benefits, case studies
- **What Is — Obstacle** (5-8 slides): Root cause analysis, audience exercises
- **What Could Be — Aspirational** (4-6 slides): Industry-level vision
- **New Bliss** (8-12 slides): Full solution walkthrough, demo, results, actions, Q&A prompt

Each additional oscillation deepens the emotional investment. Don't add oscillations for length — add them when there are genuine layers to peel.

## When to Use

- **Product or feature launches**: The contrast between current pain and future state is the core of any launch narrative.
- **Change advocacy**: Convincing a team to adopt a new tool, process, or architecture. The oscillation builds dissatisfaction with the status quo.
- **Keynotes and inspirational talks**: The Sparkline is inherently motivational. It works when you want the audience to feel something, not just learn something.
- **Post-incident retrospectives**: Contrast "what happened" with "what should have happened" to build the case for systemic change.

## When NOT to Use

- **Pure tutorials or how-to talks**: If the audience already wants to learn the thing, you don't need to sell them on why. Use Story Circle or Socratic Path instead.
- **Talks with no clear "better future"**: If you're exploring a problem without a solution, the oscillation will feel like teasing without payoff.
- **Highly technical deep-dives**: The emotional oscillation can feel manipulative if the audience wants code, not motivation. Save it for the framing and use a different structure for the technical core.

## Example Mapping

### "Kill the Approval Gate" — A DevOps Talk

| Step | Slides | Content |
|------|--------|---------|
| What Is (Opening) | 1-3 | "Our deploy takes 45 minutes. Here's the timeline." |
| What Could Be (First) | 4-6 | "What if it took 90 seconds? Here's what that looks like." |
| What Is (Deeper) | 7-10 | "Slow deploys cause batching. Batching causes rubber-stamping. Rubber-stamping causes incidents." |
| What Could Be (Expanded) | 11-14 | "Fast deploys → small PRs → real reviews → fewer bugs. The virtuous cycle." |
| What Is (Obstacle) | 15-18 | "The manual approval gate from 2022. Nobody's questioned it." |
| New Bliss | 19-25 | "Automated canary analysis. 80-second deploys. Smaller PRs. Better reviews. Here's how." |

### "Why Your Team Should Adopt TypeScript" — A Persuasion Talk

| Step | Slides | Content |
|------|--------|---------|
| What Is (Opening) | 1-3 | "You ship JavaScript. It works. But every quarter, the same class of bug." |
| What Could Be (First) | 4-5 | "What if the compiler caught those bugs before CI even ran?" |
| What Is (Deeper) | 6-9 | "It's not just runtime errors. It's the onboarding cost, the implicit knowledge, the 'ask Sarah' problem." |
| What Could Be (Expanded) | 10-12 | "Types as documentation that never drifts. New devs productive in days, not weeks." |
| What Is (Obstacle) | 13-15 | "The migration cost feels impossible. 200k lines of JS." |
| New Bliss | 16-20 | "Incremental adoption with allowJs. Start with the API layer. Here's a 3-sprint plan." |

## Oscillation Design

The quality of a Sparkline talk depends on the transitions between "what is" and "what could be." Three techniques for effective oscillation:

- **Emotional contrast**: Pair a frustrating "what is" slide (red metrics, error logs) with an aspirational "what could be" slide (clean dashboards, green builds). The visual contrast amplifies the emotional swing.
- **Concrete to concrete**: Never oscillate between abstract states. "Our deploy is slow" is weaker than "Our deploy takes 45 minutes." "Fast deploys" is weaker than "90-second deploys." Concrete numbers in both states make the gap tangible.
- **Escalating stakes**: Each "what is" should go deeper than the last. The first is surface-level pain. The second reveals structural causes. The third names the root obstacle. If the stakes don't escalate, the oscillation feels repetitive rather than progressive.

## Combination Notes

- **Sparkline + Story Circle**: Use the Sparkline's oscillation for the first half (Steps 1-4 of the Story Circle: You, Need, Go, Search), then shift into Story Circle's linear resolution for the second half (Find, Take, Return, Change). This gives you emotional momentum early and structured payoff late.
- **Sparkline + False Start**: Open with a False Start that establishes a misleading "what could be," then restart with the real Sparkline. The false start makes the genuine oscillation hit harder.
- **Sparkline + Converging Ideas**: Use the Sparkline as the macro structure, but make each "what is" or "what could be" beat come from a different thread (frontend, backend, infra). The convergence happens naturally when the gap collapses.
- **Watch out**: Don't combine with Nested Loops — the oscillation and the nesting create competing structural rhythms that confuse the audience's sense of where they are in the talk.
