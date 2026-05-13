# Interview Engine

Shared interview process for ideation skills. Read and execute all phases below before returning to the calling skill for artifact generation.

## Phase 1: Intake

Accept whatever the user provides — scattered thoughts, voice transcripts, bullet points, contradictions, topic jumping. **The mess is the input.**

Acknowledge receipt. State what looks strong and what looks weak. Take a position. Then begin the interview.

## Phase 2: Interview Loop

Interview the user relentlessly about every aspect of this plan until reaching shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one by one.

### Core rules

1. **Ask one question at a time.** Wait for the answer before asking the next question. Do not batch questions.
2. **For each question, provide your recommended answer.** Frame it as: "Here's what I'd recommend — [position]. Do you agree, or would you change it?" This accelerates convergence and forces you to take positions.
3. **If a question can be answered by exploring the codebase, explore the codebase instead.** Don't ask the user what you can look up. Use `Agent` with `subagent_type: "Explore"` or direct `Glob`/`Grep`/`Read` to find the answer, then state what you found and move on.
4. **Use `AskUserQuestion` tool for every question.** Provide 2-4 options including your recommendation. Mark the recommended option with "(Recommended)".

### What to explore

When exploring the codebase during the interview, look for:

- Project structure, frameworks, languages, patterns in use
- Existing code related to the brain dump's scope
- Conventions — how similar features are implemented, what abstractions exist
- Testing patterns and infrastructure
- Feedback infrastructure — test runners, dev servers, storybook, API scripts. See `${CLAUDE_PLUGIN_ROOT}/references/feedback-loop-guide.md` for the infrastructure-to-playground mapping.

**Do not write exploration findings to files.** They're context for the interview, not artifacts.

### Confidence tracking

Track confidence internally across 5 dimensions (0-20 each, see `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md`):

| Dimension        | Question                                                       |
| ---------------- | -------------------------------------------------------------- |
| Problem Clarity  | Do I understand what problem we're solving and why it matters? |
| Goal Definition  | Are the goals specific and measurable?                         |
| Success Criteria | Can I write tests or validation steps for "done"?              |
| Scope Boundaries | Do I know what's in and out of scope?                          |
| Consistency      | Are there contradictions I need resolved?                      |

**Score conservatively.** When uncertain between two levels, choose the lower one. One extra question costs seconds; a bad contract costs hours.

When confidence reaches ≥ 95%, stop interviewing and generate the contract. There is no fixed question limit — keep asking until you have shared understanding. The user can say "stop", "wrap up", or "that's enough" to end the interview early.

### What to challenge during the interview

- **Vague demand**: "Users want X" → "What evidence? Who specifically?"
- **Undefined terms**: "Better UX", "more intuitive" → "What does 'better' mean? Faster? Fewer clicks?"
- **Hypothetical users**: "Developers will love this" → Flag as a gap, score conservatively.
- **Contradictions**: Surface them explicitly. "You said X earlier but now Y — which is it?"
- **Weak premises**: If the idea is weak, say it's weak and why. Don't soften.

### Banned phrases

- "That's an interesting approach" — take a position instead
- "There are many ways to think about this" — pick one and state why
- "You might want to consider..." — say "This is wrong because..." or "This works because..."
- "That could work" — say whether it WILL work based on evidence
- "I can see why you'd think that" — if the premise is weak, say so

### When to stop

When confidence reaches ≥ 95%, or the user says "stop", "wrap up", or "that's enough", the interview is complete. **Return to the calling skill's next phase** (Phase 3) to begin artifact generation. Do not generate any artifacts within this interview engine — artifact generation is the calling skill's responsibility.
