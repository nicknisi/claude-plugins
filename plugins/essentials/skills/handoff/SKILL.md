---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up. Use when the user says "hand this off", "wrap up", "save context", "continue later", "pass this to another session", "I need to stop here", "pick this up later", or when a session is ending with unfinished work. Also use when context is getting long and the user wants to start fresh without losing progress.
argument-hint: What will the next session be used for?
---

Write a handoff document that lets a fresh agent continue this work without re-deriving any context. Save it to a path produced by `f=$(mktemp "${TMPDIR:-/tmp}handoff-XXXXXXXX") && mv "$f" "$f.md" && echo "$f.md"` (read the file before you write to it).

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.

## What to capture

The goal is compression, not transcription. A good handoff is under 200 lines and gives the next agent everything it needs to start working immediately.

Include these sections (skip any that don't apply):

**Goal** — What the user is trying to accomplish, in one or two sentences. Include the "why" if it's not obvious from the task itself.

**Current state** — Where things stand right now: branch name, what's been built/changed, what works, what doesn't. Be specific — file paths, function names, test results.

**Decisions made** — Choices that were made during this session and their rationale. The next agent shouldn't re-litigate settled questions.

**What failed / dead ends** — Approaches that were tried and abandoned, and why. This prevents the next agent from repeating mistakes.

**Open questions / blockers** — Anything unresolved that needs the user's input or further investigation.

**Next steps** — Concrete actions for the next session, ordered by priority.

**Suggested skills** — Include a "suggested skills" section in the document, which suggests skills that the agent should invoke.

## What NOT to include

Do not duplicate content already captured in other artifacts — PRDs, plans, ADRs, issues, commits, diffs. Reference them by path or URL instead. The handoff supplements the commit history; it doesn't replace it.

Do not include verbatim code blocks unless they're critical context that isn't committed anywhere (e.g., a snippet the user pasted that informed a design choice).

Do not rehash the full conversation. Distill it.
