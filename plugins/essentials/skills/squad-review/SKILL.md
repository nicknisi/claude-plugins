---
name: squad-review
description: >-
  Review the current branch with six specialist lenses (security, correctness,
  conventions, tests, architecture, duplication), then put every finding
  through an adversarial verifier that tries to refute it — so what reaches you
  has already survived a skeptic. Use when the user asks for a thorough,
  deep, or paranoid review, a review before merging or shipping, a "real"
  review, or wants to know what a review would catch that a quick pass misses.
  Costs 12 agents; for a fast single-pass read, use the built-in code-review
  skill instead.
argument-hint: Optional — what to review (defaults to the branch diff vs main)
---

# Squad Review

Six lenses in parallel, each finding then attacked by a verifier that assumes it
is wrong until proven otherwise. The verification is the point: an unverified
fan-out produces six sections of plausible noise, and you stop reading it by the
third review.

## Run it

Resolve the script path, then hand it to the Workflow tool:

```bash
echo ${CLAUDE_PLUGIN_ROOT}/skills/squad-review/workflow.js
```

```
Workflow({
  scriptPath: "<the path printed above>",
  args: { scope: "<git command>", label: "<human description>" }
})
```

## Pick the scope yourself

Read the git state and choose — do not open a menu:

- On a feature branch with commits → `git diff main...HEAD` (the normal case)
- On main, or a branch with only uncommitted work → `git diff HEAD`
- Untracked files present and relevant → name them in `label` so reviewers read
  them in full; a diff won't show them
- Nothing to review → say so and stop, don't launch the workflow

Ask only when two scopes both have substantial content and you genuinely can't
tell which one the user means. If the user named a scope, use it.

## Report the result

The workflow returns findings already ranked and filtered. Present the survivors
grouped by severity, not by lens — the lens is metadata, not structure. Lead with
blockers. Give each finding its file:line, what breaks, and the fix direction.

State how many findings were refuted and why, in one line. That number is the
signal that verification happened; hiding it makes the review look like every
other review.

Do not re-rank or soften what the verifiers confirmed, and do not write the
report to a file unless asked.
