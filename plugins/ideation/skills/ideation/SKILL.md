---
name: ideation
description: "You MUST use this before building any new feature, planning a migration, designing a system, or turning scattered ideas into a plan. Triggers on: feature requests, project ideas, brain dumps, 'help me plan,' 'spec this out,' 'think through this,' 'interview me,' 'I want to build,' 'let's design,' or any unstructured idea that needs structure before code. Covers small single-spec projects through multi-phase initiatives. Runs a conversational interview, writes an interactive HTML contract, then generates implementation-ready Markdown specs. Skip ONLY for well-defined implementation tasks (writing code to a known spec, fixing bugs, refactoring, explaining code)."
---

<what-to-do>

# Ideation

Transform unstructured brain dumps into implementation artifacts through a conversational interview that builds shared understanding before writing anything. HTML is used for interactive decision-making (visualizations, comparisons, contract); Markdown is used for reference documents (specs, PRDs).

## Workflow

```
INTAKE → INTERVIEW LOOP → CONTRACT.HTML → PHASING → SPEC.MD GENERATION → HANDOFF
              ↓                  ↓             ↓             ↓                ↓
         Accept the mess    One question    HTML with     Repeatable?      SVG graph
                            at a time,      tabs +          ↓              + copy buttons
                            explore code    meter        Template +        in contract
                            + show HTML     + scope       per-phase
                            examples        slider        deltas
```

## Phases 1-2: Interview

Read and follow `${CLAUDE_PLUGIN_ROOT}/references/interview-engine.md` for the complete intake and interview loop process. Execute all phases described there before proceeding to Phase 3.

Read `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md` for the detailed scoring criteria.

## Phase 3: Contract (HTML)

When confidence ≥ 95%, generate the contract as an interactive HTML document. **Not before.** The contract output is `.html`, NOT `.md`.

1. Use `AskUserQuestion` to confirm project name if not obvious from context
2. Convert to kebab-case for directory name
3. Create output directory `./docs/ideation/{project-name}/`
4. **Check for prior contract (lineage detection)**:
   - Check if `./docs/ideation/{project-name}/contract.html` already exists
   - If it does, read it, extract the Created date from the meta line, and rename it to `contract-{created-date}.html`
   - Also rename any sibling `contract.md` to `contract-{created-date}.md` so both formats stay in sync
   - Set the new contract's Supersedes link to the renamed HTML file path
   - If no prior contract exists, omit the Supersedes link
5. **MANDATORY: Use `Read` tool to read `references/html-guide.md` now.** This file contains all CSS design tokens, component patterns, and the document skeleton. You cannot generate correct HTML without it. Do not skip this step.
6. **MANDATORY: Use `Read` tool to read `references/contract-template.html` now.** This is the HTML structure to follow. Fill in the `{placeholder}` values with contract content.
7. Write `contract.html` following the template structure with ALL CSS and JS inlined. The file must be a complete, self-contained HTML document that opens correctly in a browser from `file://`.

**The contract is HTML, not Markdown.** If you find yourself writing `# Heading` or `- bullet` to the contract file, stop — you are writing Markdown. Write `<h1>Heading</h1>` and `<li>bullet</li>` instead.

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

## Phase 4: Phasing & Specification

After contract is approved, determine phases and generate Markdown specs. PRDs are optional.

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

For each phase, use the `Read` tool to read `references/prd-template.md`, then generate `prd-phase-{n}.md`.

Include:

- Phase overview and rationale
- User stories for this phase
- Functional requirements (grouped)
- Non-functional requirements
- Dependencies (prerequisites and outputs)
- Acceptance criteria

Present all PRDs for review via `AskUserQuestion`:

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

Use the `Read` tool to read `references/spec-template.md`, then generate `spec-phase-{n}.md`. Create spec files lazily — only when a phase's details are resolved.

#### Standard phases (each is unique)

For each phase, generate a full `spec-phase-{n}.md` with:

- **Technical approach** — high-level strategy
- **Feedback strategy** — inner-loop command, playground, rationale
- **File changes** — table with new/modified/deleted indicators
- **Implementation details** — per-component sections, each with a feedback loop (playground → experiment → check command)
- **Testing requirements** — table of test files and coverage
- **Failure modes** — table with component, failure, trigger, impact, mitigation columns
- **Validation commands** — code blocks

**Reference existing code:** When the interview's codebase exploration identified relevant patterns, include "Pattern to follow: `path/to/similar/file.ts`" in the spec's implementation details.

**Designing feedback loops:** For each iterative component, define a playground (environment to interact with), experiment (parameterized check), and check command (fastest single validation). Match the feedback mechanism to the component type — data layers use tests, UI uses dev server, APIs use curl scripts, config/types skip loops entirely. See `${CLAUDE_PLUGIN_ROOT}/references/feedback-loop-guide.md` for the full component-type mapping and design criteria.

**Naming failure modes:** For each non-trivial component, ask: "How would this fail?" Fill in the spec's Failure Modes table with named failures, data shadow paths (nil, empty, stale data), and edge cases (concurrent access, oversized input, missing permissions). Trivial components (config, types, constants) skip failure mode enumeration.

#### Repeatable phases (3+ phases follow the same pattern)

When multiple phases share the same structure (e.g., "add support for {SDK}"), avoid generating N nearly-identical full specs. Instead:

1. **Generate one full template spec** — `spec-template-{pattern-name}.md` — with detailed implementation steps, using placeholders for the variable parts.

