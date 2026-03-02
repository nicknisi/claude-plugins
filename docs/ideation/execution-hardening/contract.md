# Execution Hardening Contract

**Created**: 2026-03-02
**Confidence Score**: 95/100
**Status**: Approved

## Problem Statement

The ideation plugin's execute-spec skill runs linearly: load spec, explore codebase, build components, validate, report. This has three structural weaknesses.

First, quality issues are only caught by post-hoc validation commands (typecheck, lint, test). There's no review cycle that checks whether the implementation actually follows the spec — a component can pass all tests but deviate from the specified approach, use the wrong patterns, or miss architectural requirements. No human reviewer would accept "tests pass" as sufficient; neither should an automated workflow.

Second, codebase exploration is ephemeral. Every execute-spec session re-explores the codebase from scratch. Phase 3 repeats the same exploration Phase 1 already did. The findings — dependency maps, pattern conventions, test strategies — are never persisted. This wastes context window and produces inconsistent understanding across sessions.

Third, there is no separation between the building and reviewing perspectives. The same agent that writes code also validates it. This creates a blind spot — the builder is biased toward confirming its own work, not challenging it. Effective code review requires a separate perspective that evaluates what changed against what was specified.

## Goals

1. **Introduce a spec-aware review cycle** — After implementation, a structurally separate reviewer evaluates the git diff against the original spec, producing findings in a machine-parseable format that feed back to the builder for correction.

2. **Persist codebase understanding across sessions** — A dedicated scout agent produces a structured context map during pre-execution exploration. Subsequent phase sessions load and extend this map instead of re-exploring from scratch.

3. **Evolve execute-spec from linear to cyclical** — Replace the current build-once-validate-done flow with a build → verify → review → fix loop that iterates until the review passes or escalates to the user.

## Success Criteria

- [ ] Scout agent produces `context-map.md` with scored dimensions (scope clarity, pattern familiarity, dependency awareness, edge case coverage, test strategy)
- [ ] Phase 2+ execute-spec sessions load and extend the existing context map rather than exploring from scratch
- [ ] Reviewer agent reads only git diff + spec + referenced files (cannot edit files — enforced by tool restrictions)
- [ ] Reviewer produces structured findings: `severity/category file:line — description → action`
- [ ] Reviewer includes `spec-deviation` and `pattern-mismatch` categories alongside standard categories (logic, security, performance, testing)
- [ ] Build-verify-review loop runs up to 3 cycles before escalating to user
- [ ] Review passes when zero critical and zero high-severity findings remain
- [ ] Code is committed only after review passes (not before)
- [ ] Both agents defined as separate agent files in `plugins/ideation/agents/`

## Scope Boundaries

### In Scope

- New agent: `plugins/ideation/agents/scout.md` — read-only codebase exploration with confidence scoring and persisted output
- New agent: `plugins/ideation/agents/reviewer.md` — spec-aware code review with structured findings and restricted tool access
- Rewrite of `plugins/ideation/skills/execute-spec/SKILL.md` to incorporate the build-verify-review loop, scout integration, and reviewer integration
- New reference: finding format specification and severity definitions
- New reference: context map format and structure
- Updated examples showing the loop flow

### Out of Scope

- Changes to ideation main skill (SKILL.md) — Phase 2 inline exploration stays as-is
- Worktree isolation — not needed since scout is read-only and reviewer can't edit
- Learning persistence (SQLite, cross-session DB) — pro-workflow pattern, different concern
- Adaptive quality gates based on correction history — interesting but separate improvement
- Changes to contract, PRD, or spec templates

### Future Considerations

- Ideation Phase 2 loading prior scout reports for context when iterating on an existing project
- Adaptive cycle limits based on finding severity trends (if findings decrease each cycle, allow more; if stalling, escalate sooner)
- Integration with git hooks for pre-commit review enforcement
- Stacked PR support for multi-phase parallel execution with review cycles

## Execution Plan

### Dependency Graph

```
Phase 1: Foundation (Scout + Reviewer agents) ──→ Phase 2: Integration (Execute-spec rewrite)
```

### Strategy: Sequential (2 phases, linear dependency)

Phase 2 invokes both agents from Phase 1. No parallelization possible.

### Execution Steps

1. **Phase 1 — Foundation**
   ```
   /ideation:execute-spec docs/ideation/execution-hardening/spec-phase-1.md
   ```

2. **Phase 2 — Integration** (after Phase 1 complete)
   ```
   /ideation:execute-spec docs/ideation/execution-hardening/spec-phase-2.md
   ```

---

_This contract was generated from brain dump input and approved on 2026-03-02._
