---
name: ideation
description: Transform raw brain dumps (dictated freestyle) into structured implementation artifacts. Use when user has messy ideas, scattered thoughts, or dictated stream-of-consciousness, or when they want to plan a feature, spec something out, or turn rough ideas into actionable specs. Produces contracts and implementation specs written to ./docs/ideation/{project-name}/.
---

<what-to-do>

# Ideation

Transform unstructured brain dumps into structured, actionable implementation artifacts through a conversational interview that builds shared understanding before writing anything.

## Workflow

```
INTAKE → INTERVIEW LOOP → CONTRACT → PHASING → SPEC GENERATION → HANDOFF
              ↓                 ↓          ↓            ↓               ↓
         Accept the mess   One question   Write     Repeatable?    Analyze deps
                           at a time,     when        ↓               ↓
                           explore code   locked   Template +    Sequential?
                           when possible            per-phase     Parallel?
                                                    deltas        Agent Team?
```

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
- Feedback infrastructure — test runners, dev servers, storybook, API scripts. See `references/feedback-loop-guide.md` for the infrastructure-to-playground mapping.

**Do not write exploration findings to files.** They're context for the interview, not artifacts.

### Confidence tracking

Track confidence internally across 5 dimensions (0-20 each, see `references/confidence-rubric.md`):

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

## Phase 3: Contract

When confidence ≥ 95%, generate the contract. **Not before.** Create artifacts lazily — only when you have something to write.

1. Use `AskUserQuestion` to confirm project name if not obvious from context
2. Convert to kebab-case for directory name
3. Create output directory `./docs/ideation/{project-name}/` **only now** — not during intake or exploration
4. **Check for prior contract (lineage detection)**:
   - Check if `./docs/ideation/{project-name}/contract.md` already exists
   - If it does, read its `Created` date and rename it to `contract-{created-date}.md`
   - Set the new contract's `Supersedes` field to the renamed file path
   - If no prior contract exists, set `Supersedes` to "None"
5. Write `contract.md` using `references/contract-template.md`
6. Use `AskUserQuestion` to get approval:

```
Question: "Does this contract accurately capture your intent?"
Options:
- "Approved" - Contract is accurate, proceed
- "Needs changes" - Some parts need revision
- "Missing scope" - Important items are not captured
- "Start over" - Fundamentally off track, re-interview
```

**If not approved:** Revise based on feedback. If feedback reveals a fundamental misunderstanding, return to the interview loop. Otherwise edit `contract.md` directly and re-present. Iterate until approved.

**Do not proceed until contract is explicitly approved.**

</what-to-do>

<supporting-info>

## Phase 4: Phasing & Specification

After contract is approved, determine phases and generate specs. PRDs are optional.

### 4.1 Choose Workflow

Use `AskUserQuestion` to ask:

```
Question: "How should we proceed from the contract?"
Options:
- "Straight to specs (Recommended)" — Contract defines what, specs define how. Faster.
- "PRDs then specs" — Adds a requirements layer for stakeholder alignment.
```

### 4.2 Determine Phases

Analyze the contract and break scope into logical implementation phases.

**Small-project shortcut:** If the scope is small enough to implement in a single phase (1-3 components, touches fewer than ~10 files), skip phasing entirely. Generate a single `spec.md` (no phase number needed) and proceed directly to handoff. Don't force structure where simplicity suffices.

**Phasing criteria** (for multi-phase projects):

- Dependencies (what must be built first?)
- Risk (tackle high-risk items early)
- Value delivery (can users benefit after each phase?)
- Complexity (balance phases for consistent effort)

Typical phasing:

- Phase 1: Core functionality / infrastructure
- Phase 2+: Features, enhancements, additional integrations
- Phase N: Future considerations

**Detect repeatable patterns:** If 3+ phases follow the same structure with different inputs (e.g., "add SDK support for {language}"), note this — it affects how specs are generated (see 4.4).

### 4.3 Generate PRDs (only if user chose "PRDs then specs")

For each phase, generate `prd-phase-{n}.md` using `references/prd-template.md`.

Include:

- Phase overview and rationale
- User stories for this phase
- Functional requirements (grouped)
- Non-functional requirements
- Dependencies (prerequisites and outputs)
- Acceptance criteria

Present all PRDs for review. Use `AskUserQuestion`:

```
Question: "Do these PRD phases look correct?"
Options:
- "Approved" - Phases and requirements look good, proceed to specs
- "Adjust phases" - Need to move features between phases
- "Missing requirements" - Some requirements are missing or unclear
- "Start over" - Need to revisit the contract
```

Iterate until user explicitly approves.

### 4.4 Generate Implementation Specs

Generate specs using `references/spec-template.md`. Create spec files lazily — only when a phase's details are resolved.

#### Standard phases (each is unique)

For each phase, generate a full `spec-phase-{n}.md` with:

- Technical approach
- File changes (new and modified)
- Implementation details with code patterns
- Testing requirements
- Error handling
- Validation commands
- Feedback strategy (top-level inner-loop command and playground type)
- Per-component feedback loops (where applicable)