2. **Generate lightweight per-phase delta files** — `spec-phase-{n}.md` — containing only:
   - Phase-specific inputs (e.g., language name, package manager, framework)
   - Deviations from the template (what's different about this phase)
   - Any phase-specific concerns or edge cases
   - Reference to the template: "Follow `spec-template-{pattern-name}.md` with the inputs below"

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

### 5.3 Generate Contract Markdown

Generate `contract.md` from `references/contract-template.md` with the same content as `contract.html` — needed for execute-spec lineage detection. Include the Execution Plan section.

Specs and PRDs are already Markdown from Phase 4 — no conversion needed.

### 5.4 Present Handoff Summary

After updating the contract and generating MD specs, present a brief conversational summary.

**Always include:**

```
Ideation complete. Artifacts written to `./docs/ideation/{project-name}/`.

Open contract.html in your browser to review the full plan — dependency graph,
execution commands, and scope are all in the Execution Plan tab.

Specs (spec-phase-*.md) are ready. To execute all phases:
  /ideation:autopilot

Or run individual phases manually:
  /ideation:execute-spec docs/ideation/{project-name}/spec-phase-1.md
```

**Recommend `/ideation:autopilot`** as the default. It reads the contract, walks the dependency graph, dispatches subagents per phase (parallel when possible), and only stops on failures. Manual `/execute-spec` is available for finer control.

</supporting-info>

## Output Artifacts

All artifacts written to `./docs/ideation/{project-name}/`:

```
_comparison.html                   # Ephemeral decision aid (deleted after choice is made)
contract.html                      # Interactive contract with scope slider (for review)
contract.md                        # Plain contract (for execute-spec lineage)
prd-phase-1.md                     # Phase 1 requirements (only if PRDs chosen)
...
spec-phase-1.md                    # Implementation spec (for execute-spec)
spec-template-{pattern}.md         # Shared template for repeatable phases (if applicable)
spec-phase-{n}.md                  # Per-phase delta or full spec
...
```

## Bundled Resources

### Shared References (plugin root)

- `${CLAUDE_PLUGIN_ROOT}/references/interview-engine.md` - Interview engine (Phases 1-2)
- `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md` - Scoring criteria for confidence assessment and spec feedback quality
- `${CLAUDE_PLUGIN_ROOT}/references/feedback-loop-guide.md` - Component-type mapping and design criteria for spec feedback loops
- `${CLAUDE_PLUGIN_ROOT}/references/workflow-example.md` - End-to-end workflow walkthrough

### Skill References

HTML (interactive artifacts — contract, exploration, interview visualizations):

- `references/html-guide.md` - HTML component library, design tokens, and constraints
- `references/contract-template.html` - Interactive HTML contract template

Markdown (specs, PRDs, contract copy for execute-spec):

- `references/contract-template.md` - Plain contract template
- `references/prd-template.md` - Plain PRD template
- `references/spec-template.md` - Plain spec template

### Examples

Completed artifact examples for reference when generating output:

- `examples/contract-example.md` - A filled-in MD contract for a bookmark feature
- `examples/prd-example.md` - A filled-in MD PRD for the same feature (Phase 1)
- `examples/spec-example.md` - A filled-in MD spec for the same feature

When generating artifacts, reference these examples for tone, structure, and level of detail.

## HTML Visualizations for Decisions

During the interview and phasing stages, generate ephemeral HTML pages when visual context helps the user make better decisions. These are disposable aids — created, reviewed, then deleted.

**When to use this:**

- **Interview examples** — show UI mockups, layout options, or component structures the user is choosing between
- **Architecture comparisons** — 2-3 valid approaches with meaningfully different trade-offs shown side-by-side
- **Phasing strategies** — "core-first vs. risk-first vs. value-first" with visual dependency flows
- **Orchestration strategy** — sequential vs. parallel vs. hybrid with timeline visuals
- Any decision where visual layout would clarify trade-offs better than text

**How it works:**

1. Write `_comparison.html` (or `_examples.html`, `_mockup.html` — prefix with `_` to mark as ephemeral) to the project's ideation directory using `references/html-guide.md` components
2. Show each option as a card or column with: name, description, trade-offs, and a visual where appropriate
3. Open in browser: `open ./docs/ideation/{project-name}/_comparison.html`
4. Ask via `AskUserQuestion`: reference the browser view in the question text
5. After the user chooses, delete the ephemeral file — it served its purpose

**When NOT to use this:** Simple yes/no decisions, choices where the recommended option is clearly best, or any decision that's faster to explain in text. Don't slow down the flow with unnecessary visual aids.

## Important Notes

- **HTML is for interactive artifacts only** — contract and ephemeral decision visualizations. Specs and PRDs are Markdown.
- **Use the `Read` tool to load templates before writing.** You MUST read `references/html-guide.md` before Phase 3 and read `references/contract-template.html` before generating the contract. Read `references/spec-template.md` before generating specs.
- **Use `AskUserQuestion` for all questions and approvals.** One question at a time, with your recommended answer.
- **Score confidence conservatively.** When uncertain, score lower. No fixed question limit.
- **Open HTML artifacts in the browser** after writing. Use `open` (macOS) or `xdg-open` (Linux).
- **Create files lazily.** Only when decisions are locked, not speculatively.
- **Reference existing code patterns** in specs — "Pattern to follow" with real file paths.
- **Small projects don't need phases.** 1-3 components → single spec. Use template + delta for repeatable phases.
- **Specs must stand alone** — detailed enough to implement without re-reading PRDs or the contract.
