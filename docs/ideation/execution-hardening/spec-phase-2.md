# Implementation Spec: Execution Hardening - Phase 2 (Integration)

**Contract**: ./contract.md
**Depends on**: Phase 1 (Scout + Reviewer agents must exist)
**Estimated Effort**: M

## Technical Approach

Phase 2 rewrites `plugins/ideation/skills/execute-spec/SKILL.md` to incorporate the build-verify-review loop. The current linear flow (load → explore → build → validate → report) becomes cyclical (load → scout → build → verify → review → fix → repeat).

The rewrite touches one file but changes its fundamental structure. The current SKILL.md is ~263 lines. The new version will be larger due to the review cycle logic, scout integration, and escalation handling. The key structural changes:

1. **Pre-Execution**: Replace inline "Codebase Exploration" (Section 2) with Scout agent invocation. The scout runs as a subagent, produces a context map, and persists it. If a prior context map exists, the scout extends it.

2. **Execution**: The build flow (per-component feedback loops) stays largely the same. What changes is what happens *after* all components are built.

3. **Post-Execution**: Replace the current linear "Run All Validations → Check Criteria → Report" with a cycle: Verify → Review → (Fix if needed → Re-verify → Re-review) → Commit only after pass.

The existing skill's sections map to the new structure:

| Current Section | New Section | Change |
|---|---|---|
| Pre-Execution 1: Load Specification | Pre-Execution 1: Load Specification | Unchanged |
| Pre-Execution 2: Codebase Exploration | Pre-Execution 2: Scout | **Replaced** — invoke scout agent |
| Pre-Execution 3: Parse Spec Structure | Pre-Execution 3: Parse Spec Structure | Unchanged |
| Pre-Execution 4-5: Tasks + Dependencies | Pre-Execution 4-5: Tasks + Dependencies | Unchanged |
| Pre-Execution 6: Feedback Environment | Pre-Execution 6: Feedback Environment | Unchanged |
| Execution Flow | Build Phase | Minor rename, same content |
| Post-Execution | Verify-Review-Fix Loop | **Replaced** — cyclical instead of linear |
| Completion Report | Completion Report | Updated to include review cycle summary |

## Feedback Strategy

**Inner-loop command**: N/A — this phase modifies a SKILL.md file (prompt engineering), not code.

**Playground**: Manual testing — invoke `/ideation:execute-spec` on a sample spec after the rewrite and observe the flow.

**Why this approach**: Skill definitions are markdown prompts. The real validation is whether the rewritten skill produces the correct agent behavior when invoked. Automated testing doesn't apply to prompt authoring.

## File Changes

### Modified Files

| File Path | Changes |
|-----------|---------|
| `plugins/ideation/skills/execute-spec/SKILL.md` | Major rewrite: replace inline exploration with scout, add build-verify-review loop, add review cycle escalation logic |

## Implementation Details

### Execute-Spec Rewrite

**Pattern to follow**: The current `plugins/ideation/skills/execute-spec/SKILL.md` — preserve its structure, voice, and level of detail. The rewrite extends the existing document, not replaces its style.

**Overview**: Rewrite the execute-spec skill to integrate the Scout agent for pre-execution exploration and the Reviewer agent for post-execution review, connected by a build-verify-review loop that cycles up to 3 times before escalating.

**Key decisions**:

