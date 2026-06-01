# Implementation Spec: Orchestration Fixture - Phase 4 (dependent on the failure)

**Contract**: ./contract.md
**Estimated Effort**: S

> Fixture spec. Depends on Phase 3, which is rigged to fail. The engine must **never
> dispatch** this phase — it should appear in the `skipped` bucket. If this sentinel
> ever gets written during a failure run, the skip-propagation logic is broken.

## Technical Approach

Would write a sentinel — but should never run because Phase 3 fails.

## File Changes

### New Files

| File Path                       | Purpose                                                      |
| ------------------------------- | ------------------------------------------------------------ |
| `/tmp/wfbe-fixture/phase4.done` | Sentinel — its ABSENCE after a failure run is the assertion. |

## Implementation Details

### Sentinel

**Implementation steps**:

1. `echo phase4 > /tmp/wfbe-fixture/phase4.done`

## Validation Commands

```bash
echo phase4 > /tmp/wfbe-fixture/phase4.done
test -f /tmp/wfbe-fixture/phase4.done
```

---

_Trivial fixture spec. Commit message must reference the slug-qualified path `orchestration/spec-phase-4.md`. Expected to be SKIPPED, not run, in the failure scenario._
