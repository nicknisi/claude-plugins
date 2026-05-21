# Essentials Plugin

Essential agents, commands, and tools for enhanced Claude Code workflows.

## Overview

The Essentials plugin provides foundational capabilities that improve how you work with Claude Code. It includes specialized agents for common development tasks and skills for deep thinking, reading blocked URLs, simplifying code, creating PRs, auditing code for security vulnerabilities, running repo-wide quality sweeps, codebase orientation, and throwaway prototyping.

## What's Included

### Agents

#### 🎯 Git Committer Agent

Create semantic commits with proper formatting and pre-commit hook handling.

**When to use:**

- Creating well-structured commit messages
- Following semantic commit conventions
- Handling pre-commit hook failures
- Running verification checks before commits

**Features:**

- Semantic commit message format (`feat:`, `fix:`, `refactor:`, etc.)
- Automatic staging of related files
- Pre-commit hook failure handling
- Linting and type checking before commits
- 50-character subject line enforcement
- Detailed body text explaining the "why"

**Example commit:**

```
feat(auth): add OAuth2 integration with Google

Implemented Google OAuth2 authentication flow to allow users
to sign in with their Google accounts. This includes:
- OAuth2 configuration and middleware setup
- User profile synchronization
- Session management with JWT tokens

Closes #123
```

#### 🧹 Code Simplifier Agent

Refactor code to improve readability, reduce complexity, and enhance maintainability without altering functionality.

**When to use:**

- Simplifying complex logic with nested conditionals
- Removing code redundancy
- Improving naming conventions
- Extracting methods from large functions
- Removing AI-generated "slop" patterns

**Features:**

- Preserves all public APIs and external behavior
- Reduces complexity through early returns and simpler conditionals
- Eliminates redundant code and applies DRY principles
- Improves naming to reveal intent
- Removes unnecessary defensive checks and type workarounds
- Extracts smaller, focused methods from large functions
- Removes dead code and clarifies logic flow

**What it removes:**

- Extra comments inconsistent with codebase style
- Excessive try/catch blocks in trusted codepaths
- Type casts to `any` that work around issues
- Style inconsistencies within files

**Example:**

```
You: "This function is hard to read, can you simplify it?"
Claude: *code-simplifier agent refactors while preserving behavior*
```

#### 🔒 Security Auditor Agent

Deep vulnerability audits using invariant-binding analysis across trust boundaries. Runs in an isolated subagent context so the multi-phase methodology stays out of your main conversation and unbiased by prior discussion.

**When to use:**

- Explicit security audit requests (e.g., "audit this for IDOR")
- Pre-release vulnerability assessment
- Targeted review of specific vulnerability classes (auth bypass, injection, access control)
- NOT for general code review — only dedicated security analysis

**Features:**

- Six-phase methodology: context building → threat model → hypotheses → testing → validation → output
- Invariant-binding analysis across bindings like credential ↔ tenant ↔ actor ↔ resource ↔ action ↔ time
- Detection heuristics for auth/authz, IDOR, injection, trust boundaries, race conditions
- High severity bar — reports only confirmed critical/high findings with exploit flows
- Can spawn sub-subagents for unbiased validation
- Targets the branch diff by default (`git diff main...HEAD`) or a scope you pass in

**Example:**

```
You: "Run a security audit on the billing API changes"
Claude: *security-auditor agent runs multi-phase audit, returns exploit flows for any confirmed findings*
```

### Skills

#### `/essentials:link-reader` - Read Blocked URLs

Read content from URLs that block direct web fetching (Twitter/X, Reddit) by routing through proxy APIs.

**Auto-triggers** when you share a `twitter.com`, `x.com`, or `reddit.com` URL.

**Supported platforms:**

- **Twitter/X** — Tweets, threads, articles (long-form posts), media
- **Reddit** — Posts with top comments

**Examples:**

```
You: "Read this tweet https://x.com/someone/status/123456"
Claude: *fetches via proxy, formats tweet with engagement stats*

You: "https://reddit.com/r/programming/comments/abc123/cool_post"
Claude: *fetches post and top 5 comments*
```

#### `/essentials:ultrathink` - Deep Thinking Mode

Engage deep thinking mode for complex problems that require excellence-driven problem-solving.

**Philosophy:**
Inspired by Steve Jobs' approach to product development - question every assumption, plan meticulously, craft elegant solutions, and iterate relentlessly toward perfection.

**When to use:**

- Complex architectural decisions
- Novel problems requiring creative solutions
- When the first solution isn't good enough
- Situations demanding elegance and simplicity

**What it does:**

1. **Think Different** - Question assumptions, explore alternatives
2. **Obsess Over Details** - Study the codebase deeply, understand patterns
3. **Plan Like Da Vinci** - Create clear, well-reasoned architecture
4. **Craft, Don't Code** - Write elegant, well-named, graceful code
5. **Iterate Relentlessly** - Test, refine, improve until insanely great
6. **Simplify Ruthlessly** - Remove complexity without losing power

**Example:**

