---
name: ideation
description: Activate for pre-implementation planning — when the user has a problem, idea, or goal but needs to figure out the shape of the solution before writing code. Covers: organizing messy notes or brain dumps into specs, interviewing the user to clarify requirements, pressure-testing approaches, turning scattered thoughts into structured plans, speccing out features or migrations, and creating design documents. The user's input will typically describe WHAT they want but not have a locked-down HOW — they may say "help me plan," "spec this out," "turn this into a plan," "think through this," "interview me," or simply present unstructured ideas asking for structure. This skill runs a conversational interview, then writes interactive HTML specs and contracts to ./docs/ideation/{project-name}/. Skip this skill when the user already knows exactly what to build and just needs implementation — writing code, fixing bugs, refactoring, explaining code, or generating configs.
---

<what-to-do>

# Ideation

Transform unstructured brain dumps into interactive HTML implementation artifacts through a conversational interview that builds shared understanding before writing anything. HTML is the primary artifact for human review; equivalent Markdown specs are auto-generated for `/execute-spec` consumption.

## Workflow

```
INTAKE → INTERVIEW LOOP → CONTRACT.HTML → PHASING → SPEC.HTML GENERATION → HANDOFF
              ↓                  ↓             ↓               ↓                ↓
         Accept the mess    One question    HTML with     Repeatable?      SVG graph
                            at a time,      tabs +          ↓              + copy buttons
                            explore code    meter        Template +        + MD specs
                            when possible                 per-phase         auto-generated
                                                          deltas
```

## Phases 1-2: Interview

Read and follow `${CLAUDE_PLUGIN_ROOT}/references/interview-engine.md` for the complete intake and interview loop process. Execute all phases described there before proceeding to Phase 3.

Read `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md` for the detailed scoring criteria.

## Phase 2.5: Exploration Visualization

After the interview engine completes and before generating the contract, produce a visual context map of everything discovered during codebase exploration. This helps the user see what the agent found and verify the exploration was thorough.