- **Scout invocation via Agent tool** — Execute-spec spawns the scout as a subagent using `Agent` tool with `subagent_type` pointing to the ideation scout agent. The scout receives the spec file path and project directory. Its output (context map) is read from `docs/ideation/{project}/context-map.md` after it completes.
- **Scout replaces inline exploration, doesn't supplement it** — The current Section 2 (Codebase Exploration) is fully replaced. The scout handles all exploration and produces a structured output. Execute-spec reads the context map instead of doing its own file reads.
- **Scout GO/HOLD gates the build** — If the scout returns HOLD, execute-spec pauses and presents the gap analysis to the user via `AskUserQuestion` before proceeding. The user can choose to proceed anyway, update the spec, or abort.
- **Build phase is mostly preserved** — The per-component execution flow (claim task → read → build → feedback loop → complete) stays the same. The scout's context map informs the build but doesn't change the mechanics.
- **Verify step = existing validation commands** — After all components are built, run the spec's Validation Commands. This is what the current post-execution already does. The verify step is the gate before review.
- **Review invocation via Agent tool** — Execute-spec spawns the reviewer as a subagent. The reviewer receives: spec file path, list of "Pattern to follow" paths (extracted from spec), and the cycle number. It returns structured findings.
- **Finding parsing** — Execute-spec parses the reviewer's output to count findings by severity. If zero critical + high → PASS → commit. If any critical or high → FAIL → fix cycle.
- **Fix cycle** — On FAIL, execute-spec reads the findings, addresses critical and high items (editing code to fix the issues), then re-runs verify (validation commands) and re-invokes the reviewer. Up to 3 total cycles.
- **Escalation after 3 cycles** — If the review still fails after 3 cycles, execute-spec presents all remaining findings to the user via `AskUserQuestion` with options: "Fix manually and re-run", "Accept with known issues", "Abort phase".
- **Commit only after pass** — No `git commit` happens until the review passes (or the user explicitly accepts with known issues). The reviewer sees unstaged changes via `git diff`.
- **Completion report updated** — Includes review cycle count, findings summary, and which findings were auto-fixed vs accepted.

**Implementation steps**:

1. **Rewrite Pre-Execution Section 2** — Replace "Codebase Exploration" with "Scout":

```markdown
### 2. Scout Codebase

**Invoke the Scout agent** to explore the codebase and produce a structured context map.

Use the `Agent` tool:
- **subagent_type**: Use the ideation scout agent
- **prompt**: Include the spec file path, the project directory, and whether a prior context map exists

**If scout returns GO** (confidence >= 70):
- Read the context map from `docs/ideation/{project}/context-map.md`
- Use the map's Key Patterns, Dependencies, and Conventions sections to inform implementation
- Proceed to spec parsing

**If scout returns HOLD** (confidence < 70):
- Present the scout's gap analysis to the user via `AskUserQuestion`:
  - "Proceed anyway" — Build with known gaps
  - "Update spec" — Spec may be underspecified, pause for revision
  - "Abort" — Stop execution
```

2. **Preserve Execution Flow** — Sections 3-6 (Parse Spec, Tasks, Dependencies, Feedback Environment) and the per-component build flow stay as-is. Add a note that the scout's context map should be consulted when reading pattern files:

```markdown
**Consult the context map**: Before reading pattern files or exploring the codebase
during build, check the scout's context map for:
- Key patterns already identified (avoid redundant reads)
- Dependency information (know what's affected by your changes)
- Conventions to follow (naming, imports, error handling)
```

3. **Rewrite Post-Execution** — Replace linear validation with the Verify-Review-Fix loop:

```markdown
## Post-Execution: Verify-Review-Fix Loop

After all component tasks are completed, enter the review cycle.

### Verify

Run all commands from the spec's "Validation Commands" section:
- Type check
- Lint
- Tests
- Build

If any validation command fails, fix the issue before proceeding to review.
Do not invoke the reviewer with failing validations — those are mechanical
errors, not review findings.

### Review (Cycle 1 of max 3)

Invoke the Reviewer agent via the `Agent` tool:
- **subagent_type**: Use the ideation reviewer agent
- **prompt**: Include:
  - Spec file path
  - List of "Pattern to follow" file paths from the spec
  - Cycle number (1, 2, or 3)
  - If cycle > 1: the prior cycle's findings for reference

**Parse the reviewer's output:**
1. Count findings by severity: critical, high, medium, low
2. If zero critical AND zero high → **PASS**
3. If any critical or high → **FAIL**

### On PASS

Review passed. Proceed to commit and completion report.

### On FAIL (Cycle < 3)

1. Read each critical and high finding
2. For each finding, apply the suggested fix (the `→ action` part)
3. After all fixes applied, re-run Verify (validation commands)
4. If verify passes, invoke Review again (next cycle)
5. If verify fails, fix validation errors first, then re-review

### On FAIL (Cycle = 3, final)

Escalation. Present remaining findings to the user via `AskUserQuestion`:

Question: "Review cycle 3 still has {N} critical/high findings. How to proceed?"
Options:
- "Fix manually" — User will fix remaining issues. Re-run
  /execute-spec after fixing to re-enter the review cycle.
- "Accept with issues" — Commit with known issues. Findings
  included in completion report as acknowledged items.
- "Abort" — Do not commit. Leave changes unstaged for manual review.

### Commit

Only reached after PASS or user acceptance:

1. Stage all changed files relevant to this phase
2. Commit with message: `feat({project}): implement phase {N} — {phase title}`
3. Include review cycle count in commit body if > 1 cycle was needed

### Completion Report

Updated to include review cycle information:

## Phase {N} Implementation Complete

### Implemented
- {List of components}

### Files Changed
- {List of files}

### Review Summary
- Cycles: {N} of 3 max
- Findings addressed: {count} ({critical} critical, {high} high fixed)
- Remaining (accepted): {count} ({medium} medium, {low} low)

### Validation Results
- Type check: PASS/FAIL
- Lint: PASS/FAIL
- Tests: PASS/FAIL

### Acceptance Criteria
- [x] {Met criteria}
- [ ] {Unmet criteria with notes}

### Next Steps
- Review changes: `git log -1 --stat`
- For next phase: `/ideation:execute-spec spec-phase-{N+1}.md`
```

