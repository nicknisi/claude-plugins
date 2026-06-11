# Evidence Gate Rubric

Use this rubric to judge brain dump readiness before generating a contract. Readiness is not a number — each dimension is a **gate** that is either `ready` or `not-ready`. A gate is ready when a concrete artifact exists (a goal written as a pass/fail statement, an explicit scope boundary), not when a score is asserted.

**Proceed-to-contract rule**: All 5 gates `ready`, OR the user explicitly ends the interview ("stop" / "wrap up" / "that's enough") — in which case any `not-ready` gates are recorded as such in the contract.

**When unsure whether the evidence is sufficient, the gate is `not-ready`.** One extra question costs seconds; a bad contract costs hours. Do not mark a gate ready to move faster.

## Question cadence

One focused question per turn by default. Batch up to 4 questions in a single `AskUserQuestion` call **only when the questions are independent** — i.e., they target different gates and none depends on the answer to another. (`AskUserQuestion` supports 1–4 questions.) Never batch questions that chain logically; ask those one at a time so each answer informs the next.

## Gates

### Gate: Problem Clarity

**Gate question**: Do I understand what problem we're solving, who has it, and why it matters?
**Evidence required**: A problem statement naming who experiences it, what happens, when it occurs, and the impact.
**Ready when**: The problem is concrete (who, what, when, impact) — not "things are slow" or "it's broken".
**Not ready — ask**:

- "What specific problem are you trying to solve?"
- "Who experiences this problem? How often?"
- "What's the cost of not solving this? (time, money, frustration)"
- "Can you describe a specific incident where this was a problem?"

**Examples**:

- Not ready: "The app is bad"
- Not ready: "Users say the app is slow"
- Closer: "The checkout page loads slowly, causing cart abandonment"
- Ready: "Checkout page p95 latency is 3.2s, causing 18% cart abandonment for returning customers, costing ~$50k/month in lost revenue"

---

### Gate: Goal Definition

**Gate question**: Are the goals specific and measurable?
**Evidence required**: Each goal stated as a SMART outcome with a specific metric or observable change.
**Ready when**: Every goal names what changes and by how much — not "make it better" or "users should be happier".
**Not ready — ask**:

- "What does success look like for this project?"
- "How will you measure whether this worked?"
- "What specific number or metric should change? By how much?"
- "If this project succeeds, what will be different in 3 months?"

**Examples**:

- Not ready: (none stated)
- Not ready: "Make checkout better"
- Closer: "Users should complete checkout faster"
- Ready: "Reduce checkout p95 latency from 3.2s to 500ms, increasing conversion rate by 10%"

---

### Gate: Success Criteria

**Gate question**: Can every stated goal be checked pass/fail today?
**Evidence required**: Each criterion written as a testable statement **paired with how it will be checked** — a runnable command plus its expected outcome (preferred), or an explicitly named observation when no command can verify it.
**Ready when**: Every goal has at least one such criterion; none are subjective ("looks good", "feels fast"); criteria a command could verify name that command. A criterion checkable only by judgment is allowed but must say so explicitly — an unstated check is a gap, not a default.
**Not ready — ask**:

- "How will you know when this is done?"
- "What command would prove this criterion — a test, a grep, a curl, a build?"
- "What tests would prove this feature works correctly?"
- "What would a QA person check before signing off?"
- "What would you demo to stakeholders to prove success?"

**Examples**:

