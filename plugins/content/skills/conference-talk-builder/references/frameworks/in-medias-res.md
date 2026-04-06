# In Medias Res for Technical Presentations

In Medias Res ("into the middle of things") drops the audience directly into the most compelling moment of your story, then rewinds to fill in context. Originating from Homer's epic poetry tradition — both the *Iliad* and the *Odyssey* open mid-action — the technique exploits a fundamental cognitive hook: when people witness a crisis without context, they cannot help but ask "how did we get here?" That question keeps them engaged through setup material that would otherwise feel slow. For technical talks, this means opening with the production incident, the failing test, the angry Slack thread, or the dashboard on fire — then rewinding to explain the architecture, decisions, and assumptions that led to that moment.

## The Phases

### 1. The Drop (Crisis Moment)

Open with maximum tension. No preamble, no agenda slide. The audience lands in the middle of something going wrong (or surprisingly right). The Drop works because of information asymmetry — the audience sees the outcome but lacks the context. That gap is what generates the tension that will carry them through the rest of the talk.

**In a talk**: "It's 2:47am. PagerDuty fires. The payments service is returning 500s for every request. Grafana shows a cliff — requests per second dropped from 12,000 to zero in under 90 seconds. Here's what our dashboard looked like." Then show the actual dashboard screenshot or terminal output. The more specific and real the artifact, the stronger the hook. Avoid hypotheticals here — the audience needs to feel that this actually happened.

**Slide approach**: 2-3 slides. Hit hard and fast. A dramatic visual, a terminal screenshot, a real error message. No title slide yet — save the formal introduction for after the hook. Consider starting with a black slide and a single line of text (the timestamp, the alert message) before revealing the full picture.

### 2. The Freeze (Build Curiosity)

Pause the action. Acknowledge the audience's confusion. Explicitly name the question you want them to hold.

**In a talk**: "We'll come back to this moment. But to understand why this happened — and why the fix was the opposite of what you'd expect — we need to go back three months."

**Slide approach**: 1-2 slides. This is a transitional beat. A single statement slide works well. This is also where you can drop in your title slide and speaker introduction if you skipped them at the top. The delayed introduction is a signature move of In Medias Res — the audience has already decided to trust you because you opened with something real, not a bio slide.

### 3. The Rewind (Context & Setup)

Now deliver the exposition that the audience is primed to receive. Architecture decisions, team context, constraints, the codebase's history. This is the material that would be boring as an opener but is now charged with dramatic irony — the audience knows something goes wrong. Every piece of context you present, the audience is silently evaluating: "is THIS the thing that caused it?"

That dramatic irony is your most powerful tool in this phase. Lean into it. When you explain a decision that seems reasonable, the audience is already suspicious. When you show code that looks fine, they're scanning for the flaw. This makes technical exposition genuinely engaging in a way that's nearly impossible with linear storytelling.

**In a talk**: "Three months ago we migrated from a monolith to microservices. Here's the architecture we chose, and here's the key assumption we made about database connection pooling. This assumption was reasonable — here's why everyone on the team agreed." Present each decision charitably. The audience should think "I would have made the same choice."

**Slide approach**: 5-10 slides. This is your longest section. Architecture diagrams, code snippets, decision records. The audience tolerates depth here because they're watching for the flaw they know is coming. Use progressive disclosure — introduce the system layer by layer, letting the audience build a mental model they'll need for the Catch-Up.

### 4. The Catch-Up (Rejoin the Crisis)

Accelerate back to the opening moment. Connect the dots between what you just explained and the crisis the audience witnessed. The "aha" hits here — the audience now understands what they were looking at. This is the most satisfying moment of the talk: the gap between "what happened" and "why it happened" closes. The pacing should build — start deliberate, then accelerate as the connections become obvious.

**In a talk**: "So when traffic spiked on launch night, every service tried to open new database connections simultaneously. The connection pool wasn't shared — it was per-pod. 47 pods times 20 connections each. The database had a limit of 100. That's what the dashboard was showing us."

**Slide approach**: 3-5 slides. Build momentum. Each slide should connect one piece of backstory to the crisis. The audience should feel the pieces clicking into place. Consider a visual that maps each element of the backstory to a specific detail in the opening crisis slide.

### 5. The Resolution (Continue Forward)