```bash
/essentials:ultrathink Design a plugin system for this application
```

#### `/essentials:de-slopify` - Remove AI Code Slop

Remove AI-generated code slop from your current branch by comparing against a base branch.

**When to use:**

- After AI-assisted coding sessions
- Before code review
- When code feels over-engineered or inconsistent

**What it removes:**

- Unnecessary comments that a human wouldn't add
- Excessive defensive checks or try/catch blocks
- Type casts to `any` that work around issues
- Style inconsistencies with the rest of the file

**Example:**

```bash
/essentials:de-slopify main
```

#### `/essentials:codebase-cleanup` - Full Codebase Quality Sweep

Dispatch eight subagents to deep-clean an entire codebase across multiple quality axes. This is the repo-wide nuclear option — not for single files or branch diffs (use `de-slopify` for that).

**When to use:**

- Repo-wide quality audits before a major release
- Comprehensive cleanup of an inherited or AI-generated codebase
- "Deep clean the whole repo" requests

**Do not use for:**

- Single-file fixes — use `code-simplifier` agent
- Branch-scoped diffs — use `de-slopify`
- Targeted refactors

**Eight subagents, two phases:**

Phase 1 (parallel): deduplication, type consolidation, weak type elimination, defensive code pruning, deprecated/legacy removal, AI slop removal.

Phase 2 (after Phase 1 commits): dead code removal via `knip`, circular dependency resolution via `madge`.

**Safety rails:**

- Creates a `cleanup/<date>` branch before starting
- Verifies tests pass before dispatch — aborts if already broken
- Per-subagent commits with test-suite run after each
- Auto-reverts any subagent whose changes break tests
- `disable-model-invocation: true` — requires explicit user intent

**Output:** Per-subagent file/line counts, reverted subagents with test failures, and low-confidence findings flagged for human review.

**Example:**

```
You: "Run a full codebase audit on this repo"
Claude: *dispatches Phase 1 subagents in parallel, commits and tests each, then Phase 2*
```

#### `/essentials:pr` - Create Pull Request

Create a pull request with a structured template.

**When to use:**

- Ready to open a PR for your branch
- Want consistent PR formatting

**Features:**

- Auto-creates feature branch (`nicknisi/${feature}`) if on `main`
- Enforces concise titles (< 72 chars)
- Structured body template

**Template includes:**

- Summary (1-3 bullets on what changed)
- Why (context for the change)
- Notes (optional reviewer info)

**Process:**

1. Analyzes `git status` and `git log` for branch changes
2. Drafts title and body following template
3. Creates PR via `gh pr create`
4. Returns PR URL

**Example:**

```bash
/essentials:pr
```

#### `/essentials:squad-review` - Parallel Multi-Reviewer Code Review

Dispatch six independent reviewers in parallel — **Security, Correctness, Conventions, Test Coverage, Architecture, Project Alignment** — and merge their findings into one categorized markdown report. A local sibling to the paid `/ultrareview`.

**When to use:**

- Pre-PR review of your branch diff
- Pre-merge gut-check across multiple quality axes at once
- You want more than one specialist looking at the change

**Scope detection:**

1. Feature branch with commits vs `main` → reviews `git diff main...HEAD`
2. On `main` (or default branch) with uncommitted work → prompts you to pick tracked / untracked / both
3. Nothing pending → responds `No changes to review.`

**What each reviewer does:**

- **Security** — invariant-binding analysis, critical/high only, exploit flow required
- **Correctness** — real bugs, silent failure hunt; no style comments
- **Conventions** — must cite a CLAUDE.md rule or 3+ in-repo examples per finding
- **Test Coverage** — mutation-testing stance ("would the test fail if the impl regressed?")
- **Architecture** — shape only (layering, coupling, types, blast radius)
- **Project Alignment** — duplication / near-reimplementation hunt with file:line prior-art citations

**Why a skill instead of a single agent:**

Six specialists in parallel cover more ground than one generalist, and an agent can't inline-override another named agent's prompt. `disable-model-invocation: true` — explicit invocation only.

**Example:**

```bash
/essentials:squad-review
```

#### `/essentials:handoff` - Session Handoff Document

Compact the current conversation into a handoff document so a fresh agent can continue the work without re-deriving context.

**When to use:**

- Ending a session with unfinished work
- Context window getting long and you want to start fresh
- Passing work to another person or session

**What it captures:**

- Goal, current state (branch, files, test status)
- Decisions made and their rationale
- Dead ends and failed approaches (prevents the next agent from repeating mistakes)
- Open questions and blockers
- Prioritized next steps
- Suggested skills for the next session

**What it avoids:**

- Duplicating artifacts already in commits, PRDs, plans, or issues — references them by path instead
- Verbatim code blocks unless they're critical uncommitted context
- Full conversation rehash — distills, doesn't transcribe

**Example:**

```bash
/essentials:handoff finish the paragraph-level detection
```

#### `/essentials:zoom-out` - Codebase Orientation Map

Go up a layer of abstraction and map the surrounding architecture when you're unfamiliar with an area of code.