- Not ready: (none stated)
- Not ready: "It should work well"
- Closer: "Page loads in under 1 second" (good but incomplete — doesn't cover all goals, and doesn't say how it's measured)
- Ready: "Checkout p95 <500ms (`k6 run checkout.js` — p95 threshold passes), all payment methods work (`npx playwright test payments` — exits 0), confirmation email within 30s (staging smoke script), no 500s for 24h post-deploy (judgment call: dashboard review)"

---

### Gate: Scope Boundaries

**Gate question**: Do I know what's in and out of scope?
**Evidence required**: An explicit in-scope list and out-of-scope list, each with rationale; future considerations noted.
**Ready when**: In/out boundaries are explicit with rationale for exclusions — not "fix the checkout" or "nothing else".
**Not ready — ask**:

- "What is explicitly NOT part of this project?"
- "Are there related features we should defer to later?"
- "What's the MVP vs. nice-to-have?"
- "If you had to ship in half the time, what would you cut?"
- "What adjacent features should we explicitly exclude?"

**Examples**:

- Not ready: "Fix the checkout" (could mean anything)
- Not ready: "Fix checkout performance, nothing else" (vague)
- Closer: "Optimize checkout page load, but not payment processing" (better but gaps)
- Ready: "In scope: checkout page load optimization, image lazy loading, API caching. Out of scope: payment gateway changes (vendor decision), mobile app (separate team), analytics dashboard (phase 2). Future: A/B testing different layouts after baseline established."

---

### Gate: Consistency

**Gate question**: Are there contradictions I need resolved?
**Evidence required**: No conflicting requirements remain; where tradeoffs exist, priorities are stated.
**Ready when**: Requirements align and priorities are clear when tradeoffs exist — no "must be real-time" + "must work offline" + "no local storage".
**Not ready — ask**:

- "You mentioned [X] but also [Y]. These seem to conflict. Which takes priority?"
- "Earlier you said [A], but now [B]. Can you clarify?"
- "How should we handle [edge case where requirements conflict]?"
- "If we can only do one of [X] or [Y], which matters more?"

**Examples**:

- Not ready: "Must be real-time" + "Must work offline" + "No local storage" (impossible)
- Not ready: "Keep it simple" + "Add these 15 features" (tension)
- Closer: "Fast load times" + "Show all products on page load" (minor tension, resolvable)
- Ready: All requirements align. Priorities clear when tradeoffs exist.

---

## Gate states

Each gate is `ready` or `not-ready`, and each carries a **one-sentence evidence citation** — the concrete artifact that makes it ready, or the gap that keeps it not-ready. No numbers anywhere. The evidence sentence is mandatory and is rendered in the contract for the human to judge — a gate marked `ready` without real evidence is checkbox theater.

After each round of questions, re-read the brain dump plus new answers and re-evaluate every gate. Keep asking until all gates are ready (or the user ends the interview).

---

## Question Best Practices

When asking clarifying questions:

### Do:

- **Be specific**: "What happens when a user tries to bookmark while offline?" not "Tell me more about offline."
- **Offer options**: "Is offline support A) critical for MVP, B) nice-to-have phase 1, or C) future consideration?"
- **Reference context**: "You mentioned 'tags are better than folders.' Should tags be user-created, predefined, or both?"
- **Prioritize**: Target a not-ready gate first.
- **Chain logically**: Questions should build understanding, not jump around. Chained questions are asked one at a time (see Question cadence).

### Don't:

- Ask open-ended questions: "Tell me more" is not useful.
- Ask redundant questions: If they said "mobile app," don't ask "will this be on mobile?"
- Ask leading questions: "You don't want offline mode, right?" biases the answer.
- Ask compound questions: "What's the scope and timeline and who's the user?" is three questions.
- Skip context: Don't ask about something without referencing what they said.

---

## Spec Feedback Quality

**Purpose**: Evaluate generated specs for feedback loop quality before presenting to user. This is separate from brain-dump gate readiness above — it's applied during spec review (Phase 4.5), not during contract formation.

### Quality Levels

| Level        | Criteria                                                                                                                                                                                                                        | Action                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Strong**   | Feedback Strategy section present with inner-loop command. All iterative components have feedback loops (playground + experiment + check command). Trivial components correctly omit loops. Inner-loop command runs in seconds. | Present spec as-is                                                 |
| **Adequate** | Feedback Strategy present but some iterative components lack loops, or experiments are vague ("test it works" instead of parameterized checks).                                                                                 | Present spec with a note about gaps                                |
| **Weak**     | No Feedback Strategy section, or complex/iterative components missing feedback loops entirely.                                                                                                                                  | Revise spec before presenting — add loops for iterative components |

### Quality Checklist

Run through this checklist for each generated spec:

- [ ] **Feedback Strategy section exists** — inner-loop command and playground type defined
- [ ] **Inner-loop command is fast** — runs in seconds, not minutes; scoped, not global
- [ ] **Iterative components have feedback loops** — components where the agent will make multiple passes have playground, experiment, and check command
- [ ] **Experiments are parameterized** — specific inputs and edge cases, not "verify it works"
- [ ] **Trivial components correctly skip loops** — config, types, constants, re-exports don't have unnecessary feedback loops
- [ ] **Playground matches component type** — data layers use tests, UI uses dev server/storybook, APIs use curl/scripts

### Actions

- **Strong** → Present spec to user for approval
- **Adequate** → Present spec with a note: "Feedback loops could be stronger for {component} — consider adding {specific suggestion}"
- **Weak** → Do not present. Revise the spec to add feedback loops for iterative components, then re-evaluate
