# The Rashomon for Technical Presentations

The Rashomon presents the same event, problem, or decision from multiple contradictory perspectives, forcing the audience to hold competing truths simultaneously. Named after Akira Kurosawa's 1950 film *Rashomon* — where four witnesses give irreconcilable accounts of the same crime — this framework works because software engineering is fundamentally perspectival: the same system looks completely different depending on whether you're the developer, the operator, the user, or the business owner. Instead of pretending there's one objective truth, The Rashomon makes the multiplicity of interpretation its thesis. The audience leaves not with a single answer but with a richer, more empathetic understanding of why reasonable people disagree.

## The Phases

### 1. The Event (Establish the Shared Facts)

Present the event, decision, or artifact that will be examined from multiple angles. Keep it factual, minimal, and deliberately neutral. Don't tip your hand about which perspective you favor — the power of this framework depends on the audience not knowing where you'll land. Think of this as presenting evidence to a jury: just the facts, chronologically ordered, with no editorializing. The audience will form their own initial interpretation, which makes the perspectival shifts more powerful later.

**In a talk**: "On March 14th, a pull request was opened. It changed 3 files, added 47 lines of code, and took 11 days to merge. Four reviewers were involved. Here's the PR description, exactly as it was written." Show the actual PR (anonymized if needed). Let the audience sit with it. Don't rush past the artifact — the audience needs time to form their initial read.

**Slide approach**: 2-4 slides. Present the raw artifact: the PR, the architecture diagram, the incident timeline, the metric dashboard. Minimal commentary. Let the audience form initial impressions they'll later question. If possible, show the artifact exactly as it appeared in its original context — a screenshot of the actual GitHub PR, the real Grafana dashboard, the Slack thread with timestamps.

### 2. Perspective 1 (The First Account)

Tell the story from the first point of view. This perspective should be coherent, sympathetic, and complete — the audience should think "yes, that makes sense" when this section ends. Present it as truth, not as "one opinion."

**In a talk**: "From the developer's perspective: this PR was straightforward. A well-understood pattern, applied to a new service. The 11-day timeline? Review bottlenecks. Three reviewers left nit comments that didn't affect correctness. The fourth reviewer requested a full redesign in the final round."

**Slide approach**: 5-8 slides. Full narrative arc for this perspective. Include evidence: code diffs, Slack messages, timeline from this person's point of view. The audience should be convinced.

### 3. Perspective 2 (The Contradicting Account)

Now tell the same story from a second point of view that directly contradicts or reframes the first. Use the same evidence where possible — same PR, same timeline, same code — but interpreted differently. The audience should feel the ground shift.

**In a talk**: "From the tech lead's perspective: this PR was a red flag. The pattern the developer called 'well-understood' had caused two incidents last quarter. The 'nit comments' were attempts to steer toward a safer approach without blocking. The full redesign request came because the tech lead realized the hints weren't landing."

**Slide approach**: 5-8 slides. Same structure as Perspective 1, but different evidence emphasis or different interpretation of the same evidence. Explicitly reference moments from Perspective 1 and reframe them.

### 4. Perspective 3 (The Unexpected Account)

Introduce a third perspective that the audience hasn't considered. This one often comes from outside the immediate technical context — the customer, the business, the ops team, or even the codebase itself. This perspective should make the first two perspectives feel incomplete.

**In a talk**: "From the customer's perspective: they filed a support ticket on March 8th. They were told it would be fixed 'this sprint.' The 11-day PR review meant the fix shipped after the customer had already migrated to a competitor's product. They never saw the fix."

**Slide approach**: 4-6 slides. This perspective often requires less technical depth but more emotional weight. It recontextualizes the entire debate between Perspectives 1 and 2.

### 5. The Reconciliation (Or Deliberate Non-Resolution)

Address the contradictions. This is the phase that separates a Rashomon talk from a talk that simply presents multiple viewpoints. You must do something with the tension — even if that something is explicitly refusing to resolve it. You have three options, and you should choose deliberately:

- **Reconcile**: Show how all perspectives are true simultaneously and what that teaches us about the system. The synthesis is the insight.
- **Privilege one**: Argue that one perspective is more important than the others, and why. Be explicit that you're making this choice and own the reasoning.
- **Leave unresolved**: Argue that the contradiction itself is the point — these tensions are inherent and must be managed, not solved. Give the audience a framework for navigating the tension rather than a resolution.

**In a talk (reconcile)**: "All three perspectives are correct. The developer, the tech lead, and the customer each saw real things. The failure wasn't in any individual's judgment — it was in the system that made their perspectives invisible to each other."

**In a talk (leave unresolved)**: "I don't have a resolution for you. The developer was right about the code. The tech lead was right about the risk. The customer was right to leave. These truths coexist. The question is: which truth does your team optimize for?"

**Slide approach**: 3-5 slides. Synthesize or deliberately refuse to synthesize. Either way, give the audience a framework for navigating the tension in their own work.

## Duration Mapping

### Lightning Talk (5 min, 10-15 slides)

Compress to two perspectives:
- **Event** (2-3 slides): The shared facts, stripped to essentials
- **Perspective 1** (3-4 slides): The obvious interpretation
- **Perspective 2** (3-4 slides): The contradicting interpretation
- **Reconciliation** (2-3 slides): The point of the tension

Two perspectives are enough to create the Rashomon effect. A third perspective in 5 minutes will feel rushed. Choose the two perspectives with the sharpest contrast — the ones that most directly contradict each other.

### Standard Talk (20 min, 25-35 slides)

Use all 5 phases with three perspectives:
- **Event**: 3-4 slides
- **Perspective 1**: 5-8 slides
- **Perspective 2**: 5-8 slides
- **Perspective 3**: 4-6 slides
- **Reconciliation**: 3-5 slides

Spend equal time on each perspective to maintain the framework's fairness. If one perspective gets significantly more slides, the audience reads it as the "correct" one.

### Extended Talk (45 min, 50-70 slides)

Full depth with four perspectives and extended reconciliation:
- **Event**: 4-6 slides (more detail, more artifacts)
- **Perspective 1**: 8-12 slides
- **Perspective 2**: 8-12 slides
- **Perspective 3**: 8-12 slides
- **Perspective 4**: 6-10 slides (add a fourth perspective — the codebase, the future maintainer, the auditor)
- **Reconciliation**: 6-10 slides (deeper analysis, audience discussion, frameworks for navigating tensions)

Consider audience interaction between perspectives: "Before I show you the next perspective, who do you agree with so far?" Polling creates investment. The extended format also lets you revisit earlier perspectives after new ones are introduced — showing how Perspective 1 looks different once you've heard Perspective 3.

## When to Use

- **Architecture decision talks**: Every architectural choice has winners and losers. Show the same decision from the perspective of developer velocity, operational stability, and user experience.
- **Postmortems and incident reviews**: Incidents look different from each role involved. The Rashomon prevents scapegoating by making all perspectives visible.
- **"Best practices" critiques**: Show how a "best practice" looks from the perspective of a startup, an enterprise, and a legacy system. "Best" is always perspectival.
- **Talks about team dynamics or process**: Code review, on-call, sprint planning — all look different depending on where you sit.
- **When you genuinely believe there's no single right answer**: The Rashomon is honest about ambiguity. Use it when the ambiguity is the message.

## When NOT to Use

- **When there IS a clear right answer**: If you know which perspective is correct and the others are simply wrong, don't use The Rashomon — it will make your argument weaker, not stronger. Just make the argument directly.
- **Tutorials or how-to talks**: The audience wants to learn how to do something. Multiple contradictory perspectives on "how to set up CI" is confusing, not enlightening.
- **When the perspectives aren't genuinely contradictory**: If all perspectives basically agree, the framework collapses. You need real tension between the accounts.
- **When one perspective is obviously straw-manned**: The audience will detect if you've made one perspective intentionally weak to make another look good. Every perspective needs to be presented at its strongest.
- **Time-constrained slots where you can't give each perspective equal depth**: A rushed Rashomon feels unfair to the perspectives that got less time.