Now continue past the opening moment. What happened next? How was it fixed? What was learned? This section has earned full attention because the audience is emotionally invested in the outcome. The Resolution has two jobs: satisfy the narrative tension (what happened?) and deliver the transferable value (what can the audience use?).

**In a talk**: "Here's what we did in the next 4 hours to restore service, and here's the architectural change we shipped the following week that made this class of failure impossible. The connection pooler now lives here, and here's what the config looks like."

**Slide approach**: 4-6 slides. Solution, implementation, results, and takeaways. Split this into the immediate fix (what we did that night) and the systemic fix (what we changed permanently). End by connecting the resolution back to something the audience can use — a pattern, a checklist, a tool, a principle.

## Duration Mapping

### Lightning Talk (5 min, 10-15 slides)

Compress to three beats:
- **Drop** (2-3 slides): The crisis moment — make it vivid and specific
- **Rewind** (4-6 slides): One key piece of context that explains the crisis
- **Resolution** (3-4 slides): The fix and the lesson

Skip the Freeze and Catch-Up phases. Go directly from crisis to "here's why" to "here's how we fixed it." The rewind is just one flashback, not a full history. You can still do the delayed introduction — open with the crisis, then say "I'm [name], and this happened to my team" as part of the single rewind beat.

### Standard Talk (20 min, 25-35 slides)

Use all 5 phases:
- **Drop**: 2-3 slides (open with impact)
- **Freeze**: 1-2 slides (introduce yourself, frame the question)
- **Rewind**: 10-14 slides (full context, architecture, decisions)
- **Catch-Up**: 4-6 slides (connect backstory to crisis)
- **Resolution**: 5-8 slides (fix, results, takeaways)

### Extended Talk (45 min, 50-70 slides)

Full depth everywhere. Expand the Rewind into multiple chapters with their own mini-tensions:
- **Drop**: 3-5 slides (extended crisis with multiple artifacts — dashboard, Slack, logs)
- **Freeze**: 2-3 slides (thorough self-introduction, preview of the journey)
- **Rewind**: 20-30 slides (multiple flashback layers at different time scales)
- **Catch-Up**: 8-12 slides (detailed reconstruction, live demo of the failure)
- **Resolution**: 10-15 slides (immediate fix, systemic fix, metrics, audience exercises)

Add multiple flashback layers in the Rewind (decisions at different time scales — last week, last month, last year). Include a live demo during the Catch-Up showing the failure reproduced in a staging environment. Extend the Resolution with implementation details, before/after metrics, and a "what we'd do differently" reflection before the close.

## When to Use

- **Incident retrospectives and postmortems**: The natural structure of "something broke, here's why" maps perfectly. The audience already expects a timeline; In Medias Res just starts at the most interesting point instead of the beginning.
- **Debugging stories**: Start with the symptom, rewind to the cause. The audience experiences the same "working backwards" process the debugger did.
- **Migration and refactoring talks**: Start with the successful (or failed) outcome, then explain the journey. Migrations are inherently long stories; the drop keeps the audience engaged through the exposition.
- **Talks where the setup is inherently dry**: Architecture decisions, config choices, and infrastructure talks become engaging when the audience knows a crisis is coming.
- **When you have a specific, vivid moment** to anchor the talk. The Drop only works if it's concrete and dramatic — real dashboards, real error messages, real Slack threads.

## When NOT to Use

- **Tutorial or educational talks**: If there's no crisis or dramatic moment, forcing one feels artificial. Use The Spiral instead.
- **Announcement or launch talks**: The audience wants to hear the news, not wait through a manufactured flashback. Don't make people sit through a crisis arc to find out about your new feature.
- **Talks where the "crisis" is mild**: "Our build was slow" is not a compelling Drop. The opening moment needs genuine stakes — financial impact, data loss, customer churn, or at minimum, significant engineering time burned.
- **Highly abstract or conceptual talks**: In Medias Res requires a concrete event. If your talk is about type theory or design principles without a grounding incident, choose another framework.
- **When the audience needs sequential understanding first**: Some topics (cryptography, distributed consensus) require building blocks in order. Jumping ahead creates confusion, not curiosity.

## Example Mapping

### "How a Typo Took Down DNS for 3 Hours" — Debugging Story

