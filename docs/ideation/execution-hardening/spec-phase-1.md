# Implementation Spec: Execution Hardening - Phase 1 (Foundation)

**Contract**: ./contract.md
**Estimated Effort**: S

## Technical Approach

Phase 1 creates the two agent definitions that Phase 2's execute-spec rewrite will invoke: a Scout agent for structured codebase exploration and a Reviewer agent for spec-aware code review.

Both agents are markdown files with YAML frontmatter, following the Claude Code plugin agent format. The Scout defines a confidence-scored exploration workflow that outputs a persisted context map. The Reviewer defines a structured review workflow that evaluates git diffs against the original spec and produces machine-parseable findings.

Pattern to follow: pro-workflow's agent definitions at `/Users/nicknisi/Developer/pro-workflow/agents/scout.md` and `/Users/nicknisi/Developer/pro-workflow/agents/reviewer.md` for frontmatter structure and prompt organization. Adapt the patterns to be spec-aware rather than generic.

## Feedback Strategy

**Inner-loop command**: N/A — this phase produces markdown files, not code.

**Playground**: Manual review — read each agent definition for completeness, format correctness, and alignment with contract requirements.

**Why this approach**: Agent definitions are prompt engineering. Validation is structural (valid frontmatter, required fields) and semantic (output format covers all use cases). No automated test runner applies.

## File Changes

### New Files

| File Path | Purpose |
|-----------|---------|
| `plugins/ideation/agents/scout.md` | Scout agent definition — confidence-gated codebase exploration with persisted context map output |
| `plugins/ideation/agents/reviewer.md` | Reviewer agent definition — spec-aware code review with structured findings |

## Implementation Details

### Scout Agent

**Pattern to follow**: `/Users/nicknisi/Developer/pro-workflow/agents/scout.md` (for structure), adapted for ideation's context

**Overview**: The Scout agent replaces execute-spec's current inline codebase exploration. It runs as a read-only subagent, scores confidence across 5 dimensions, and outputs a structured context map that gets persisted to `docs/ideation/{project}/context-map.md`. Subsequent phase sessions load this map instead of re-exploring.

```yaml
---
name: scout
description: Confidence-gated codebase exploration for execute-spec. Scores readiness across 5 dimensions, produces a persisted context map.
tools: ["Read", "Glob", "Grep"]
---
```

**Key decisions**:

- **Tools: Read, Glob, Grep only** — No Bash. The scout reads code, it doesn't run anything. This prevents accidental side effects and keeps exploration pure.
- **No worktree isolation** — Read-only tools can't interfere with the main session. Worktree adds complexity without benefit here.
- **5 dimensions from pro-workflow's Scout** — Scope clarity, pattern familiarity, dependency awareness, edge case coverage, test strategy. These map directly to what execute-spec needs before building.
- **Threshold: 70 to proceed, escalate after 2 rounds** — Lower than ideation's 95 because this is implementation readiness, not problem understanding. If the scout can't reach 70 after 2 exploration rounds, the spec itself may be underspecified.
- **Context map persisted to ideation output dir** — `docs/ideation/{project}/context-map.md` alongside contract and specs. Ties the map to the project lifecycle.
- **Load-and-extend pattern** — When a context map already exists (from a prior phase), the scout loads it first, then extends with new findings specific to the current phase. Avoids redundant exploration.

**Implementation steps**:

1. Write the YAML frontmatter (name, description, tools)
2. Write the Trigger section — invoked by execute-spec before implementation, receives the spec file path and project directory as input
3. Write the Workflow section:
   - Check for existing `context-map.md` — if found, load it as baseline
   - Read the spec file to identify: files to change, patterns to follow, testing requirements
   - Explore the codebase targeting those specific areas (not broad exploration)
   - Score confidence across 5 dimensions (0-20 each)
   - If score >= 70: produce context map and return GO verdict
   - If score < 70: identify gaps, gather more context, re-score (max 2 rounds)
   - If still < 70 after 2 rounds: return HOLD verdict with gap analysis
4. Write the Output Format section — the context map structure:

```markdown
# Context Map: {project-name}

**Phase**: {N}
**Scout Confidence**: {score}/100
**Verdict**: GO / HOLD

## Dimensions
| Dimension | Score | Notes |
|---|---|---|
| Scope clarity | /20 | {what files will change, how confident} |
| Pattern familiarity | /20 | {existing patterns found, gaps} |
| Dependency awareness | /20 | {what depends on changed code} |
| Edge case coverage | /20 | {identified edge cases} |
| Test strategy | /20 | {how to verify, what infrastructure exists} |

## Key Patterns
{List of "Pattern to follow" references with brief descriptions of what each pattern does}

## Dependencies
{Which modules/files consume the code being changed. Format: `file:line — consumed by → [list of consumers]`}

## Conventions
{Naming, imports, error handling, type patterns observed in relevant code}

## Risks
{Identified risks — shared state, cross-module effects, missing test coverage}
```

5. Write the Rules section — never edit files, be honest about gaps, focus exploration on spec-relevant areas

**Feedback loop**: Skip — this is a single markdown file with no iterative build cycle.

---

### Reviewer Agent

**Pattern to follow**: `/Users/nicknisi/Developer/pro-workflow/agents/reviewer.md` (for structure), significantly expanded for spec-awareness

