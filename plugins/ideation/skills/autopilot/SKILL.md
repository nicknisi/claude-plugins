---
name: autopilot
description: Orchestrate full execution of an ideation project — reads the contract, builds an execution manifest, and runs all phases on the deterministic Workflow engine (parallel for independent phases, sequential for dependent ones). Auto-continues on success, gates on failure. Use after ideation is complete and specs are approved.
disable-model-invocation: true
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Workflow
  - Agent
  - AskUserQuestion
---

# Run Ideation Project

## Arguments: $ARGUMENTS

Orchestrate execution of all phases in an ideation project by driving the
deterministic **Workflow engine** at `${CLAUDE_PLUGIN_ROOT}/workflows/execute-contract.mjs`.

**This skill does the three things the sandboxed engine cannot:** read the
contract, run the `git log` skip pre-pass, and own interactive failure-gating +
resume. The engine does everything between — topological wave planning, parallel
dispatch, and schema-validated per-phase results. **You do not compute waves or
parse `RESULT:` text yourself — the engine returns a structured summary.**

**Parse arguments:**

- Optional: path to `contract.md` (e.g., `docs/ideation/my-project/contract.md`)
- If omitted, auto-detect by globbing `./docs/ideation/*/contract.md`
- If multiple contracts found, use `AskUserQuestion` to select one

## Step 1: Locate & Parse the Contract

1. Resolve the contract path (argument or glob). Derive the **project directory** from it — for `docs/ideation/my-project/contract.md`, that's `docs/ideation/my-project/`.
2. Read the sibling **`contract-data.json`** in that directory. Its `execution.phases` array already holds each phase's `title`, `specPath`, `prereqs`, and `risk` — this is the manifest. Also read `projectName` and `slug`.
3. **Validate** each `specPath` exists. If any are missing, report which and ask the user whether to continue without them or abort.
4. **Fallback if `contract-data.json` is absent** (older projects with only `contract.md`): parse the `## Execution Plan` section of `contract.md` — phase titles, spec paths from the `/ideation:execute-spec <path>` lines, and blocking relationships from the dependency graph — and build the same phase list. If you cannot, abort with guidance to re-run ideation.

## Step 2: Git Skip Pre-Pass

Run `git log --oneline --grep="spec-phase"` to find commits that already reference spec files. For each phase whose `specPath` filename appears in a commit message, add its **title** to a `completedPhases` list. Report what's being skipped:

```
Skipping "Phase title" (already committed: abc1234)
```

The engine excludes these from dispatch, so a resumed run only executes what remains.

## Step 3: Build the Engine `args`

Assemble the manifest exactly per `${CLAUDE_PLUGIN_ROOT}/workflows/README.md`:

```jsonc
{
  "projectName": "...",
  "slug": "...",
  "projectDir": "docs/ideation/<slug>/",
  "phases": [
    { "title": "...", "specPath": "...", "prereqs": ["<other titles>"], "risk": "low" }
  ],
  "completedPhases": ["<titles from Step 2>"]
}
```

- `prereqs` are **phase titles** — pass `contract-data.json`'s values straight through; do not remap to indices.
- Before invoking, sanity-check that every `prereqs` entry matches some phase `title` (or a `completedPhases` entry). If a title doesn't resolve, it's a manifest bug — report it rather than dispatching a broken graph (the engine will otherwise throw "Unknown prereq").

## Step 4: Invoke the Engine

1. Resolve the engine's **absolute path** — run `echo "$CLAUDE_PLUGIN_ROOT/workflows/execute-contract.mjs"` via `Bash` and confirm the file exists.
2. Call the **`Workflow`** tool with `scriptPath` set to that absolute path and `args` set to the manifest object from Step 3 (pass it as an actual JSON value, **not** a stringified one).
3. Tell the user before it starts: how many phases, how many already skipped, and that you'll pause only if a phase fails.
4. **Capture the returned `runId`** — you need it for same-session resume.

The engine runs in the background and notifies on completion. Watch progress with `/workflows`.

**If the `Workflow` tool is unavailable** (feature not enabled in this Claude Code): degrade gracefully — tell the user, then walk the phases yourself in dependency order using `/ideation:execute-spec <specPath>` per phase (the contract's per-phase commands), committing each before the next. This is the legacy manual path.

## Step 5: Handle the Summary

The engine returns `{ completed, failed, skipped, results }`. Print the three buckets.

**If `failed` is empty:** proceed to the Completion Report.

**If `failed` is non-empty:** this is the failure gate. Present it via `AskUserQuestion`:

```
Question: "Phase(s) {failed titles} failed. {one-line summary from results[].summary}. Dependent phases {skipped titles} were skipped. How to proceed?"
Options:
- "Retry failed phases" — Re-run the engine; it resumes from where it stopped.
- "Stop here" — Halt. Completed phases are already committed.
- "Accept and finish" — Treat failures as acknowledged; report and finish.
```

**If "Retry failed phases":**

- **Same session:** re-invoke the `Workflow` tool with `resumeFromRunId: <runId>` (and the same `scriptPath`). Cached passing phases return instantly; only the failed/unreached phases re-run.
- **New session, or resume rejected:** simply re-run this skill from Step 1 — the Step 2 git pre-pass re-derives `completedPhases` from the commits, so already-committed phases are skipped regardless. This is the cross-session resume path.

**If "Stop here":** report completed vs. remaining and exit.

**If "Accept and finish":** include the unresolved findings in the Completion Report under "Acknowledged Issues" and finish.

## Completion Report

After the engine finishes (or execution stops), present a summary:

```markdown
## Execution Complete

### Completed Phases
- {title} — {commitHash from results}

### Skipped Phases
- {title} — blocked by failed {prereq}

### Failed Phases
- {title} — {summary}

### Summary
{N} of {M} phases completed successfully.
```

If all phases completed:

```
All {N} phases complete. Run `git log --oneline -{N}` to see the commits.
```

## Key Principles

1. **The engine orchestrates; the skill prepares and gates.** Wave planning, parallelism, and result handling are deterministic JS in `workflows/execute-contract.mjs`. This skill builds the `args`, runs the git pre-pass, and handles the human-in-the-loop moments the sandbox can't.
2. **No wave math, no `RESULT:` parsing here.** Pass `prereqs` through untouched; read the structured summary the engine returns.
3. **The contract is the source of truth** — phase order, dependencies, and spec paths all come from `contract-data.json` (`contract.md` Execution Plan as fallback).
4. **Subagents get clean contexts** — the engine dispatches each phase as a fresh-context subagent running `/ideation:execute-spec --headless`. No phase inherits another's context.
5. **Gate on failures, not successes** — the happy path is fully hands-off; the engine runs everything still reachable and only the skill pauses, after the run, when something failed.
6. **Already-committed phases are durable** — each phase commits independently. The git pre-pass makes resume work across sessions; `resumeFromRunId` makes it instant within a session.
