---
name: prototype
description: >-
  Build a throwaway prototype to answer a design question before committing to
  real implementation. Generates either a runnable terminal app (for state
  machines, data models, business logic) or several radically different UI
  variations on one route (for visual/layout decisions). Use when the user wants
  to prototype, spike, POC, sanity-check a data model, mock up a UI, explore
  design options, or says "prototype this", "spike this out", "let me play with
  it", "try a few designs", "sketch this in code", "I want to try something
  before building it for real", "quick and dirty version", or "validate this
  approach" — even if they don't use the word "prototype."
argument-hint: What question should the prototype answer?
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape.

If the user passed arguments, treat them as the question the prototype should answer.

## Pick a branch

Identify which question is being answered — from the user's prompt, the arguments, the surrounding code, or by asking if the user is around. The litmus test: **if the user could answer the question by looking at a screen, it's UI. If they'd need to push buttons and watch state change, it's logic.**

- **"Does this logic / state model feel right?"** → [LOGIC.md](LOGIC.md). Build a tiny interactive app that pushes the state machine through cases that are hard to reason about on paper.
- **"What should this look like?"** → [UI.md](UI.md). Generate several radically different UI variations on a single route, switchable via a URL search param and a floating bottom bar.

The two branches produce very different artifacts — getting this wrong wastes the whole prototype. If the question is genuinely ambiguous and the user isn't reachable, default to whichever branch better matches the surrounding code (a backend module → logic; a page or component → UI) and state the assumption at the top of the prototype.

## Scaffolder

Before writing boilerplate, run the bundled scaffolder to generate the repetitive parts (switcher component, TUI shell, variant stubs). Then fill in the interesting parts — the actual variants or the domain logic.

```bash
# UI prototype: generates PrototypeSwitcher + variant shells
npx tsx ${CLAUDE_PLUGIN_ROOT}/skills/prototype/scripts/scaffold.ts ui --variants 3 --framework next --outdir ./src/app/settings

# Logic prototype: generates portable logic module + TUI shell
npx tsx ${CLAUDE_PLUGIN_ROOT}/skills/prototype/scripts/scaffold.ts tui --name checkout-flow --outdir ./src/checkout
```

The scaffolder handles React UI (Next, React Router, Vite) and TypeScript TUI. For other UI frameworks, it creates the directory structure with React components — adapt them to your framework.

## Rules that apply to both

1. **Throwaway from day one, and clearly marked as such.** Locate the prototype code close to where it will actually be used (next to the module or page it's prototyping for) so context is obvious. Use a naming convention that makes it impossible to confuse with production code — prefix files or folders with `__prototype-` or put them in a `prototype/` subfolder next to the target module. For throwaway UI routes, obey whatever routing convention the project already uses; don't invent a new top-level structure.
2. **One command to run.** Whatever the project's existing task runner supports — `pnpm <name>`, `python <path>`, `bun <path>`, etc. The user must be able to start it without thinking.
3. **No persistence by default.** State lives in memory. Persistence is the thing the prototype is _checking_, not something it should depend on. If the question explicitly involves a database, hit a scratch DB or a local file with a clear "PROTOTYPE — wipe me" name.
4. **Skip the polish.** No error handling beyond what makes the prototype _runnable_, no abstractions. Don't build a test suite — if a single assertion would save you from a dumb mistake while iterating, that's fine, but if you're writing more than one you've left prototype territory. The point is to learn something fast and then delete it.
5. **Surface the state.** After every action (logic) or on every variant switch (UI), print or render the full relevant state so the user can see what changed.
6. **Delete or absorb when done.** When the prototype has answered its question, either delete it or fold the validated decision into the real code — don't leave it rotting in the repo.

## When done

The _answer_ is the only thing worth keeping from a prototype. Capture it somewhere durable (commit message, ADR, issue, or a `NOTES.md` next to the prototype) along with the question it was answering. If the user is around, that capture is a quick conversation; if not, leave the placeholder so they (or you, on the next pass) can fill in the verdict before deleting the prototype.
