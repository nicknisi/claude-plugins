# Implementation Spec: Orchestration Fixture - Phase 1 (root)

**Contract**: ./contract.md
**Estimated Effort**: S

> Fixture spec. The "implementation" is trivial on purpose — it exists to exercise the
> autopilot Workflow engine, not to build anything real. All side effects go to
> `/tmp/wfbe-fixture/`.

## Technical Approach

Create the fixture scratch directory and write a sentinel marking this phase done.

## File Changes

### New Files

| File Path                       | Purpose                          |
| ------------------------------- | -------------------------------- |
| `/tmp/wfbe-fixture/phase1.done` | Sentinel proving Phase 1 ran.    |

## Implementation Details

### Sentinel

**Implementation steps**:

1. `mkdir -p /tmp/wfbe-fixture`
2. `echo phase1 > /tmp/wfbe-fixture/phase1.done`

## Validation Commands

```bash
mkdir -p /tmp/wfbe-fixture && echo phase1 > /tmp/wfbe-fixture/phase1.done
test -f /tmp/wfbe-fixture/phase1.done
```

---

_Trivial fixture spec. Commit message must reference the slug-qualified path `orchestration/spec-phase-1.md` so the git skip pre-pass detects it without colliding with other projects' `spec-phase-1.md`._
