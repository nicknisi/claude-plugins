---
name: zoom-out
description: >-
  Go up a layer of abstraction and map the surrounding architecture. Use when
  the user is unfamiliar with an area of code, asks "how does this fit in",
  "what calls this", "give me the big picture", "where am I", "map this out",
  "I'm lost", "explain this area", or needs to understand how a file, module,
  or function connects to the rest of the system. Also use when the user says
  /zoom-out or "zoom out" mid-conversation — even without a specific file
  reference, orient them based on whatever code is currently in context.
disable-model-invocation: true
---

# Zoom Out

The user needs a map, not a tour. They're disoriented in the codebase and want to understand how the thing they're looking at connects to everything around it.

## What to produce

Build a **context map** anchored on whatever code is currently in focus (the file being discussed, the function just edited, or the module the user asked about). The map should answer: *what is this, what does it talk to, and why does it exist?*

### Structure

1. **One-sentence orientation** — What this module/file *is* in plain terms and why it exists in the system.

2. **Ancestry** — Walk up the call chain or module hierarchy. Who owns this? What triggers it? Show the path from entrypoint to here, 2-3 levels up max.

3. **Sibling map** — What are the peer modules at this same level of abstraction? List them with one-line descriptions. This answers "what else lives here?"

4. **Key connections** — Inbound callers and outbound dependencies. Not every import — just the ones that matter for understanding the module's role. Use arrows or a simple ASCII diagram if it helps.

5. **Domain vocabulary** — If this area uses domain-specific terms (e.g., "tenant", "workspace", "pipeline stage"), define the 3-5 most important ones in the context of this codebase, not generic definitions.

## How to research

- Read the current file and its imports
- Check the parent directory's structure (`ls` the containing folder)
- Grep for usages of the main exports to find callers
- Glance at sibling files to understand the neighborhood
- Read any local README or CLAUDE.md for domain context

## What NOT to do

- Don't explain implementation details or line-by-line code
- Don't suggest changes or refactors — this is orientation, not a code review
- Don't produce a wall of text — keep the map scannable
- Don't guess at architecture if you haven't read the code — investigate first