4. **Update Key Principles** — Add principles for the review cycle:

```markdown
8. **Review before commit** — Code is not committed until the reviewer passes or the user explicitly accepts
9. **Fix, don't argue** — When the reviewer flags an issue, fix it. Don't rationalize why the deviation is acceptable.
10. **Escalate, don't loop forever** — 3 cycles max. If the same findings persist, the spec or approach needs human input.
```

5. **Update the `allowed-tools` frontmatter** — Verify the Agent tool is already listed (it is). No changes needed.

6. **Update the Parallel Execution section** — The review cycle applies per-session, after all parallel components complete. Each session (main or subagent) runs its own verify-review-fix loop on its components before committing. Add a note:

```markdown
**Review cycle in parallel mode**: Each session (main or subagent) runs its own
verify-review-fix loop after completing its assigned components. The reviewer
evaluates only the diff produced by that session's work, not the full project diff.
```

## Error Handling

| Scenario | Strategy |
|---|---|
| Scout fails to reach GO after 2 rounds | Present HOLD analysis to user. Offer: proceed, update spec, abort. |
| Reviewer agent fails or returns unparseable output | Fall back to current behavior (validation commands only). Log warning. Continue without review cycle. |
| Fix cycle introduces new critical findings | Count toward the same 3-cycle limit. Reviewer on cycle 2+ should note which findings are new vs prior. |
| Git diff is empty (no changes to review) | Skip review cycle. This means all components were no-ops — report as such. |
| Validation commands fail during fix cycle | Fix validation errors first, then re-invoke reviewer. Validation failures don't consume a review cycle. |

## Testing Requirements

### Manual Testing

- [ ] Execute-spec invokes scout agent before building (not inline exploration)
- [ ] Scout produces context-map.md in the correct project directory
- [ ] Execute-spec reads and uses the context map during build
- [ ] After build, execute-spec runs validation commands before invoking reviewer
- [ ] Reviewer is invoked with correct inputs (spec path, pattern files, cycle number)
- [ ] Execute-spec correctly parses reviewer findings and counts severities
- [ ] On PASS (zero critical + high): execute-spec commits
- [ ] On FAIL: execute-spec fixes findings and re-invokes reviewer
- [ ] After 3 failed cycles: execute-spec escalates to user via AskUserQuestion
- [ ] Completion report includes review cycle summary
- [ ] Phase 2+ sessions load existing context-map.md (scout extends, not replaces)

## Validation Commands

```bash
# Verify the SKILL.md was updated
wc -l plugins/ideation/skills/execute-spec/SKILL.md

# Check that scout and reviewer agent references are present
grep -c "scout" plugins/ideation/skills/execute-spec/SKILL.md
grep -c "reviewer" plugins/ideation/skills/execute-spec/SKILL.md
grep -c "review cycle" plugins/ideation/skills/execute-spec/SKILL.md
```

## Open Items

- [ ] Exact Agent tool invocation syntax for the scout and reviewer — depends on how Claude Code resolves plugin-scoped agent names (may need `ideation:scout` or just `scout`)
- [ ] Whether the reviewer should receive the full git diff as text in its prompt or read it via Bash within the agent — tradeoff between context size and agent autonomy

---

_This spec is ready for implementation. The rewrite preserves the existing skill's structure and extends it with the review cycle. Implement the Pre-Execution scout integration first, then the Post-Execution review loop._