| Phase | Content |
|-------|---------|
| Drop | "Our monitoring goes blank. Not red — blank. Grafana can't resolve our metrics endpoint. Because nothing can resolve anything. DNS is down." Show the empty dashboard. |
| Freeze | "A single character in a BIND config file did this. Let me show you which character and how it got there." |
| Rewind | The DNS infrastructure. The config management pipeline. The PR that updated a TTL value — and the trailing dot that was accidentally deleted from an FQDN. What a trailing dot means in DNS. Why the config parser didn't catch it. |
| Catch-Up | "Without the trailing dot, `api.example.com` became `api.example.com.example.com`. Every internal service resolution failed. Cascading timeouts took down everything that depended on DNS — which was everything." |
| Resolution | Config validation in CI that parses BIND zones before merge. The one-line test that would have caught this. The argument for infrastructure-as-code over manual config. |

### "The Deploy That Deleted Production" — Incident Retrospective

| Phase | Content |
|-------|---------|
| Drop | "Friday 5:02pm. `kubectl apply` completes. Every pod in the production namespace terminates. Not restarts — terminates. Here's the Slack thread." |
| Freeze | "I'm [name], SRE at [company]. To understand how a routine deploy did this, we need to rewind to a Helm chart change made 6 weeks ago." |
| Rewind | The Helm chart refactor. The label selector change. The review that approved it. The staging environment that didn't catch it (and why). The CD pipeline's assumptions about immutable selectors. |
| Catch-Up | "So when the new chart applied, Kubernetes saw pods with labels that didn't match any deployment. Orphaned pods get garbage collected. Every single one." |
| Resolution | Admission controller that blocks label selector changes. Pre-deploy diff tooling. The 3 questions to add to every Helm chart review. |

### "Why We Mass Reverted Our React Migration" — Architecture Decision Talk

| Phase | Content |
|-------|---------|
| Drop | "Here's the PR: +0 -47,000 lines. Title: 'Revert: React migration.' Merged by the CTO at 11pm on a Tuesday." Show the actual PR (line counts, merge timestamp, approvals). |
| Freeze | "This is a story about what happens when a migration is technically correct but organizationally wrong. Let me show you how we got to that PR." Introduce yourself. |
| Rewind | The decision to migrate. The proof of concept that worked beautifully. The team structure that made incremental migration impossible. The performance regression nobody measured until month 3. The sprint retros that kept saying "next sprint will be better." |
| Catch-Up | "The CTO opened that PR after the third sprint where zero features shipped because every team was blocked on migration bugs. The 47,000 lines were technically fine. The velocity cost was not." |
| Resolution | How they re-attempted the migration 6 months later with a strangler fig pattern. What changed organizationally. The migration checklist they use now: technical readiness, team readiness, rollback plan, success metrics. |

## Combination Notes

**In Medias Res + Story Circle**: Use In Medias Res for the opening (Steps 1-2 of Story Circle become the Drop and Freeze), then follow the Story Circle from Step 3 onward. The rewind maps to Go/Search, the catch-up to Find, and the resolution to Take/Return/Change.

**In Medias Res + The Spiral**: Open with the crisis, then each pass through The Spiral reveals a deeper layer of why it happened. First pass: the surface cause. Second pass: the architectural flaw. Third pass: the organizational incentive that created the flaw.

**In Medias Res + Reverse Chronology**: These are cousins — both play with timeline. Use In Medias Res when you want to start at the climax and flash back. Use Reverse Chronology when you want to start at the end and systematically peel back every layer. They can combine: open In Medias Res at the crisis, then Reverse Chronology through the causes.

**In Medias Res + The Rashomon**: Drop into the crisis, then rewind and retell the backstory from multiple perspectives. Each perspective in the Rewind reveals different context about the same crisis. The Catch-Up becomes the reconciliation point where all perspectives converge on the same moment.

**Common pitfall — the underwhelming Drop**: If your opening doesn't generate genuine curiosity, the entire framework collapses. Test your Drop on someone unfamiliar with the story. If they don't immediately ask "what happened?" or "how did that happen?", strengthen it or choose a different framework. The Drop is load-bearing — everything else depends on it.

**Common pitfall — the too-long Rewind**: The Rewind should feel like it's building toward the Catch-Up, not like a separate talk. If you find yourself spending more than 40% of the total talk time in the Rewind, you're losing the narrative momentum that the Drop created. Trim context aggressively — only include backstory that's necessary to understand the crisis.
