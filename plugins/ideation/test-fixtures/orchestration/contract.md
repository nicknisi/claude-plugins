# Orchestration Fixture Contract

**Created**: 2026-06-01
**Confidence Score**: 100/100
**Status**: Approved
**Supersedes**: None

## Problem Statement

A synthetic project used only to validate the `/ideation:autopilot` Workflow engine.
Its four phases are trivial (write a sentinel file); its **dependency graph** is what
matters — a diamond with one rigged failure that exercises wave ordering, parallel
dispatch, failure gating, skip propagation, and resume in a single run.

## Goals

1. Prove the engine plans `[P1] → [P2, P3] → [P4]` and dispatches P2/P3 in parallel.
2. Prove a failed P3 skips its dependent P4 while sibling P2 still completes.
3. Prove a re-run skips already-committed phases (resume).

## Success Criteria

- [ ] Final summary: `completed = [Phase 1, Phase 2]`, `failed = [Phase 3]`, `skipped = [Phase 4]`.
- [ ] P2 and P3 dispatch concurrently (visible in `/workflows`).
- [ ] The failure gate prompts after the wave resolves.
- [ ] A re-run does not re-execute committed phases.

## Scope Boundaries

### In Scope

- Four trivial specs and their dependency wiring.

### Out of Scope

- Any real production code — fixtures write only trivial marker files under `out/`, and the live run executes in a throwaway worktree.

### Future Considerations

- None.

## Execution Plan

### Dependency Graph

```
Phase 1 — root
  ├── Phase 2 — independent branch   (blocked by Phase 1)
  └── Phase 3 — rigged failure       (blocked by Phase 1)
        └── Phase 4 — dependent on the failure  (blocked by Phase 3)
```

### Execution Steps

**Strategy**: Hybrid

1. **Phase 1** — root _(blocking)_

   ```bash
   /ideation:execute-spec plugins/ideation/test-fixtures/orchestration/spec-phase-1.md
   ```

2. **Phases 2 & 3** — parallel after Phase 1

   ```bash
   /ideation:execute-spec plugins/ideation/test-fixtures/orchestration/spec-phase-2.md
   /ideation:execute-spec plugins/ideation/test-fixtures/orchestration/spec-phase-3.md
   ```

3. **Phase 4** — dependent on the failure _(blocked by Phase 3)_

   ```bash
   /ideation:execute-spec plugins/ideation/test-fixtures/orchestration/spec-phase-4.md
   ```

---

_Fixture contract — not a real project. See README.md for how to run and reset._
