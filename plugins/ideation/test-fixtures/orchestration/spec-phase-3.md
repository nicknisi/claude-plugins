# Implementation Spec: Orchestration Fixture - Phase 3 (rigged failure)

**Contract**: ./contract.md
**Estimated Effort**: S

> Fixture spec. This phase is **deliberately rigged to fail** its validation. It forces
> the engine's failure path: Phase 3 → FAIL, dependent Phase 4 → SKIPPED, sibling
> Phase 2 → still PASS. Do not "fix" the failure — the failure is the test.

## Technical Approach

Write a marker file, then run a validation command that deterministically exits non-zero,
so `execute-spec` fails validation and reports this phase as FAIL **without committing**.

## File Changes

### New Files

| File Path                                                     | Purpose                                      |
| ------------------------------------------------------------- | -------------------------------------------- |
| `plugins/ideation/test-fixtures/orchestration/out/phase3.txt` | Marker (written, but validation still fails) |

## Implementation Details

### Deliberate failure

**Implementation steps**:

1. `echo phase3 > plugins/ideation/test-fixtures/orchestration/out/phase3.txt`
2. Run the failing validation below — it MUST exit 1, so the phase never commits.

## Validation Commands

```bash
mkdir -p plugins/ideation/test-fixtures/orchestration/out
echo phase3 > plugins/ideation/test-fixtures/orchestration/out/phase3.txt
echo "Deliberate fixture failure — Phase 3 is rigged to fail." >&2
exit 1
```

---

_Trivial fixture spec. The validation exits 1 on purpose; the engine should mark this phase FAIL (no commit) and skip Phase 4._
