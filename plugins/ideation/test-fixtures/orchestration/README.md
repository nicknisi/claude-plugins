# Orchestration fixture

A synthetic ideation project that validates the `/ideation:autopilot` Workflow engine
(`../../workflows/execute-contract.mjs`). The phases are trivial; the **dependency
graph** is the point.

## The graph

```
Phase 1 — root
  ├── Phase 2 — independent branch   (sibling of P3)
  └── Phase 3 — rigged failure       (validation exits 1 on purpose)
        └── Phase 4 — dependent on the failure
```

Expected engine behavior:

| Phase   | Outcome     | Why                                     |
| ------- | ----------- | --------------------------------------- |
| Phase 1 | completed   | root, no prereqs                        |
| Phase 2 | completed   | sibling of the failure — must still run |
| Phase 3 | **failed**  | validation deliberately `exit 1`        |
| Phase 4 | **skipped** | depends on the failed Phase 3           |

Final summary: `completed = [P1, P2]`, `failed = [P3]`, `skipped = [P4]`.

## Fast, deterministic check (no agents, no Workflow runtime)

Proves the graph wires the planner correctly. Run anytime:

```bash
node --test plugins/ideation/test-fixtures/orchestration/graph.test.mjs
```

This reads the same `contract-data.json` the rebuilt autopilot consumes and asserts the
planner's waves + skip propagation + resume. It is the CI-friendly proof of the
fixture's contract.

> A zero-cost runtime probe also confirms the engine loads + returns in the real Workflow
> runtime: invoke the engine with `args: { phases: [] }` — it hits the early-return branch
> and dispatches no agents. (Confirmed: returns `{completed:[],failed:[],skipped:[],results:[]}`.)

## Live end-to-end run (manual, you-triggered)

This exercises the part the deterministic check can't: `agent()` actually dispatching
`/ideation:execute-spec`, which builds and **commits** a real repo change.

> **Why real repo files, not `/tmp`:** `execute-spec` commits _repo_ changes. If a phase
> only wrote to `/tmp`, its `git diff` would be empty and it would never commit — so the
> fixture specs create real files under `out/`. That means a live run **makes real
> commits**, so it MUST run in a throwaway worktree.

1. **Isolate** — run in a scratch worktree so fixture commits never touch your branch:
   ```bash
   git worktree add /tmp/wfbe-scratch HEAD
   cd /tmp/wfbe-scratch
   git log --oneline --grep="orchestration/spec-phase"   # expect: empty (clean slate)
   ```
2. **Opt into Workflow** (the engine is a dynamic Workflow) and **run autopilot** against the fixture:
   ```
   /ideation:autopilot plugins/ideation/test-fixtures/orchestration/contract.md
   ```
3. **Observe** in `/workflows`: Wave 1 = P1; Wave 2 = P2 + P3 **concurrently**; P4 never dispatched.
4. **Assert** the final summary buckets match the table above, and the failure gate prompts.
5. **Resume check** — re-run the same command; P1/P2 should be skipped via the git pre-pass
   (it matches the slug-qualified `orchestration/spec-phase-N.md` in the commit messages).
6. **Record** pass/fail of each assertion below.

### Assertions to record

- [ ] Wave 1 = [Phase 1]; Wave 2 dispatches Phase 2 + Phase 3 concurrently; Phase 4 never dispatched.
- [ ] Summary: completed [P1, P2], failed [P3], skipped [P4].
- [ ] Failure gate prompts after the wave resolves.
- [ ] `out/phase4.txt` does NOT exist (skip propagation held).
- [ ] Re-run skips already-committed P1/P2.

## Reset

```bash
# From the main tree, tear down the scratch worktree (discards all fixture commits):
git worktree remove --force /tmp/wfbe-scratch
```

> Running in the worktree keeps fixture commits off your real branch entirely — removing
> the worktree discards them. Never run the live exercise directly on a branch you intend
> to keep.
