---
name: ideation-visual
description: Transform brain dumps into rich, interactive HTML specs you can open in a browser. Same interview process as /ideation, but outputs visual artifacts with tabs, collapsible sections, SVG dependency graphs, and interactive elements. Use when you want specs that are easier to read, share, and navigate visually.
---

<what-to-do>

# Ideation Visual

Transform unstructured brain dumps into interactive HTML artifacts through a conversational interview that builds shared understanding before writing anything. Same interview engine as `/ideation`, but outputs rich HTML instead of Markdown.

## Workflow

```
INTAKE → INTERVIEW LOOP → CONTRACT.HTML → PHASING → SPEC.HTML GENERATION → HANDOFF
              ↓                    ↓            ↓             ↓                ↓
         Accept the mess      One question    HTML with    Repeatable?     SVG graph
                              at a time,      tabs +        ↓              + copy
                              explore code    meter      Template +       buttons
                              when possible                per-phase
                                                          deltas
```

## Phases 1-2: Interview

Read and follow `${CLAUDE_PLUGIN_ROOT}/references/interview-engine.md` for the complete intake and interview loop process. Execute all phases described there before proceeding to Phase 3.

Read `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md` for the detailed scoring criteria.

## Phase 3: Contract (HTML)

When confidence ≥ 95%, generate the contract as an interactive HTML document. **Not before.**

1. Use `AskUserQuestion` to confirm project name if not obvious from context
2. Convert to kebab-case for directory name
3. Create output directory `./docs/ideation/{project-name}/` **only now**
4. **Check for prior contract (lineage detection)**:
   - Check if `./docs/ideation/{project-name}/contract.html` already exists
   - If it does, read it, extract the Created date from the meta line, and rename it to `contract-{created-date}.html`
   - Set the new contract's Supersedes link to the renamed file path
   - If no prior contract exists, omit the Supersedes link
5. Read `references/html-guide.md` for the full component library and design tokens
6. Read `references/contract-template.html` for the HTML structure
7. Write `contract.html` following the template structure with ALL CSS and JS inlined
8. After writing, open in browser: run `open ./docs/ideation/{project-name}/contract.html` (macOS) or `xdg-open` (Linux)
9. Use `AskUserQuestion` to get approval:

```
Question: "Does this contract accurately capture your intent? (View it in your browser)"
Options:
- "Approved" - Contract is accurate, proceed
- "Needs changes" - Some parts need revision
- "Missing scope" - Important items are not captured
- "Start over" - Fundamentally off track, re-interview
```

**If not approved:** Revise based on feedback. Re-write the HTML file and re-open in browser. Iterate until approved.

**Do not proceed until contract is explicitly approved.**

</what-to-do>

<supporting-info>

## Phase 4: Phasing & Specification (HTML)

After contract is approved, determine phases and generate HTML specs.

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

**Small-project shortcut:** If the scope is small enough for a single phase (1-3 components, < ~10 files), skip phasing. Generate a single `spec.html` and proceed to handoff.

**Phasing criteria** (for multi-phase projects):

- Dependencies (what must be built first?)
- Risk (tackle high-risk items early)
- Value delivery (can users benefit after each phase?)
- Complexity (balance phases for consistent effort)

**Detect repeatable patterns:** If 3+ phases follow the same structure with different inputs, note this for template + delta generation.

### 4.3 Generate PRDs (only if user chose "PRDs then specs")

For each phase, read `references/prd-template.html` and `references/html-guide.md`, then generate `prd-phase-{n}.html`.

Open each PRD in the browser after writing. Present all PRDs for review via `AskUserQuestion`.

### 4.4 Generate Implementation Specs (HTML)

For each phase, read `references/spec-template.html` and `references/html-guide.md`, then generate `spec-phase-{n}.html`.

Each HTML spec includes:

- **Navigation sidebar** — sticky nav linking to each section
- **Technical approach** — high-level strategy
- **Feedback strategy** — three-card layout: inner-loop command, playground, rationale
- **File changes** — table with new/modified/deleted badges
- **Implementation details** — collapsible per-component sections, each with a feedback loop card (playground → experiment → check command)
- **Testing requirements** — table of test files and coverage
- **Failure modes** — collapsible table with component, failure, trigger, impact, mitigation columns
- **Validation commands** — code block with copy button

**Reference existing code:** Include "Pattern to follow: `path/to/file`" in implementation details.

**Designing feedback loops:** Match feedback mechanism to component type per `${CLAUDE_PLUGIN_ROOT}/references/feedback-loop-guide.md`.

**Naming failure modes:** For non-trivial components, catalog failures in the failure modes table. Trivial components skip this.

**After writing each spec:** Open in browser via `open {filepath}`.

#### Repeatable phases

Same logic as the MD skill: generate one full HTML template spec (`spec-template-{pattern}.html`) and lightweight per-phase HTML deltas (`spec-phase-{n}.html`) that reference it.