**When to use:**

- You're looking at unfamiliar code and need the big picture
- You want to understand how a file or module connects to the rest of the system
- You need to know what calls something, or what it depends on

**What it produces:**

1. **One-sentence orientation** — what this module is and why it exists
2. **Ancestry** — the call chain or module hierarchy 2-3 levels up
3. **Sibling map** — peer modules at the same abstraction level
4. **Key connections** — inbound callers and outbound dependencies
5. **Domain vocabulary** — the 3-5 most important domain terms in context

**What it doesn't do:**

- No line-by-line code explanation
- No refactoring suggestions — orientation only
- No guessing — it reads the code first

**Example:**

```bash
/essentials:zoom-out
```

#### `/essentials:prototype` - Throwaway Prototype Builder

Build throwaway code that answers a design question before committing to real implementation. Routes between two branches based on what kind of question you're asking.

**When to use:**

- Spiking out a state machine or data model before building it for real
- Exploring several radically different UI layouts before picking one
- Validating an API surface or business logic flow
- Any time you'd say "let me try something before committing"

**Two branches:**

- **Logic** — builds a tiny interactive app (TUI or localhost page) that lets you drive a state model by hand. The logic module is portable and liftable into production; the interactive shell gets deleted.
- **UI** — generates 3+ structurally different UI variants on a single route, switchable via a floating bottom bar and `?variant=` URL param. Pick a winner, steal parts from others, delete the rest.

**Features:**

- Auto-routes to the right branch based on the question type
- Accepts arguments: `/essentials:prototype the checkout flow state machine`
- Locates prototype code next to the module it's prototyping
- One command to run — wired into the project's existing task runner
- Captures the answer (the only durable output) before cleanup

**Example:**

```bash
/essentials:prototype what should the settings page look like
```

#### `/essentials:security-audit` - Dispatch Security Auditor

Explicit entry point for the security-auditor agent. User-invocable only — does not auto-trigger, so ambiguous phrasing won't kick it off unintentionally.

**When to use:**

- You want a deep vulnerability audit of the current branch diff
- Pre-merge or pre-release hardening pass
- You explicitly want THIS plugin's auditor rather than the built-in `/security-review`

**What it does:**

1. Pre-gathers branch context (`git diff --stat`, commit list, PR metadata via `gh pr view` if open)
2. Dispatches the `security-auditor` agent with that context pre-loaded
3. Returns the agent's Phase 6 output verbatim — confirmed critical/high findings with exploit flows

**Why a skill wrapper on top of the agent:**

The agent auto-triggers on phrases like "do a security audit." The skill is the opposite — an explicit, user-only trigger for when you want to be certain the audit runs, with scope already assembled. Thin wrapper; all methodology stays in the agent.

**Example:**

```bash
/essentials:security-audit
```

## Installation

Add this marketplace to Claude Code:

```bash
/plugin marketplace add nicknisi/claude-plugins
```

Then install the essentials plugin:

```bash
/plugin install essentials@nicknisi
```

## Usage Examples

### Read Tweets and Reddit Posts

```
You: "Check out this tweet https://x.com/ryancarson/status/2034019206908547568"
Claude: *fetches and formats the tweet content with engagement stats*
```

### Create Semantic Commits

```
You: "Commit these changes"
Claude: *git-committer agent analyzes changes, stages files, creates semantic message*
```

### Deep Problem Solving

```
You: "/essentials:ultrathink How should we architect this microservices system?"
Claude: *engages ultrathink mode, questions assumptions, crafts elegant solution*
```

## Keywords

`git`, `commit`, `ultrathink`, `workflow`, `agents`, `link-reader`, `twitter`, `reddit`, `pr`, `review`, `simplify`, `de-slopify`, `codebase-cleanup`, `cleanup`, `code-quality`, `security`, `audit`, `vulnerability`, `squad-review`, `parallel-review`, `multi-agent`, `handoff`, `context`, `session`, `zoom-out`, `orientation`, `architecture`, `prototype`, `spike`, `poc`, `proof-of-concept`

## Technical Details

### Agent Configuration

All agents are defined in markdown files with frontmatter:

```markdown
---
name: agent-name
description: Agent description
tools: Read, Write, Bash
model: sonnet
---

Agent prompt and instructions...
```

### Skill Configuration

Skills are defined as `SKILL.md` files in named directories under `skills/`:

```markdown
---
description: Skill description
disable-model-invocation: true
---

Skill prompt and instructions...
```

### File Structure

## Philosophy

- The Essentials plugin embodies several key principles:
- **Proactive Intelligence** - Agents activate automatically when needed, not just when explicitly requested.
- **Workflow Enhancement** - Every component improves how you work, reducing friction and improving outcomes.
- **Excellence-Driven** - Ultrathink mode encourages craftsmanship over quick fixes.
- **Semantic History** - Git commits tell the story of your project's evolution.

## Contributing

This plugin is part of a personal marketplace but contributions are welcome. See the main repository README for contribution guidelines.

## License

MIT
