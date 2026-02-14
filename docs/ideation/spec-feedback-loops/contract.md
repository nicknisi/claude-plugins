# Spec Feedback Loops Contract

**Created**: 2026-02-13
**Confidence Score**: 95/100
**Status**: Approved

## Problem Statement

The ideation plugin generates implementation specs that tell an executing AI agent *what to build* — file changes, implementation steps, code patterns — but not *how to validate its work during implementation*. The existing "Validation Commands" section is post-hoc: run after all components are built. There's no mechanism for the agent to set up a feedback harness, build incrementally against it, and iterate until passing.

This matters because agents without feedback loops work blind. They write all the code, then discover issues at the end when the blast radius is largest. An agent with a tight feedback loop catches problems per-component, per-function — the same way an effective developer works.

The [ampcode.com/notes/feedback-loopable](https://ampcode.com/notes/feedback-loopable) article frames this as three levels: (1) build a playground — an environment to interact with, (2) set up experiments — parameterized, reproducible checks, (3) optimize the inner loop — make the check cycle fast.

## Goals

1. **Specs define per-component feedback loops** — each component in a spec includes what playground to set up, what experiments to run, and what command gives the fastest check cycle
2. **Spec generation logic guides the AI to design feedback loops** — SKILL.md Phase 4.4 teaches the AI how to choose the right feedback mechanism per component type (tests for data layers, dev server for UI, curl for APIs)
3. **Execution flow uses feedback loops during implementation** — execute-spec changes from "build then check" to "set up harness → build incrementally → check → iterate"
4. **Lightweight by default** — trivial components (config, types, constants) skip feedback loops; only components with iterative, observable behavior get them
5. **Feedback loop quality scoring** — the confidence rubric evaluates whether generated specs include adequate feedback strategies, scoring them as a dimension of spec quality
6. **Auto-detection of feedback infrastructure** — execute-spec discovers existing feedback tools (test runners, dev servers, storybook, script harnesses) in the codebase, even when the spec doesn't explicitly list them

## Success Criteria

- [ ] spec-template.md has a top-level "Feedback Strategy" section (inner-loop command, playground type)
- [ ] spec-template.md has a per-component "Feedback loop" block within Implementation Details (playground, experiment, check command)
- [ ] SKILL.md Phase 4.4 includes guidance on designing feedback loops per component type
- [ ] SKILL.md Phase 2.2 explores existing feedback infrastructure (test runners, dev servers, storybook)
- [ ] execute-spec.md adds a "Set Up Feedback Environment" step before component implementation
- [ ] execute-spec.md restructures per-component flow to: set up loop → build incrementally → check → iterate
- [ ] spec-example.md demonstrates realistic feedback loops for the bookmark feature (store tests + dev server)
- [ ] Trivial components in the example omit feedback loops, demonstrating the "skip when not needed" principle
- [ ] confidence-rubric.md includes a "Feedback Strategy" scoring dimension for evaluating spec quality
- [ ] execute-spec.md includes an auto-detection step that discovers test runners, dev servers, and other feedback tools from the codebase before implementation begins

## Scope Boundaries

### In Scope

- Add Feedback Strategy section to spec-template.md
- Add per-component Feedback Loop block to spec-template.md
- Update SKILL.md Phase 4.4 with feedback loop generation guidance
- Update SKILL.md Phase 2.2 to explore feedback infrastructure
- Restructure execute-spec.md execution flow around feedback loops
- Update spec-example.md with concrete feedback loop examples
- Update template usage notes
- Feedback loop quality scoring — update confidence rubric to evaluate whether specs have good feedback strategies
- Auto-detection of feedback infrastructure during execute-spec — agent discovers test runners, dev servers, storybook etc. even when the spec doesn't explicitly list them

### Out of Scope

- Contract template changes — contracts define *what*, not *how to validate*
- PRD template changes — PRDs are requirements, not implementation details
- New files or tooling — this is purely documentation/template changes
- Changes to the workflow-example.md — can be updated separately

### Future Considerations

- Feedback loop templates per project type (React, API, CLI) — pre-filled strategies based on detected stack

---

_This contract was generated from brain dump input. Review and approve before proceeding to specification._