### 4.5 Present Specs for Review

Before presenting, evaluate feedback loop quality using the Spec Feedback Quality checklist from `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md`.

- **Strong** → present as-is
- **Adequate** → present with a note about gaps
- **Weak** → revise before presenting

Use `AskUserQuestion`:

```
Question: "Do these specs look correct? (Review them in your browser)"
Options:
- "Approved" - Specs look good, proceed to execution handoff
- "Adjust approach" - Implementation strategy needs changes
- "Missing components" - Some files or steps are missing
- "Revisit phases" - Phase breakdown needs restructuring
```

## Phase 5: Execution Handoff (HTML)

After specs are approved, update the contract HTML with the execution plan.

### 5.1 Analyze Orchestration Strategy

Same analysis as the MD skill:

| Pattern                       | Recommendation         |
| ----------------------------- | ---------------------- |
| All phases sequential (chain) | Sequential execution   |
| 2+ independent phases         | Agent team             |
| Mixed dependencies            | Hybrid                 |

### 5.2 Update Contract HTML

Read the existing `contract.html` and update the Execution Plan tab panel:

1. **SVG Dependency Graph** — generate inline SVG using the dep-graph component from `references/html-guide.md`. Vertical flow for sequential, horizontal spread for parallel phases at the same depth.

2. **Execution Steps** — code blocks with copy buttons for each `/execute-spec` command. Note: execute-spec reads MD specs, so include a note:

   ```
   Note: /execute-spec reads Markdown specs. To execute these visual specs,
   run /ideation on the same project to generate MD specs, or manually
   create spec files from the HTML spec content.
   ```

3. **Agent Team Prompt** — if applicable, in a collapsible section with a copy button.

**Shared file detection:** Same logic — scan specs for overlapping Modified Files and add coordination note.

Re-open the contract in the browser after updating.

### 5.3 Present Handoff Summary

```
Ideation complete. Interactive artifacts written to `./docs/ideation/{project-name}/`.

Open contract.html in your browser to review the full plan — dependency graph,
execution commands, and agent team prompt are all in the Execution Plan tab.

Note: These HTML specs are for human review. To execute, either:
1. Run /ideation on the same project to generate MD specs for /execute-spec
2. Use the HTML specs as a reference while implementing manually
```

### 5.4 Why Fresh Sessions?

Same rationale as the MD skill — context budget, clean execution, human review between phases.

</supporting-info>

## Output Artifacts

All artifacts written to `./docs/ideation/{project-name}/`:

```
contract.html                      # Interactive contract (tabs, confidence meter, SVG graph)
prd-phase-1.html                   # Phase 1 requirements (only if PRDs chosen)
...
spec-phase-1.html                  # Phase 1 interactive spec (sidebar, collapsibles, feedback cards)
spec-template-{pattern}.html       # Shared template for repeatable phases (if applicable)
spec-phase-{n}.html                # Per-phase delta referencing template (if repeatable)
...
```

## Bundled Resources

### Shared References (plugin root)

- `${CLAUDE_PLUGIN_ROOT}/references/interview-engine.md` - Interview engine (Phases 1-2)
- `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md` - Scoring criteria for confidence assessment and spec feedback quality
- `${CLAUDE_PLUGIN_ROOT}/references/feedback-loop-guide.md` - Component-type mapping and design criteria for spec feedback loops
- `${CLAUDE_PLUGIN_ROOT}/references/workflow-example.md` - End-to-end workflow walkthrough

### Skill References (HTML-specific)

- `references/html-guide.md` - HTML component library, design tokens, and constraints
- `references/contract-template.html` - Interactive HTML contract template
- `references/spec-template.html` - Interactive HTML spec template with sidebar navigation
- `references/prd-template.html` - Styled HTML PRD template

### Examples

- `examples/spec-example.html` - A filled-in interactive HTML spec for reference

## Important Notes

- **ALWAYS use `AskUserQuestion` tool for questions and approvals.** Never ask questions in plain text.
- **One question at a time.** Provide your recommended answer with each question.
- **Explore the codebase during the interview** — don't ask what you can look up.
- **Score confidence conservatively.** When uncertain, score lower.
- **Read `references/html-guide.md` before writing any HTML artifact.** Follow the component library exactly.
- **ALL CSS and JS must be inlined.** No external links. Files must work from `file://`.
- **Open each artifact in the browser** after writing it. Use `open` (macOS) or `xdg-open` (Linux).
- **Dark mode support is required.** Use `prefers-color-scheme` media query.
- **Create files lazily** — only when decisions are locked, not speculatively.
- **Small projects don't need phases.** If scope is 1-3 components, generate a single spec.html.
- **These are human-readable artifacts, not machine-consumable.** For `/execute-spec` compatibility, use `/ideation` to generate MD specs.
