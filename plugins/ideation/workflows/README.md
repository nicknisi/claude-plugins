# Ideation execution engine (`workflows/`)

The deterministic phase-orchestration engine behind `/ideation:autopilot`. It is a
[dynamic Workflow](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code)
script — the `/ideation:autopilot` skill invokes it via the `Workflow` tool.

## Files

| File                              | Role                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `execute-contract.mjs`            | The Workflow script. Plans dependency-ordered waves and dispatches each phase.                     |
| `wave-planner.mjs`                | Pure planner logic (`computeWaves`, `propagateSkips`, `detectCycle`). Unit-tested source of truth. |
| `wave-planner.test.mjs`           | `node --test` unit tests for the planner.                                                          |
| `execute-contract.smoke.test.mjs` | `node --test` smoke test of the script body (stubbed agents).                                      |

> The three planner functions are **inlined** into `execute-contract.mjs` (not
> imported) so the script loads regardless of whether the Workflow sandbox allows
> relative imports. `wave-planner.mjs` is the canonical, tested copy — **keep the
> two in sync**.

## Division of labor

The Workflow sandbox has **no filesystem/git access** and **cannot call
`AskUserQuestion`**. So responsibilities split:

| Concern                                     | Owner                       |
| ------------------------------------------- | --------------------------- |
| Read `contract-data.json`, build `args`     | `/ideation:autopilot` skill |
| `git log` skip pre-pass (`completedPhases`) | `/ideation:autopilot` skill |
| Plan waves, dispatch phases, schema results | this engine                 |
| Interactive failure-gating + resume         | `/ideation:autopilot` skill |

## `args` contract

The skill passes this object as the Workflow's `args` (an actual JSON value, not a
stringified one):

```jsonc
{
  "projectName": "Human-Readable Name",
  "slug": "kebab-slug",
  "projectDir": "docs/ideation/<slug>/",
  "phases": [
    {
      "title": "Phase title (must match prereq references exactly)",
      "specPath": "docs/ideation/<slug>/spec-phase-1.md",
      "prereqs": ["Other phase title", "..."], // titles that must finish first
      "risk": "low", // optional, display only
    },
  ],
  "completedPhases": ["Phase title", "..."], // already committed; excluded from dispatch
}
```

- **Edges are phase titles**, matching `contract-data.json`'s `execution.phases[].prereqs`.
- `completedPhases` seeds the planner's satisfied set so a resumed run only executes what remains.

## Return value

```jsonc
{
  "completed": ["Phase title", "..."], // result === "PASS"
  "failed": ["Phase title", "..."], // result === "FAIL" (or null agent result)
  "skipped": ["Phase title", "..."], // blocked by an upstream failure
  "results": [
    {
      "title": "...",
      "result": "PASS|FAIL|SKIPPED",
      "commitHash": "sha|null",
      "summary": "...",
      "findings": ["..."],
    },
  ],
}
```

## Behavior notes

- **Run everything reachable.** A failed phase only skips its (transitive) dependents;
  independent phases still run. The skill decides what to do about failures afterward —
  this is what makes the engine safe to wrap in an unattended `/goal`.
- **`parallel()` per wave**, with the runtime concurrency cap (`min(16, cores-2)`).
- **Schema-validated results** — no free-text `RESULT:` parsing.
- **Resume**: within-session via the `Workflow` tool's `resumeFromRunId` (driven by the
  skill); cross-session via the skill's `git log` pre-pass populating `completedPhases`.

## Testing

```bash
node --test 'plugins/ideation/workflows/*.test.mjs'
```

The planner tests cover the graph math; the smoke test runs the full script body with
stubbed agents (wave ordering, parallel wave, failure→skip, resume, null-guard). A live
end-to-end run against a real fixture is exercised by the orchestration test fixture
(see `../test-fixtures/orchestration/`).
