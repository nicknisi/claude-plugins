---
name: autopilot
description: Orchestrate full execution of an ideation project — reads the contract, walks the phase dependency graph, and dispatches subagents to execute specs. Parallel for independent phases, sequential for dependent ones. Auto-continues on success, gates on failure. Use after ideation is complete and specs are approved.
disable-model-invocation: true
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
---

# Run Ideation Project

## Arguments: $ARGUMENTS

Orchestrate the execution of all phases in an ideation project.

**Parse arguments:**

- Optional: path to `contract.md` (e.g., `docs/ideation/my-project/contract.md`)
- If omitted, auto-detect by globbing `./docs/ideation/*/contract.md`
- If multiple contracts found, use `AskUserQuestion` to select one

## Phase 1: Parse the Contract

Read `contract.md` and extract the Execution Plan:

1. **Find the `## Execution Plan` section**
2. **Parse the Dependency Graph** — extract phase numbers, titles, and blocking relationships from the ASCII tree. Build an adjacency list:

   ```
   { 1: [], 2: [1], 3: [1], 4: [3] }
   ```

   Where values are the phases that block each key.

3. **Parse Execution Steps** — extract spec file paths from the fenced `bash` blocks. Each `/ideation:execute-spec path/to/spec.md` line maps a phase number to its spec file.

4. **Derive the project directory** from the contract path. If the contract is at `docs/ideation/my-project/contract.md`, the project directory is `docs/ideation/my-project/`.

5. **Validate** — confirm each spec file exists. If any are missing, report which and ask the user whether to continue without them or abort.

6. **Detect already-completed phases** — run `git log --oneline --grep="spec-phase"` (or similar) to find commits that reference spec files. For each phase whose spec path appears in a commit message, mark it as already completed and exclude it from execution. Report which phases are being skipped:
   ```
   Skipping Phase 1 (already committed: abc1234)
   ```

## Phase 2: Plan Execution Order

From the dependency graph, compute execution waves — groups of phases that can run in parallel because all their blockers are satisfied.

**Algorithm:**

```
completed = {already-committed phases from Phase 1, step 6}
waves = []
while uncompleted phases remain:
  ready = phases where all blockedBy are in completed
  waves.append(ready)
  completed = completed ∪ ready
```

**Example:**

```
Dependencies: { 1: [], 2: [1], 3: [1], 4: [3] }

Wave 1: [Phase 1]           — no blockers
Wave 2: [Phase 2, Phase 3]  — both blocked only by Phase 1
Wave 3: [Phase 4]           — blocked by Phase 3
```

Present the execution plan to the user before starting:

```
Execution plan for {project-name}:
  Wave 1: Phase 1 ({title})
  Wave 2: Phase 2 ({title}) + Phase 3 ({title})  [parallel]
  Wave 3: Phase 4 ({title})

{N} phases across {M} waves. Parallel phases in waves 2+.
Starting now — I'll pause only if a phase fails review.
```

## Phase 3: Execute Waves

Process waves sequentially. Within each wave, dispatch phases in parallel if the wave has multiple phases.

### Single-phase wave

Dispatch one subagent:

```
Agent({
  description: "Execute Phase {N}: {title}",
  subagent_type: "general-purpose",
  mode: "bypassPermissions",
  prompt: "<instructions>
You are executing Phase {N} of the {project-name} ideation project.

Run the execute-spec skill in headless mode:
/ideation:execute-spec --headless {spec-file-path}

Follow the skill's full workflow: Scout → Build → Verify-Review-Fix → Commit.
The --headless flag auto-proceeds through confirmation steps so execution
does not block.

When complete, report:
- RESULT: PASS or FAIL
- Summary of what was implemented
- Any findings from the review cycle
- The commit hash (if committed)

If the review cycle fails after 3 cycles, report RESULT: FAIL with the
remaining findings. Do not ask the user — the orchestrator handles failure gates.
</instructions>"
})
```

### Multi-phase wave (parallel)

Dispatch all phases in the wave simultaneously using multiple `Agent` tool calls in a single message. Each subagent gets the same prompt structure above with its own phase number and spec path.

### After each wave completes

**Parse each subagent's result.** Look for `RESULT: PASS` or `RESULT: FAIL` in the output.

**If all phases PASS:** Log completion, move to next wave.

**If any phase FAIL:**

This is the failure gate. Stop and present the situation:

```
AskUserQuestion:
  Question: "Phase {N} failed review after 3 cycles. {summary of findings}. How to proceed?"
  Options:
  - "Skip and continue" — Mark phase as failed, continue with remaining waves. Phases that depend on this one will also be skipped.
  - "Retry phase" — Re-dispatch the failed phase with a fresh subagent.
  - "Stop here" — Halt execution. Completed phases are already committed.
```

**If "Skip and continue":**

- Mark the phase as failed
- Remove it from `completed` set for dependency resolution
- Any phase whose `blockedBy` includes the failed phase is also skipped
- Log which phases were skipped and why

**If "Retry phase":**

- Re-dispatch the same phase with a new subagent
- If it fails again, re-present the gate (no retry limit, but each retry is explicit)

**If "Stop here":**

- Report what completed and what remains
- Exit

### Progress Reporting

After each wave, print a brief status line:

```
Wave {M}/{total}: Phase(s) {list} — {PASS/FAIL}
  Completed: {list of all completed phases}
  Remaining: {list of remaining phases}
```

## Phase 4: Completion Report

After all waves complete (or execution stops), present a summary:

```
## Execution Complete

### Completed Phases
- Phase 1: {title} — {commit hash}
- Phase 2: {title} — {commit hash}
- Phase 3: {title} — {commit hash}

### Skipped Phases
- Phase 4: {title} — blocked by failed Phase 3

### Failed Phases
- Phase 3: {title} — {summary of failure}

### Summary
{M} of {N} phases completed successfully.
{commits committed, files changed across all phases}
```

If all phases completed successfully:

```
All {N} phases complete. Run `git log --oneline -{N}` to see the commits.
```

## Key Principles

1. **Subagents get clean contexts** — each phase runs in a fresh agent with no prior phase's context. This is why we use the Agent tool, not inline execution.
2. **The contract is the source of truth** — phase order, dependencies, and spec paths all come from the contract's Execution Plan.
3. **Gate on failures, not successes** — the happy path is fully hands-off. User intervention only when review fails.
4. **Parallel when possible** — independent phases run simultaneously. The dependency graph determines what's safe to parallelize.
5. **Already-committed phases are durable** — each phase commits independently. If execution stops at wave 3, waves 1 and 2 are already committed.
6. **Don't re-execute completed phases** — if a spec's changes are already committed (check `git log` for the spec name in commit messages), skip it.