1. Create output directory `./docs/ideation/{project-name}/` **only now**
2. Write `_exploration.html` using `references/html-guide.md` components:
   - **Project overview** — language, framework, key directories, package manager
   - **File tree** — collapsible tree of relevant directories explored (not the entire repo — just the areas related to the brain dump's scope)
   - **Pattern cards** — each existing pattern found gets a card: file path, what it does, why it's relevant to this project. These are the "Pattern to follow" references that will appear in specs later.
   - **Infrastructure badges** — test runner, dev server, CI, linting, type checking — what exists and where
   - **Conventions found** — naming, file organization, error handling patterns, import style
   - **Related code** — files and functions most relevant to the proposed feature, with brief descriptions
3. Open in browser: `open ./docs/ideation/{project-name}/_exploration.html`
4. Present briefly: "I've mapped out the relevant parts of your codebase — take a look in your browser. Moving on to the contract."

This visualization is a reference artifact — it stays in the project directory and is useful when reviewing specs later. Do not ask for approval; it's informational, not a decision gate. If the interview didn't involve codebase exploration (e.g., a greenfield project with no existing code), skip this step.

## Phase 3: Contract (HTML)

When confidence ≥ 95%, generate the contract as an interactive HTML document. **Not before.**

1. Use `AskUserQuestion` to confirm project name if not obvious from context
2. Convert to kebab-case for directory name
3. The output directory `./docs/ideation/{project-name}/` should already exist from Phase 2.5. If it doesn't (greenfield project with no exploration), create it now.
4. **Check for prior contract (lineage detection)**:
   - Check if `./docs/ideation/{project-name}/contract.html` already exists
   - If it does, read it, extract the Created date from the meta line, and rename it to `contract-{created-date}.html`
   - Also rename any sibling `contract.md` to `contract-{created-date}.md` so both formats stay in sync
   - Set the new contract's Supersedes link to the renamed HTML file path
   - If no prior contract exists, omit the Supersedes link
5. Read `references/html-guide.md` for the full component library and design tokens
6. Read `references/contract-template.html` for the HTML structure
7. Write `contract.html` following the template structure with ALL CSS and JS inlined
8. **Include a scope slider** in the Scope tab. Define 3 scope tiers based on the interview findings:
   - **MVP** — minimum viable version, core functionality only
   - **Full** — everything in the contract's "In Scope" section
   - **Stretch** — full scope plus items from "Future Considerations" that could be pulled in
   For each tier, list what's included and excluded. Use a range input (`<input type="range">`) with 3 stops that reveals/hides scope items as the user drags. The slider is a visual aid — the user sees what each tier includes, then tells you in the terminal which tier to target. This replaces the static in-scope/out-of-scope lists for the Scope tab.
9. After writing, open in browser: run `open ./docs/ideation/{project-name}/contract.html` (macOS) or `xdg-open` (Linux)
10. Use `AskUserQuestion` to get approval — include the scope tier question:

```
Question: "Does this contract capture your intent? Use the scope slider in your browser to pick a tier."
Options:
- "Approved — MVP scope" - Ship the minimum viable version first
- "Approved — Full scope" - Build everything in the In Scope list
- "Approved — Stretch scope" - Include Future Considerations items too
- "Needs changes" - Some parts need revision before approving
- "Start over" - Fundamentally off track, re-interview
```

The approved scope tier determines what goes into specs. Items outside the chosen tier move to "Future Considerations" in the contract.

**If not approved:** Revise based on feedback. If feedback reveals a fundamental misunderstanding, return to the interview loop. Otherwise re-write the HTML file and re-open in browser. Iterate until approved.

**Do not proceed until contract is explicitly approved.**

</what-to-do>

<supporting-info>

## Phase 4: Phasing & Specification (HTML)

After contract is approved, determine phases and generate HTML specs. PRDs are optional.

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

**Small-project shortcut:** If the scope is small enough to implement in a single phase (1-3 components, touches fewer than ~10 files), skip phasing entirely. Generate a single `spec.html` (no phase number needed) and proceed directly to handoff. Don't force structure where simplicity suffices.

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

For each phase, read `references/prd-template.html` and `references/html-guide.md`, then generate `prd-phase-{n}.html`.

Include:

- Phase overview and rationale
- User stories for this phase
- Functional requirements (grouped)
- Non-functional requirements
- Dependencies (prerequisites and outputs)
- Acceptance criteria

Open each PRD in the browser after writing. Present all PRDs for review via `AskUserQuestion`:

```
Question: "Do these PRD phases look correct?"
Options:
- "Approved" - Phases and requirements look good, proceed to specs
- "Adjust phases" - Need to move features between phases
- "Missing requirements" - Some requirements are missing or unclear
- "Start over" - Need to revisit the contract
```

Iterate until user explicitly approves.

### 4.4 Generate Implementation Specs (HTML)

Generate specs using `references/spec-template.html` and `references/html-guide.md`. Create spec files lazily — only when a phase's details are resolved.

#### Standard phases (each is unique)

For each phase, generate a full `spec-phase-{n}.html` with:

- **Navigation sidebar** — sticky nav linking to each section
- **Technical approach** — high-level strategy
- **Feedback strategy** — three-card layout: inner-loop command, playground, rationale
- **File changes** — table with new/modified/deleted badges
- **Implementation details** — collapsible per-component sections, each with a feedback loop card (playground → experiment → check command)
- **Testing requirements** — table of test files and coverage
- **Failure modes** — collapsible table with component, failure, trigger, impact, mitigation columns
- **Validation commands** — code block with copy button

**Reference existing code:** When the interview's codebase exploration identified relevant patterns, include "Pattern to follow: `path/to/similar/file.ts`" in the spec's implementation details.

**Designing feedback loops:** For each iterative component, define a playground (environment to interact with), experiment (parameterized check), and check command (fastest single validation). Match the feedback mechanism to the component type — data layers use tests, UI uses dev server, APIs use curl scripts, config/types skip loops entirely. See `${CLAUDE_PLUGIN_ROOT}/references/feedback-loop-guide.md` for the full component-type mapping and design criteria.

**Naming failure modes:** For each non-trivial component, ask: "How would this fail?" Fill in the spec's Failure Modes table with named failures, data shadow paths (nil, empty, stale data), and edge cases (concurrent access, oversized input, missing permissions). Trivial components (config, types, constants) skip failure mode enumeration.

**After writing each spec:** Open in browser via `open {filepath}`.

#### Repeatable phases (3+ phases follow the same pattern)

When multiple phases share the same structure (e.g., "add support for {SDK}"), avoid generating N nearly-identical full specs. Instead:

1. **Generate one full template spec** — `spec-template-{pattern-name}.html` — with detailed implementation steps, using placeholders for the variable parts.

2. **Generate lightweight per-phase delta files** — `spec-phase-{n}.html` — containing only:
   - Phase-specific inputs (e.g., language name, package manager, framework)
   - Deviations from the template (what's different about this phase)
   - Any phase-specific concerns or edge cases
   - Reference to the template: "Follow `spec-template-{pattern-name}.html` with the inputs below"

### 4.5 Present Specs for Review

Present the phase breakdown and specs for user approval before proceeding to handoff.

**Before presenting specs, evaluate feedback loop quality** using the Spec Feedback Quality checklist from `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md`. Self-review each spec:

- **Strong**: All iterative components have feedback loops, inner-loop command defined, trivial components correctly skipped → present spec as-is
- **Adequate**: Most components have loops but some gaps → present spec with a note about what's missing
- **Weak**: No Feedback Strategy section, or complex components missing loops entirely → revise spec before presenting

If Weak, fix the gaps first. Don't present a spec without feedback loops for its iterative components.

Use `AskUserQuestion`:

```
Question: "Do these specs look correct? (Review them in your browser)"
Options:
- "Approved" - Specs look good, proceed to execution handoff
- "Adjust approach" - Implementation strategy needs changes
- "Missing components" - Some files or steps are missing
- "Revisit phases" - Phase breakdown needs restructuring
```

If not approved, revise the relevant specs based on feedback and re-present. Iterate until approved.

## Phase 5: Execution Handoff

After specs are approved, update the contract HTML with the execution plan and auto-generate Markdown specs for `/execute-spec`.

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

### 5.2 Update Contract HTML with Execution Plan

Read the existing `contract.html` and update the Execution Plan tab panel. This makes the contract fully self-contained — someone can pick it up cold and know exactly how to execute.

1. **SVG Dependency Graph** — generate inline SVG using the dep-graph component from `references/html-guide.md`. Vertical flow for sequential, horizontal spread for parallel phases at the same depth.

2. **Execution Steps** — code blocks with copy buttons for each `/execute-spec` command. Mark which are sequential vs parallel.

3. **Agent Team Prompt** — only if 2+ phases are parallelizable. Place in a collapsible section with a copy button. **Omit this subsection entirely** for fully sequential projects.

**Shared file detection:** Before writing the agent team prompt, scan spec files' "Modified Files" sections. If multiple specs modify the same files, include a coordination note:

```
Coordinate on shared files ({list}) to avoid merge conflicts —
only one teammate should modify a shared file at a time.
```

**Batching:** If more than 5 parallelizable phases, note in the execution steps to start with the highest-priority batch first.

Re-open the contract in the browser after updating.

### 5.3 Auto-generate MD Specs for Execution

For each HTML spec written, also generate a corresponding Markdown spec file (`spec-phase-{n}.md`) using `references/spec-template.md`. Populate it from the same interview findings, exploration results, and decisions that produced the HTML spec — technical approach, file changes, implementation details, testing requirements, feedback strategy, failure modes, validation commands. The MD spec must be **equally detailed and complete** — it is the input to `/execute-spec`, which builds from it. A weak MD spec produces a weak implementation regardless of how good the HTML spec looks.

Generate MD specs using the MD templates directly. Do not convert HTML to Markdown — both formats are generated from the same source (your interview context), just targeting different templates.

Also generate `contract.md` from `references/contract-template.md` with the same content as `contract.html` — needed for execute-spec lineage detection. Include the Execution Plan section.

If repeatable phases produced a `spec-template-{pattern}.html`, also generate a matching `spec-template-{pattern}.md`.

If PRDs were generated, also generate matching `prd-phase-{n}.md` files from `references/prd-template.md`.

Do **not** open the MD files in the browser — they are machine-consumable only.

### 5.4 Present Handoff Summary

After updating the contract and generating MD specs, present a brief conversational summary.

**Always include:**

```
Ideation complete. Interactive artifacts written to `./docs/ideation/{project-name}/`.

Open contract.html in your browser to review the full plan — dependency graph,
execution commands, and agent team prompt (if parallel) are all in the
Execution Plan tab.

Markdown specs (spec-phase-*.md) were also generated for /execute-spec
compatibility — these are machine-consumable only; the HTML artifacts are
for human review.
```

**Then show the first step** — either the first `/execute-spec` command for sequential execution, or a pointer to the agent team prompt in the contract for parallel execution.

**Agent team context** (include when the execution plan has an agent team prompt):

```
The agent team prompt is in the contract's Execution Plan tab.
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

### 5.5 Why Fresh Sessions?

- Ideation consumes significant context (contract, specs, exploration)
- Execution benefits from clean context focused on the spec
- Human review between phases catches issues early
- Each phase is independently committable
- Each session creates granular implementation tasks scoped to that phase

</supporting-info>

## Output Artifacts

All artifacts written to `./docs/ideation/{project-name}/`:

```
_exploration.html                  # Codebase context map (if exploration occurred)
contract.html                      # Interactive contract with scope slider (primary, for review)
contract.md                        # Plain contract (for execute-spec lineage)
prd-phase-1.html                   # Phase 1 requirements (only if PRDs chosen)
prd-phase-1.md                     # PRD MD (only if PRDs chosen)
...
spec-phase-1.html                  # Interactive spec (primary, for review)
spec-phase-1.md                    # Plain spec (for execute-spec)
spec-template-{pattern}.html       # Shared template for repeatable phases (if applicable)
spec-template-{pattern}.md         # MD version of repeatable template (if applicable)
spec-phase-{n}.html                # Per-phase delta or full HTML spec
spec-phase-{n}.md                  # Per-phase delta or full MD spec
...
```

## Bundled Resources

### Shared References (plugin root)

- `${CLAUDE_PLUGIN_ROOT}/references/interview-engine.md` - Interview engine (Phases 1-2)
- `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md` - Scoring criteria for confidence assessment and spec feedback quality
- `${CLAUDE_PLUGIN_ROOT}/references/feedback-loop-guide.md` - Component-type mapping and design criteria for spec feedback loops
- `${CLAUDE_PLUGIN_ROOT}/references/workflow-example.md` - End-to-end workflow walkthrough

### Skill References

HTML (primary, for human review):

- `references/html-guide.md` - HTML component library, design tokens, and constraints
- `references/contract-template.html` - Interactive HTML contract template
- `references/spec-template.html` - Interactive HTML spec template with sidebar navigation
- `references/prd-template.html` - Styled HTML PRD template

Markdown (auto-generated at handoff for `/execute-spec`):

- `references/contract-template.md` - Plain contract template
- `references/prd-template.md` - Plain PRD template
- `references/spec-template.md` - Plain spec template

### Examples

Completed artifact examples for reference when generating output:

- `examples/contract-example.md` - A filled-in MD contract for a bookmark feature
- `examples/prd-example.md` - A filled-in MD PRD for the same feature (Phase 1)
- `examples/spec-example.md` - A filled-in MD spec for the same feature
- `examples/spec-example.html` - A filled-in interactive HTML spec for reference

When generating artifacts, reference these examples for tone, structure, and level of detail.

## Visual Comparisons for Key Decisions

When a decision point has 2-3 valid approaches with meaningfully different trade-offs, generate a temporary comparison HTML page so the user can see the options side-by-side in their browser before choosing.

**When to use this:**
- Phase 4.2: Multiple valid phasing strategies (e.g., "core-first vs. risk-first vs. value-first")
- Phase 5.1: Orchestration strategy when the choice isn't obvious (sequential vs. parallel vs. hybrid)
- Any `AskUserQuestion` where visual layout would clarify the trade-offs better than text options

**How it works:**
1. Write a temporary `_comparison.html` to the project's ideation directory using `references/html-guide.md` components
2. Show each approach as a card or column with: name, description, trade-offs, and a visual (e.g., SVG dependency graph for phasing, timeline for orchestration)
3. Open in browser: `open ./docs/ideation/{project-name}/_comparison.html`
4. Ask via `AskUserQuestion`: reference the browser view in the question text
5. After the user chooses, delete `_comparison.html` — it served its purpose

**When NOT to use this:** Simple yes/no decisions, choices where the recommended option is clearly best, or any decision that's faster to explain in text. Don't slow down the flow with unnecessary visual aids.

## Important Notes

- **ALWAYS use `AskUserQuestion` tool for questions and approvals.** Never ask questions in plain text.
- **One question at a time.** Provide your recommended answer with each question.
- **Explore the codebase during the interview** — don't ask what you can look up.
- **Score confidence conservatively.** When uncertain, score lower.
- Never skip the confidence check. Don't assume understanding.
- **Read `references/html-guide.md` once before Phase 3.** It stays in context for subsequent artifacts — do not re-read it for each one. Follow the component library exactly.
- **ALL CSS and JS must be inlined.** No external links. Files must work from `file://`.
- **Open each HTML artifact in the browser** after writing it. Use `open` (macOS) or `xdg-open` (Linux).
- **Dark mode support is required.** Use `prefers-color-scheme` media query.
- **Create files lazily** — only when decisions are locked, not speculatively.
- **MD specs are auto-generated at handoff** (Phase 5.3). They mirror the HTML content and exist solely for `/execute-spec` compatibility. Never present them as the primary artifact.
- Each phase should be independently valuable.
- Specs should be detailed enough to implement without re-reading PRDs or the contract.
- Keep contracts lean. Heavy docs slow iteration.
- **Reference existing code patterns** in specs — "Pattern to follow" with real file paths.
- **Use template + delta** for repeatable phases — don't generate N identical specs.
- **Small projects don't need phases.** If scope is 1-3 components, generate a single spec.
- **No question limit.** Keep interviewing until shared understanding. The user can say "stop" or "wrap up" to end early.