**Reference existing code:** When the interview's codebase exploration identified relevant patterns, include "Pattern to follow: `path/to/similar/file.ts`" in the spec's implementation details.

**Designing feedback loops:** For each iterative component, define a playground (environment to interact with), experiment (parameterized check), and check command (fastest single validation). Match the feedback mechanism to the component type — data layers use tests, UI uses dev server, APIs use curl scripts, config/types skip loops entirely. See `references/feedback-loop-guide.md` for the full component-type mapping and design criteria.

**Naming failure modes:** For each non-trivial component, ask: "How would this fail?" Fill in the spec's Failure Modes table with named failures, data shadow paths (nil, empty, stale data), and edge cases (concurrent access, oversized input, missing permissions). Trivial components (config, types, constants) skip failure mode enumeration.

#### Repeatable phases (3+ phases follow the same pattern)

When multiple phases share the same structure (e.g., "add support for {SDK}"), avoid generating N nearly-identical full specs. Instead:

1. **Generate one full template spec** — `spec-template-{pattern-name}.md` — with detailed implementation steps, using placeholders for the variable parts.

2. **Generate lightweight per-phase delta files** — `spec-phase-{n}.md` — containing only:
   - Phase-specific inputs (e.g., language name, package manager, framework)
   - Deviations from the template (what's different about this phase)
   - Any phase-specific concerns or edge cases
   - Reference to the template: "Follow `spec-template-{pattern-name}.md` with the inputs below"

**Example for SDK integrations:**

`spec-template-sdk-integration.md`:

```markdown
# SDK Integration Template

## Pattern

For each SDK, create:

1. `src/{language}/{language}-installer-agent.ts` — FrameworkConfig following existing pattern
2. `skills/workos-{sdk-name}/SKILL.md` — Agent skill fetching SDK README
3. `tests/fixtures/{language}/{framework}-example/` — Minimal project fixture
4. `tests/evals/graders/{language}.grader.ts` — Extending BaseGrader

## Implementation Details

{Detailed steps with {placeholders} for variable parts}

## Validation

{Common validation steps}
```

`spec-phase-5.md`:

```markdown
# Spec: Ruby SDK (workos-ruby)

**Template**: ./spec-template-sdk-integration.md

## Inputs

- Language: Ruby
- Framework: Rails
- Package manager: Bundler (`bundle add`)
- Manifest file: Gemfile
- SDK package: workos
- Detection: `rails` gem in Gemfile or `config/routes.rb` exists

## Deviations from template

- Rails has strong conventions — files go in specific locations
- Initializer pattern: `config/initializers/workos.rb`
- Env vars: `.env` with dotenv-rails, or Rails credentials

## Phase-specific concerns

- CI needs Ruby 3.x installed for eval fixtures
```

### 4.5 Present Phases for Review

Present the phase breakdown and specs for user approval before proceeding to handoff.

**Before presenting specs, evaluate feedback loop quality** using the Spec Feedback Quality checklist from `references/confidence-rubric.md`. Self-review each spec:

- **Strong**: All iterative components have feedback loops, inner-loop command defined, trivial components correctly skipped → present spec as-is
- **Adequate**: Most components have loops but some gaps → present spec with a note about what's missing
- **Weak**: No Feedback Strategy section, or complex components missing loops entirely → revise spec before presenting

If Weak, fix the gaps first. Don't present a spec without feedback loops for its iterative components.

Use `AskUserQuestion`:

```
Question: "Do these specs look correct?"
Options:
- "Approved" - Specs look good, proceed to execution handoff
- "Adjust approach" - Implementation strategy needs changes
- "Missing components" - Some files or steps are missing
- "Revisit phases" - Phase breakdown needs restructuring
```

If not approved, revise the relevant specs based on feedback and re-present. Iterate until approved.

## Phase 5: Execution Handoff

After specs are generated, analyze orchestration options and hand off for implementation.

### 5.1 Analyze Orchestration Strategy

Do not create tasks during ideation handoff — they are ephemeral and will be lost when the user starts a fresh session. Each `/execute-spec` session creates its own granular implementation tasks.

Analyze the phase dependency graph to determine the best execution strategy.

**Detect parallelizable phases:**

- Examine which phases are blocked by what
- If 2+ phases share the same single blocker (e.g., all blocked only by Phase 1), they are **parallelizable**
- If phases form a linear chain (Phase 2 → Phase 3 → Phase 4), they are **sequential**
- Mixed graphs have both parallel and sequential segments

**Determine recommended strategy:**

| Pattern                       | Recommendation                                                                |
| ----------------------------- | ----------------------------------------------------------------------------- |
| All phases sequential (chain) | **Sequential execution** — one session at a time                              |
| 2+ independent phases         | **Agent team** — lead orchestrates teammates in parallel                      |
| Mixed dependencies            | **Hybrid** — sequential for dependent chain, agent team for independent group |

### 5.2 Write Execution Plan to Contract

Append the `## Execution Plan` section to the contract file (`./docs/ideation/{project-name}/contract.md`). This makes the contract fully self-contained — someone can pick it up cold and know exactly how to execute.

Use the Execution Plan section from the contract template. Fill in:

1. **Dependency Graph** — ASCII art showing which phases block which. Keep it simple.
2. **Execution Steps** — ordered list with the exact `/execute-spec` commands. Mark which are sequential vs parallel.
3. **Agent Team Prompt** — only if 2+ phases are parallelizable. Ready-to-paste prompt for delegate mode. **Omit this subsection entirely** for fully sequential projects.

**Shared file detection:** Before writing the agent team prompt, scan spec files' "Modified Files" sections. If multiple specs modify the same files, include a coordination note in the prompt:

```
Coordinate on shared files ({list}) to avoid merge conflicts —
only one teammate should modify a shared file at a time.
```

**Batching:** If more than 5 parallelizable phases, note in the execution steps to start with the highest-priority batch first.

### 5.3 Present Handoff Summary

After writing the execution plan, present a brief conversational summary.

**Always include:**

```
Ideation complete. Artifacts written to `./docs/ideation/{project-name}/`.

The contract includes the full execution plan — dependency graph,
commands, and agent team prompt (if parallel). Open `contract.md`
to pick up implementation from any session.
```

**Then show the first step** — either the first `/execute-spec` command for sequential execution, or a pointer to the agent team prompt in the contract for parallel execution.

**Agent team context** (include when the execution plan has an agent team prompt):

```
The agent team prompt is in the contract's Execution Plan section.
To use it: start a new Claude Code session, enter delegate mode
(Shift+Tab), and paste the prompt from the contract.
```

Agent teams let a single lead session automatically spawn and coordinate multiple teammates — the user starts **one** `claude` session, and the lead handles spawning, task assignment, plan approval, and synthesis. No manual terminal juggling.

**Why delegate mode?** Pressing Shift+Tab restricts the lead to coordination-only tools: spawning teammates, messaging, managing tasks, and approving plans. This prevents the lead from implementing tasks itself and ensures work is distributed to teammates.

**Why one session?** The lead automatically spawns each teammate as a separate Claude Code instance. Each teammate gets its own context window, loads project context (CLAUDE.md, MCP servers, skills), and works independently. You interact with the lead and it coordinates everything — use Shift+Up/Down to message individual teammates if needed.

Ensure agent teams are enabled in `.claude/settings.json` or `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### 5.4 Why Fresh Sessions?

- Ideation consumes significant context (contract, specs, exploration)
- Execution benefits from clean context focused on the spec
- Human review between phases catches issues early
- Each phase is independently committable
- Each session creates granular implementation tasks scoped to that phase

</supporting-info>

## Output Artifacts

All artifacts written to `./docs/ideation/{project-name}/`:

```
contract.md                        # Lean contract (problem, goals, success, scope)
prd-phase-1.md                     # Phase 1 requirements (only if PRDs chosen)
...
spec-phase-1.md                    # Phase 1 implementation spec (always full)
spec-template-{pattern}.md         # Shared template for repeatable phases (if applicable)
spec-phase-{n}.md                  # Per-phase delta referencing template (if repeatable)
...
```

## Bundled Resources

### References

- `references/contract-template.md` - Template for lean contract document
- `references/prd-template.md` - Template for phased PRD documents
- `references/spec-template.md` - Template for implementation specs
- `references/confidence-rubric.md` - Detailed scoring criteria for confidence assessment and spec feedback quality
- `references/feedback-loop-guide.md` - Component-type mapping and design criteria for spec feedback loops
- `references/workflow-example.md` - End-to-end workflow walkthrough

### Examples

Completed artifact examples for reference when generating output:

- `examples/contract-example.md` - A filled-in contract for a bookmark feature
- `examples/prd-example.md` - A filled-in PRD for the same feature (Phase 1)
- `examples/spec-example.md` - A filled-in spec for the same feature

When generating artifacts, reference these examples for tone, structure, and level of detail.

## Important Notes

- **ALWAYS use `AskUserQuestion` tool for questions and approvals.** Never ask questions in plain text.
- **One question at a time.** Provide your recommended answer with each question.
- **Explore the codebase during the interview** — don't ask what you can look up.
- **Score confidence conservatively.** When uncertain, score lower.
- Never skip the confidence check. Don't assume understanding.
- Always write artifacts to files. Don't just display them.
- **Create files lazily** — only when decisions are locked, not speculatively.
- Each phase should be independently valuable.
- Specs should be detailed enough to implement without re-reading PRDs or the contract.
- Keep contracts lean. Heavy docs slow iteration.
- **Reference existing code patterns** in specs — "Pattern to follow" with real file paths.
- **Use template + delta** for repeatable phases — don't generate N identical specs.
- **Small projects don't need phases.** If scope is 1-3 components, generate a single spec.
- **No question limit.** Keep interviewing until shared understanding. The user can say "stop" or "wrap up" to end early.