## Example Mapping

### "The PR That Took 11 Days" — Code Review Culture Talk

| Phase | Content |
|-------|---------|
| Event | The PR: 47 lines, 3 files, 4 reviewers, 11 days. Show the PR description and timeline. |
| Perspective 1 (Developer) | Straightforward change. Clear pattern. Reviewers bikeshedding. Morale cost of slow reviews. Data: average review time across the team. |
| Perspective 2 (Tech Lead) | Pattern had caused incidents. Nit comments were diplomatic steering. The redesign request prevented a repeat outage. Data: incident history from the same pattern. |
| Perspective 3 (Customer) | Filed ticket March 8th. Fix merged March 25th. Churned March 20th. Customer lifetime value lost: $48,000. Data: support ticket timeline. |
| Reconciliation | The review process optimized for code quality (tech lead's perspective) at the cost of delivery speed (developer's perspective) and customer retention (customer's perspective). No villain — a system that made these perspectives invisible to each other. |

### "Is Kubernetes Overkill?" — Infrastructure Decision Talk

| Phase | Content |
|-------|---------|
| Event | A 4-person startup adopted Kubernetes for their first production workload. Show the architecture and team size. |
| Perspective 1 (CTO) | Future-proofing. Hiring advantage (candidates want K8s). Standardized deployment pipeline from day 1. The 2 weeks of setup pays off in months. |
| Perspective 2 (Solo Ops Engineer) | 2 weeks of setup became 2 months of maintenance. 60% of on-call pages are K8s issues, not app issues. Team can't debug without the one person who understands networking policies. |
| Perspective 3 (The App) | 4 containers, 2 services, 1 database. The app doesn't know or care it's on K8s. It would run identically on a single VM with Docker Compose. The complexity is invisible from inside the container. |
| Reconciliation | Deliberately unresolved. All three are right. The question isn't "is K8s overkill" but "which costs are you willing to pay and which perspectives are you willing to deprioritize?" |

### "The Bug That Was a Feature" — Product/Engineering Tension Talk

| Phase | Content |
|-------|---------|
| Event | A user reports that clicking "Delete" on a shared document removes it for all collaborators, not just themselves. Show the bug report, the code, the product spec. |
| Perspective 1 (User) | "I deleted MY copy. Why did it delete everyone's? I lost my team's work." The mental model of personal ownership vs. shared state. |
| Perspective 2 (Developer) | "The spec says 'delete removes the document.' There's one document. The code is correct. This is working as designed." The implementation matches the specification exactly. |
| Perspective 3 (Product Manager) | "The spec was ambiguous because we hadn't decided on the collaboration model. The developer picked one interpretation. The user expected the other. Neither is wrong — the spec is wrong." |
| Reconciliation | The bug isn't in the code or the user's expectations — it's in the gap between the product model and the user's mental model. Three tools for closing that gap: user research before spec writing, spec reviews that include edge cases, and UI copy that makes the system model explicit. |

## Combination Notes

**The Rashomon + Story Circle**: Use the Story Circle as the macro structure, with The Rashomon nested in the Search/Find steps (Steps 4-5). The hero's journey encounters multiple contradictory truths about the problem before finding resolution.

**The Rashomon + In Medias Res**: Open In Medias Res with the shared event (the crisis, the decision, the outcome). Then each "rewind" section is a different perspective's account of how we got there. The audience sees the same backstory refracted through different lenses.

**The Rashomon + The Spiral**: Each pass through The Spiral is a different perspective. Pass 1: the simple explanation (one perspective). Pass 2: a contradicting perspective complicates it. Pass 3: a third perspective adds nuance. The depth and the multiplicity increase together.

**The Rashomon + Reverse Chronology**: Start from the shared outcome and work backwards, but each layer backwards is told from a different perspective. The developer's "last week" vs. the ops team's "last week" vs. the customer's "last week" leading to the same moment.
