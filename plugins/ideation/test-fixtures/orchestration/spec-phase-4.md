# Implementation Spec: Orchestration Fixture - Phase 4 (dependent on the failure)

**Contract**: ./contract.md
**Estimated Effort**: S

> Fixture spec. Depends on Phase 3, which is rigged to fail. The engine must **never
> dispatch** this phase — it should appear in the `skipped` bucket. If this marker file
> ever gets created during a failure run, the skip-propagation logic is broken.

## Technical Approach

Would write a marker file — but should never run because Phase 3 fails.

## File Changes

### New Files

| File Path                                                     | Purpose                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| `plugins/ideation/test-fixtures/orchestration/out/phase4.txt` | Marker — its ABSENCE after a failure run is the assertion. |

## Implementation Details

### Marker file

**Implementation steps**:

1. `echo phase4 > plugins/ideation/test-fixtures/orchestration/out/phase4.txt`

## Validation Commands

```bash
mkdir -p plugins/ideation/test-fixtures/orchestration/out
echo phase4 > plugins/ideation/test-fixtures/orchestration/out/phase4.txt
test -f plugins/ideation/test-fixtures/orchestration/out/phase4.txt
```

---

_Trivial fixture spec. The commit message must reference the slug-qualified path `orchestration/spec-phase-4.md`. Expected to be SKIPPED, not run, in the failure scenario._
