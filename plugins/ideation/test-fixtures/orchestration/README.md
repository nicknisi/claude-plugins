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

## Live end-to-end run (manual, you-triggered)

This exercises the **real** Workflow runtime, `scriptPath` loading, and `agent()`
dispatching `/ideation:execute-spec` — the integration unknowns the deterministic check
can't cover. It dispatches real subagents and makes commits, so run it deliberately, in
an isolated working area, and **opt into Workflow** (the engine is a dynamic Workflow):

1. **Clean slate** — ensure no fixture phases are already committed and clear sentinels:
   ```bash
   rm -rf /tmp/wfbe-fixture
   git log --oneline --grep="spec-phase" | grep orchestration   # expect: empty
   ```
   Prefer a scratch worktree or clone so fixture commits don't pollute real history
   (see "Reset" below).
2. **Run autopilot** against the fixture contract:
   ```
   /ideation:autopilot plugins/ideation/test-fixtures/orchestration/contract.md
   ```
3. **Observe** in `/workflows`: Wave 1 = P1; Wave 2 = P2 + P3 **concurrently**; P4 never dispatched.
4. **Assert** the final summary buckets match the table above, and the failure gate prompts.
5. **Resume check** — re-run the same command; P1/P2 should be skipped via the git pre-pass.
6. **Record** pass/fail of each assertion below.

### Assertions to record

- [ ] Wave 1 = [Phase 1]; Wave 2 dispatches Phase 2 + Phase 3 concurrently; Phase 4 never dispatched.
- [ ] Summary: completed [P1, P2], failed [P3], skipped [P4].
- [ ] Failure gate prompts after the wave resolves.
- [ ] `/tmp/wfbe-fixture/phase4.done` does NOT exist (skip propagation held).
- [ ] Re-run skips already-committed P1/P2.

## Reset

```bash
rm -rf /tmp/wfbe-fixture
# If you ran it in the main tree and it made commits, drop them:
#   git rebase -i <before-fixture-commits>   (or reset --hard if safe)
```

> Tip: run the live exercise in a throwaway `git worktree add ../wfbe-scratch` so
> fixture commits never touch your real branch.
