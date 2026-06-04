# Implementation Spec: Orchestration Fixture - Phase 1 (root)

**Contract**: ./contract.md
**Estimated Effort**: S

> Fixture spec. The "implementation" is trivial on purpose — it exists to exercise the
> autopilot Workflow engine end to end. It creates a **real repo file** so `execute-spec`
> has something to commit (writing only to `/tmp` would leave an empty `git diff` and
> `execute-spec` would never commit). **Run in a throwaway git worktree** — see README.

## Technical Approach

Create the fixture output directory and write a marker file, so the phase produces a
committable repo change.

## File Changes

### New Files

| File Path                                                     | Purpose                     |
| ------------------------------------------------------------- | --------------------------- |
| `plugins/ideation/test-fixtures/orchestration/out/phase1.txt` | Marker proving Phase 1 ran. |

## Implementation Details

### Marker file

**Implementation steps**:

1. `mkdir -p plugins/ideation/test-fixtures/orchestration/out`
2. `echo phase1 > plugins/ideation/test-fixtures/orchestration/out/phase1.txt`

## Validation Commands

```bash
mkdir -p plugins/ideation/test-fixtures/orchestration/out
echo phase1 > plugins/ideation/test-fixtures/orchestration/out/phase1.txt
test -f plugins/ideation/test-fixtures/orchestration/out/phase1.txt
```

---

_Trivial fixture spec. The commit message must reference the slug-qualified path `orchestration/spec-phase-1.md` so the git skip pre-pass detects it without colliding with other projects' `spec-phase-1.md`._
