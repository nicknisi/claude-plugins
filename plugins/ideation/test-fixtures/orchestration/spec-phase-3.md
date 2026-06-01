# Implementation Spec: Orchestration Fixture - Phase 3 (rigged failure)

**Contract**: ./contract.md
**Estimated Effort**: S

> Fixture spec. This phase is **deliberately rigged to fail** its validation. It forces
> the engine's failure path: Phase 3 → FAIL, dependent Phase 4 → SKIPPED, sibling
> Phase 2 → still PASS. Do not "fix" the failure — the failure is the test.

## Technical Approach

Write a sentinel, then run a validation command that deterministically exits non-zero,
so `execute-spec` reports this phase as failed after its review/validation cycle.

## File Changes

### New Files

| File Path                       | Purpose                                       |
| ------------------------------- | --------------------------------------------- |
| `/tmp/wfbe-fixture/phase3.done` | Sentinel (written, but validation still fails)|

## Implementation Details

### Deliberate failure

**Implementation steps**:

1. `echo phase3 > /tmp/wfbe-fixture/phase3.done`
2. Run the failing validation below — it MUST exit 1.

## Validation Commands

```bash
echo phase3 > /tmp/wfbe-fixture/phase3.done
echo "Deliberate fixture failure — Phase 3 is rigged to fail." >&2
exit 1
```

---

_Trivial fixture spec. The validation exits 1 on purpose; the engine should mark this phase FAIL and skip Phase 4._