**Overview**: The Reviewer agent evaluates implementation quality by reading the git diff and comparing it against the original spec. It produces structured findings in a machine-parseable format and makes a pass/fail verdict. It cannot edit files — this is enforced by tool restrictions.

```yaml
---
name: reviewer
description: Spec-aware code reviewer for execute-spec. Reads git diff + spec, produces structured findings. Cannot edit files.
tools: ["Read", "Grep", "Bash"]
---
```

**Key decisions**:

- **Tools: Read, Grep, Bash** — Read for spec and referenced files. Grep for pattern checking. Bash for `git diff` and `git log`. No Edit, Write, or Glob — the reviewer works with what it's given, not what it discovers.
- **Diff + spec + referenced files only** — The reviewer reads: (1) the git diff (`git diff` via Bash), (2) the original spec file (via Read), (3) files referenced in the spec's "Pattern to follow" sections (via Read). It does NOT browse the full codebase.
- **Two ideation-unique categories** — `spec-deviation` (implementation doesn't match spec's approach) and `pattern-mismatch` (new code doesn't follow referenced patterns). These are what no generic reviewer can provide.
- **Standard categories** — `logic`, `security`, `performance`, `testing` for general quality.
- **Severity levels** — `critical` (must fix, blocks commit), `high` (should fix, blocks commit), `medium` (should fix, doesn't block), `low` (suggestion, doesn't block).
- **Pass/fail based on zero critical + high** — Review passes when no critical or high-severity findings remain. Medium and low are reported but don't block.
- **Structured finding format** — `severity/category file:line — description → action`. Machine-parseable so execute-spec can count severities and determine pass/fail programmatically.

**Implementation steps**:

1. Write the YAML frontmatter (name, description, tools)
2. Write the Input section — reviewer receives: spec file path, list of "Pattern to follow" file paths (extracted from spec), and optionally the cycle number (1st review, 2nd review, etc.)
3. Write the Workflow section:
   - Run `git diff` to get the current changes
   - Read the spec file — extract: technical approach, file changes, implementation details, testing requirements
   - Read referenced pattern files (from spec's "Pattern to follow" entries)
   - Compare diff against spec:
     - **Spec deviation**: Does the implementation follow the specified approach? Are the right files changed? Are interfaces/types as specified?
     - **Pattern mismatch**: Does new code follow the patterns referenced in the spec? Naming conventions, error handling, import style, type patterns?
   - Check general quality: logic errors, security issues, performance concerns, test coverage
   - Produce structured findings
   - Make verdict: PASS (zero critical + high) or FAIL (critical or high findings exist)
4. Write the Output Format section:

```markdown
## Review: Cycle {N}

**Spec**: {spec file path}
**Verdict**: PASS / FAIL
**Findings**: {total} ({critical} critical, {high} high, {medium} medium, {low} low)

### Findings

critical/spec-deviation src/bookmarks/db.ts:15 — Uses localStorage instead of IndexedDB per spec → Rewrite using IndexedDB API following spec's technical approach
high/pattern-mismatch src/bookmarks/store.ts:42 — Uses direct mutation instead of immer pattern used in history-store.ts → Refactor to match history-store's immutable update pattern
medium/testing tests/bookmarks.test.ts:8 — Missing edge case for empty tag list → Add test for bookmark with zero tags
low/logic src/bookmarks/store.ts:67 — Unnecessary null check, type guarantees non-null → Remove redundant check

### Summary
{2-3 sentence summary of overall implementation quality and main areas for improvement}
```

5. Write the Rules section:
   - Never edit files — tool restrictions enforce this, but the prompt should reinforce it
   - Never auto-approve — even if no findings, state the verdict explicitly
   - Suggest fixes, not just problems — every finding includes a `→ action`
   - On subsequent cycles: focus on whether prior findings were addressed, don't re-review already-passed areas
   - If cycle > 1: note which prior findings were fixed and which are new

**Feedback loop**: Skip — this is a single markdown file with no iterative build cycle.

## Testing Requirements

### Manual Testing

- [ ] Scout agent frontmatter has valid YAML with `name`, `description`, and `tools` fields
- [ ] Scout agent `tools` array contains only `Read`, `Glob`, `Grep`
- [ ] Scout output format includes all 5 confidence dimensions with scoring
- [ ] Scout output format includes Key Patterns, Dependencies, Conventions, and Risks sections
- [ ] Reviewer agent frontmatter has valid YAML with `name`, `description`, and `tools` fields
- [ ] Reviewer agent `tools` array contains only `Read`, `Grep`, `Bash` (no Edit/Write)
- [ ] Reviewer output format includes structured findings in `severity/category file:line — description → action` format
- [ ] Reviewer defines all severity levels: critical, high, medium, low
- [ ] Reviewer defines all categories: spec-deviation, pattern-mismatch, logic, security, performance, testing
- [ ] Reviewer verdict logic: PASS when zero critical + high, FAIL otherwise

## Validation Commands

```bash
# Verify agent files exist with correct structure
ls -la plugins/ideation/agents/scout.md plugins/ideation/agents/reviewer.md

# Check frontmatter is valid (name, description, tools present)
head -10 plugins/ideation/agents/scout.md
head -10 plugins/ideation/agents/reviewer.md
```

---

_This spec is ready for implementation. Both agents are self-contained markdown files — write them fully, then verify structure._
