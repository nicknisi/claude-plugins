# Implementation Spec: Spec Feedback Loops

**Contract**: ./contract.md
**Estimated Effort**: M

## Technical Approach

Add a "Feedback Loop" concept across the ideation spec system. The change touches five markdown files — no code, no builds, no migrations. Each file serves a different role in the pipeline:

1. **spec-template.md** defines the *structure* — what sections a spec contains
2. **SKILL.md** defines the *generation logic* — how the AI fills in those sections
3. **execute-spec.md** defines the *consumption logic* — how the executing agent uses the spec
4. **spec-example.md** demonstrates the *filled-in result* — what a good spec looks like
5. **confidence-rubric.md** defines *quality scoring* — how to evaluate whether feedback loops in a spec are adequate

The feedback loop concept maps the [ampcode.com/notes/feedback-loopable](https://ampcode.com/notes/feedback-loopable) framework into the spec system:

| Article Concept | Spec Equivalent | Where It Lives |
|---|---|---|
| Build a Playground | **Playground** — environment to interact with (test file, dev server, CLI tool, storybook) | Per-component in spec |
| Set Up Experiments | **Experiment** — parameterized, reproducible check with specific inputs | Per-component in spec |
| Optimize the Inner Loop | **Check command** — single fast command (seconds, text output) | Per-component + top-level in spec |

## File Changes

### Modified Files

| File Path | Changes |
|-----------|---------|
| `plugins/ideation/skills/ideation/references/spec-template.md` | Add top-level Feedback Strategy section + per-component Feedback Loop block |
| `plugins/ideation/skills/ideation/SKILL.md` | Update Phase 2.2 (explore feedback infrastructure) + Phase 4.4 (generate feedback loops) |
| `plugins/ideation/commands/execute-spec.md` | Add feedback environment setup step + restructure per-component flow |
| `plugins/ideation/skills/ideation/examples/spec-example.md` | Add feedback loops to bookmark feature example |
| `plugins/ideation/skills/ideation/references/confidence-rubric.md` | Add Spec Feedback Quality scoring section |

## Implementation Details

### Component 1: Spec Template — Feedback Strategy + Per-Component Loop

**Pattern to follow**: Existing section structure in `plugins/ideation/skills/ideation/references/spec-template.md`

**Overview**: Add two structural elements — a top-level "Feedback Strategy" section and a per-component "Feedback loop" block inside Implementation Details.

**Key decisions**:

- Feedback Strategy goes *after* Technical Approach, *before* File Changes — positions it early so the executing agent reads it before touching files
- Per-component Feedback Loop goes *after* Implementation Steps within each component — it's the "now validate what you just built" guidance
- Three fields per component: Playground, Experiment, Check command — maps 1:1 to the article's framework
- Feedback loops are explicitly optional per component — "Omit for trivial components"

**Implementation steps**:

1. Insert new `## Feedback Strategy` section between Technical Approach and File Changes (after line 20), containing:
   - **Inner-loop command**: Single command for fastest validation cycle
   - **Playground**: What environment the agent interacts with during development
   - **Why this approach**: 1 sentence connecting the strategy to the spec's component types

2. Add `**Feedback loop**:` block to the per-component template inside Implementation Details (after the `**Implementation steps**:` block), containing:
   - **Playground**: What to set up before building
   - **Experiment**: Parameterized check with specific inputs
   - **Check command**: Single fast command
   - Include a note: `{Omit this block for trivial components (config, types, constants)}`

3. Add item 10 to Template Usage Notes:
   - Guidance on inner-loop command speed (seconds not minutes), preferring text output, skipping trivial components

**Feedback loop**:

- **Playground**: Read the current spec-template.md, make edits, then read the result to verify section ordering and formatting
- **Experiment**: Mentally fill in the new sections for the bookmark example to confirm the template fields are the right ones
- **Check command**: `grep -c "Feedback" plugins/ideation/skills/ideation/references/spec-template.md` — confirms sections were added

### Component 2: SKILL.md — Generation Guidance

**Pattern to follow**: Existing Phase 4.4 structure in `plugins/ideation/skills/ideation/SKILL.md`

**Overview**: Teach the AI how to design feedback loops when generating specs. Two insertion points: Phase 2.2 (explore feedback infrastructure) and Phase 4.4 (generate feedback loops per component type).

**Key decisions**:

- Phase 2.2 gets one additional exploration target — "Feedback infrastructure" (test runners, dev servers, storybook, etc.)
- Phase 4.4 gets a new subsection with a component-type → feedback-mechanism mapping table
- Guidance explicitly says "not every component needs a feedback loop" to prevent over-engineering
- The mapping table covers: data/logic layers → tests, UI components → dev server/storybook, API endpoints → curl/script, CLI tools → the tool itself, config/types → skip

**Implementation steps**:

1. In Phase 2.2 "Explore the Codebase" (after item 5 at line 72), add item 6:
   ```
   6. **Feedback infrastructure** — What fast-feedback tools exist? Test runner config,
      dev server setup, storybook, API testing scripts, CI shortcuts. These inform
      feedback loop design in specs.
   ```

2. In Phase 4.4 "Generate Implementation Specs", after the existing bullet list under "Standard phases" (after line 278), add a new subsection:

   **Designing feedback loops**: Guidance covering:
   - Per-component-type mapping (data → tests, UI → dev server, API → curl, CLI → itself, config → skip)
   - What makes a good experiment (parameterized, specific inputs, edge cases)
   - What makes a good inner-loop command (runs in seconds, text output, scoped not global)
   - When to skip (write-once components, no iteration expected)

3. In Phase 4.5 "Present Phases for Review", add a self-review step before the AskUserQuestion:

   **Before presenting specs to the user, evaluate feedback loop quality** using the Spec Feedback Quality checklist from `references/confidence-rubric.md`:
   - **Strong**: All iterative components have loops, inner-loop command defined → present as-is
   - **Adequate**: Most components have loops, some gaps → present with a note about gaps
   - **Weak**: No feedback strategy or complex components missing loops → revise spec before presenting

**Feedback loop**:

- **Playground**: Read the current SKILL.md, make edits, read result
- **Experiment**: Check that the component-type mapping table covers all major categories; verify the "skip" guidance is present
- **Check command**: `grep -c "Feedback" plugins/ideation/skills/ideation/SKILL.md`

### Component 3: execute-spec.md — Execution Flow Restructure

**Pattern to follow**: Existing execution flow in `plugins/ideation/commands/execute-spec.md`

**Overview**: Change execution from "build then check" to "set up feedback harness → build incrementally → check → iterate." Two changes: add a pre-implementation setup step and restructure the per-component flow.

**Key decisions**:

- New "Set Up Feedback Environment" step goes after task dependency creation, before component execution — one-time setup for the whole spec
- Per-component flow changes from 7 steps (claim → read → read files → follow pattern → create/edit → validate → complete) to an incremental loop (claim → read → set up component loop → build chunk → check → iterate → experiment → complete)
- Auto-detection step: even when specs lack a Feedback Strategy section, the agent probes for test runners, dev servers, etc. via `package.json` scripts, config files, and directory patterns
- Graceful fallback: if no feedback infrastructure found and spec has no Feedback Strategy, use Validation Commands as before

**Implementation steps**:

1. In "Parse Spec Structure" (section 3), add two extraction targets:
   - Feedback Strategy (inner-loop command, playground type)
   - Per-component Feedback Loops (playground, experiment, check command)

2. Add new section "6. Set Up Feedback Environment" after "5. Establish Task Dependencies":
   - Read the spec's Feedback Strategy section
   - **Auto-detect feedback infrastructure** if not specified:
     - Read `package.json` (or equivalent) for test/dev/storybook scripts
     - Check for test runner configs (`jest.config`, `vitest.config`, `.mocharc`, etc.)
     - Check for dev server configs (`vite.config`, `next.config`, `webpack.config`, etc.)
     - Check for storybook (`.storybook/` directory)
     - Check for existing script harnesses (`scripts/`, `bin/`)
   - Set up the playground (start dev server, verify test runner works, etc.)
   - Verify the inner-loop command runs successfully
   - Fallback: if no feedback strategy and no infrastructure detected, use Validation Commands

3. Restructure "For Each Component" flow:
   - After claiming and reading, set up the component's feedback loop (create test file, start harness)
   - Run check command once to verify the loop works
   - Build incrementally: implement a chunk → run check command → fix if failing → next chunk
   - After full implementation, run the component's experiment (parameterized edge case checks)
   - Complete the task

4. Update "Component Completion" to run experiment first, then inner-loop command for regression, then mark complete

5. Update Key Principles: add "Feedback loops over post-hoc validation" and "Fast inner loop"

**Feedback loop**:

- **Playground**: Read the current execute-spec.md, make edits, read result
- **Experiment**: Trace through the new flow with a hypothetical component to confirm step ordering makes sense; verify the auto-detection checklist covers common project types (Node, Python, Go, Ruby)
- **Check command**: `grep -c "Feedback\|feedback\|inner.loop\|auto.detect" plugins/ideation/commands/execute-spec.md`

### Component 4: Spec Example — Bookmark Feature Feedback Loops

**Pattern to follow**: Existing example in `plugins/ideation/skills/ideation/examples/spec-example.md`

**Overview**: Add concrete feedback loops to the bookmark feature example to demonstrate what the template looks like filled in.

**Key decisions**:

- Bookmark Store gets a full feedback loop (data-layer, test-driven)
- BookmarkButton gets a lighter feedback loop (thin UI wrapper, dev server + store tests)
- No feedback loop for the `ArticleView.tsx` or `navigation.tsx` modifications — they're trivial integration points
- Feedback Strategy: test suite is the primary loop because the feature is data-heavy

**Implementation steps**:

1. Add `## Feedback Strategy` section after Technical Approach (after line 11):
   ```markdown
   ## Feedback Strategy

   **Inner-loop command**: `pnpm test -- --filter bookmarks`

   **Playground**: Test suite — most changes are to the Zustand store and IndexedDB
   integration. Tests run in milliseconds and catch logic errors immediately.

   **Why this approach**: The bookmark feature is data-layer heavy with a thin UI layer.
   A fast scoped test runner is the tightest feedback loop.
   ```

2. Add feedback loop to Bookmark Store component (after implementation steps, around line 67):
   ```markdown
   **Feedback loop**:

   - **Playground**: Create `bookmark-store.spec.ts` with a describe block and one
     smoke test (`it('initializes with empty bookmarks')`) before writing the store
   - **Experiment**: Test add/remove with 0, 1, and 100 bookmarks. Test tag
     operations: add, remove, rename, delete tag assigned to bookmarks.
     Test IndexedDB persistence: add bookmark, rehydrate store, verify state.
   - **Check command**: `pnpm test -- --filter bookmark-store`
   ```

3. Add feedback loop to BookmarkButton component (after implementation steps, around line 78):
   ```markdown
   **Feedback loop**:

   - **Playground**: Start dev server (`pnpm dev`), navigate to any article view
   - **Experiment**: Toggle bookmark on unbookmarked article (filled icon), toggle
     again (unfilled), refresh page (state persists via store). Verify store tests
     still pass after wiring the component.
   - **Check command**: `pnpm test -- --filter bookmarks`
   ```

**Feedback loop**:

- **Playground**: Read the current spec-example.md, make edits, read result
- **Experiment**: Verify the example demonstrates both "full loop" (store) and "light loop" (button) patterns, and that trivial components (navigation, ArticleView mods) correctly omit loops
- **Check command**: `grep -c "Feedback\|feedback" plugins/ideation/skills/ideation/examples/spec-example.md`

### Component 5: Confidence Rubric — Spec Feedback Quality Scoring

**Pattern to follow**: Existing dimension structure in `plugins/ideation/skills/ideation/references/confidence-rubric.md`

**Overview**: Add a "Spec Feedback Quality" section to the rubric. This is *not* a 6th dimension on the brain-dump confidence score (which stays at 5D/100 points). It's a separate evaluation applied to generated specs during Phase 4.5 review, before presenting specs to the user.

**Key decisions**:

- Separate from the 5D brain-dump scoring — different evaluation point, different purpose
- Scored as a checklist, not a numeric rubric — spec review is pass/fail ("does this spec have adequate feedback loops?"), not a gradient
- Three quality levels: Strong (all iterative components have loops + inner-loop command defined), Adequate (most components have loops, some gaps), Weak (no feedback strategy or loops missing for complex components)
- If Weak: revise spec before presenting to user
- If Adequate: present with a note about what's missing
- If Strong: present as-is

**Implementation steps**:

1. Add a new section after the existing "Recalculation" section (after line 208): `## Spec Feedback Quality`

2. Include:
   - Purpose statement: "Evaluate generated specs for feedback loop quality before presenting to user"
   - Clarification: "This is separate from brain-dump confidence scoring. Applied during spec review (Phase 4.5)."
   - Quality level table (Strong / Adequate / Weak) with criteria
   - Checklist: Does the spec have a Feedback Strategy section? Do iterative components have feedback loops? Is the inner-loop command fast (seconds)? Are trivial components correctly skipped?
   - Action per level: Strong → present, Adequate → present with note, Weak → revise

**Feedback loop**:

- **Playground**: Read the current confidence-rubric.md, make edits, read result
- **Experiment**: Apply the new quality checklist to the bookmark spec example — it should score "Strong"
- **Check command**: `grep -c "Spec Feedback Quality\|Strong\|Adequate\|Weak" plugins/ideation/skills/ideation/references/confidence-rubric.md`

## Validation Commands

```bash
# Verify all files were modified (should return 5 files)
grep -rl "Feedback" plugins/ideation/skills/ideation/ plugins/ideation/commands/ | wc -l

# Verify spec template has both new sections
grep -c "Feedback Strategy\|Feedback loop" plugins/ideation/skills/ideation/references/spec-template.md

# Verify SKILL.md has generation guidance
grep -c "Designing feedback loops\|Feedback infrastructure" plugins/ideation/skills/ideation/SKILL.md

# Verify execute-spec has new flow steps
grep -c "Set Up Feedback Environment\|Auto-detect\|Build incrementally" plugins/ideation/commands/execute-spec.md

# Verify example has concrete feedback loops
grep -c "Inner-loop command\|Playground\|Experiment" plugins/ideation/skills/ideation/examples/spec-example.md

# Verify rubric has quality scoring
grep -c "Spec Feedback Quality\|Strong\|Adequate\|Weak" plugins/ideation/skills/ideation/references/confidence-rubric.md
```

## Open Items

- [x] ~~Should the SKILL.md also update Phase 4.5 (present for review) to reference the new rubric quality check?~~ Yes — added as Component 2, step 3.
- [ ] Should the workflow-example.md be updated to demonstrate feedback loops in its end-to-end walkthrough? (Currently out of scope but worth noting)

---

_This spec is ready for implementation. Follow the patterns and validate at each step._
