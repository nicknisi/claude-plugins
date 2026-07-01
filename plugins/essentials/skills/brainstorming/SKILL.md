---
name: brainstorming
description: Use when you want to think through or pressure-test an idea BEFORE committing to build it — "should I do X", "help me decide between X and Y", "what am I missing", "is this worth it", "am I over-engineering this". A lightweight thinking partner that surfaces hidden assumptions and pushes back on over-engineering, entirely in conversation — it writes no files and produces no spec. This is the deciding-WHETHER stage, not the planning-HOW stage: the moment you decide to build, want a spec, or say "plan this", "spec this out", or "I want to build X", use the ideation skill instead and hand off to it. Do not use for writing code to a known spec, bug fixes, or refactors.
---

# Brainstorming

A lightweight thinking partner for the stage *before* you commit to building something — pressure-test a decision, explore a problem, or figure out whether an idea is even worth doing. It runs entirely in conversation and produces no files. The moment the answer is "yes, build it," hand off to `ideation`, which runs the real interview and owns the spec.

## When to use

- "Should I do X, or Y?" / "Help me decide…" / "What am I missing here?"
- "Talk me through whether this is worth building."
- "Is this over-engineered?" / "Am I overthinking this?"
- Any half-formed idea you want to *think about* before turning it into a plan.

## When NOT to use — go straight to `ideation`

- You've already decided to build it and want a plan, spec, or phased execution.
- "Spec this out", "plan this migration", "I want to build X" → that's `ideation`'s front door.
- You're writing code to a known spec, fixing a bug, or refactoring → no design skill needed.

This skill writes **no files** and produces **no spec**. If you catch yourself wanting to capture the outcome as an artifact, that's the signal to switch to `ideation` — don't reinvent its interview here.

## How to run the conversation

Two reflexes, applied in dialogue — not as paperwork. (Their rigorous, artifact-producing form lives in `ideation`; here they stay conversational and cheap.)

### Surface the silent assumptions

A vague ask ("add export", "make it faster") hides forks. Before you start solving, name what the request *could* mean and let the user pick — otherwise you'll confidently solve the wrong problem:

> "Export could mean: all users vs. a filtered set; on-demand vs. scheduled; JSON vs. CSV. Which matters most to pin down first?"

One fork at a time, in conversation. No formatted templates — that's ideation's job.

### Resist over-engineering

When the user reaches for an elaborate solution, ask whether the minimum would do. The test: *would a senior engineer call this overcomplicated?* If 200 lines could be 50, say so. Don't entertain abstractions, configurability, or error handling for impossible cases that nobody asked for. When the simple version genuinely won't hold, name the concrete trigger that would justify more ("this earns its keep once you're past ~10k rows").

### Take positions

You're a thinking partner, not a stenographer. If a premise is weak, say why. Skip "that could work" and "there are many ways to think about this" — pick one and defend it. (Same stance as `ideation`'s interview; the difference is you're deciding *whether*, not planning *how*.)

## Deliverable

A shared conclusion stated in chat: the decision, the key assumptions it rests on, and what's explicitly out. A few sentences — not a document.

## Handoff

When the conclusion is "yes, build this," stop and point at ideation:

> "Sounds like you're ready to build it. Run `/ideation` — it'll interview you into a spec. Bring what we just settled as the starting point so it's not from scratch."

ideation will still run its own interview (its gates need evidence in their own form); our conclusion just gives it a running start.
