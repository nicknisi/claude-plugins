# Interview Engine

Shared interview process for ideation skills. Read and execute all phases below before returning to the calling skill for artifact generation.

## Phase 1: Intake

Accept whatever the user provides — scattered thoughts, voice transcripts, bullet points, contradictions, topic jumping. **The mess is the input.**

Acknowledge receipt. State what looks strong and what looks weak. Take a position. Then begin the interview.

### Intake sweep

**If the work touches an existing codebase**, fire a parallel exploration sweep at intake so your first question is already informed. Dispatch 2–3 `Agent` calls with `subagent_type: "Explore"` **in a single message** (so they run in parallel), covering:

1. **Project structure** — frameworks, languages, conventions in use.
2. **Adjacent code** — features similar to the brain dump's scope, abstractions you could extend, prior art to reuse.
3. **Test + feedback infrastructure** — test runners, dev servers, storybook, script harnesses. This feeds the infrastructure-to-playground mapping in `${CLAUDE_PLUGIN_ROOT}/references/feedback-loop-guide.md`.

While the sweep runs, acknowledge the brain dump and state what looks strong and weak — don't block on the agents. Weave their findings in as they return.

**Skip the sweep when greenfield** — there's no repo, or the brain dump is unrelated to the existing code. Exploring an unrelated codebase wastes tokens and slows the opener.

**Cap at 3 sweep agents.** Scope each agent's prompt to the brain dump's stated area; beyond 3 agents, latency and token cost outrun the value for an interview opener. Sweep findings stay in conversation context — the "do not write exploration findings to files" rule below applies to the sweep too.

## Phase 2: Interview Loop

Interview the user relentlessly about every aspect of this plan until reaching shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one by one.

### Core rules

1. **One focused question per turn by default.** Wait for the answer before asking the next question. Batch up to 4 questions in a single `AskUserQuestion` call **only when the questions are independent** — i.e., they target different gates and none depends on the answer to another. (`AskUserQuestion` supports 1–4 questions.) Never batch questions that chain logically; ask those one at a time so each answer informs the next.
2. **For each question, provide your recommended answer.** Frame it as: "Here's what I'd recommend — [position]. Do you agree, or would you change it?" This accelerates convergence and forces you to take positions.
3. **If a question can be answered by exploring the codebase, explore the codebase instead.** Don't ask the user what you can look up. First check the intake sweep findings (Phase 1) — they likely already hold the answer; don't re-explore what the sweep covered. If they don't, use `Agent` with `subagent_type: "Explore"` or direct `Glob`/`Grep`/`Read` to find the answer, then state what you found and move on.
4. **Use `AskUserQuestion` tool for every question.** Provide 2-4 options including your recommendation. Mark the recommended option with "(Recommended)".

### What to explore

When exploring the codebase during the interview, look for:

- Project structure, frameworks, languages, patterns in use
- Existing code related to the brain dump's scope
- Conventions — how similar features are implemented, what abstractions exist
- Testing patterns and infrastructure
- Feedback infrastructure — test runners, dev servers, storybook, API scripts. See `${CLAUDE_PLUGIN_ROOT}/references/feedback-loop-guide.md` for the infrastructure-to-playground mapping.

**Do not write exploration findings to files.** They're context for the interview, not artifacts.

### Gate tracking

Track readiness internally across 5 evidence gates (each `ready` / `not-ready`, see `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md` for the gate question, evidence required, and ready-when criteria for each):

| Gate             | Question                                                       |
| ---------------- | -------------------------------------------------------------- |
| Problem Clarity  | Do I understand what problem we're solving and why it matters? |
| Goal Definition  | Are the goals specific and measurable?                         |
| Success Criteria | Can I write tests or validation steps for "done"?              |
| Scope Boundaries | Do I know what's in and out of scope?                          |
| Consistency      | Are there contradictions I need resolved?                      |

**When unsure whether the evidence is sufficient, the gate is `not-ready`.** One extra question costs seconds; a bad contract costs hours.

When all 5 gates are `ready`, stop interviewing and generate the contract. There is no fixed question limit — keep asking until every gate is ready. The user can say "stop", "wrap up", or "that's enough" to end the interview early; any gates still `not-ready` are recorded as such in the contract.

### When to suggest a prototype

Some questions can't be answered by discussion — they need to be tried. When you hit a question where the answer is "we won't know until we build it" (e.g., "does this state model handle the edge cases?", "which of these layouts feels right?"), suggest a quick spike instead of leaving a gate not-ready:

```
Question: "This question is hard to answer in the abstract. Want to spike a quick prototype to find out?"
Options:
- "Yes, spike it now" — Build a quick throwaway prototype to answer the question, then resume the interview
- "No, make a decision and move on (Recommended)" — Pick the most defensible option and continue
- "Flag it for later" — Note it as an open question in the contract
```

If the user chooses to spike, help them build the simplest possible throwaway that answers the question. When it does, fold the answer back into the interview and continue. The prototype itself is disposable — only the answer matters.

This is optional — most interviews don't need it. But when a question is genuinely blocked on "we'd have to try it to know," a 10-minute spike beats a 30-minute circular discussion.

### What to challenge during the interview

- **Vague demand**: "Users want X" → "What evidence? Who specifically?"
- **Undefined terms**: "Better UX", "more intuitive" → "What does 'better' mean? Faster? Fewer clicks?"
- **Hypothetical users**: "Developers will love this" → Flag as a gap; the relevant gate stays not-ready.
- **Contradictions**: Surface them explicitly. "You said X earlier but now Y — which is it?"
- **Weak premises**: If the idea is weak, say it's weak and why. Don't soften.

### Banned phrases

- "That's an interesting approach" — take a position instead
- "There are many ways to think about this" — pick one and state why
- "You might want to consider..." — say "This is wrong because..." or "This works because..."
- "That could work" — say whether it WILL work based on evidence
- "I can see why you'd think that" — if the premise is weak, say so

### When to stop

When all 5 gates are `ready`, or the user says "stop", "wrap up", or "that's enough", the interview is complete. **Return to the calling skill's next phase** (Phase 3) to begin artifact generation. Do not generate any artifacts within this interview engine — artifact generation is the calling skill's responsibility.
