# Ideation Plugin

Transform brain dumps into structured implementation artifacts: contracts and implementation specs. Includes execution workflow for implementing specs in fresh sessions with per-component feedback loops.

## Skills

### ideation

Transforms raw, unstructured brain dumps (dictated freestyle) into actionable implementation artifacts through a confidence-gated workflow.

Use this when you have messy ideas, scattered thoughts, or dictated stream-of-consciousness, or when you want to plan a feature, spec something out, or turn rough ideas into actionable specs.

**How to invoke:**

```
Use the ideation skill

[provide your brain dump - messy dictation, scattered thoughts, half-formed ideas]
```

Or simply start with your brain dump and mention you want to turn it into specs:

```
I want to build something. Here's what I'm thinking...

[your raw, unstructured thoughts]

...can you help me turn this into a spec?
```

**The workflow:**

1. **Intake** - Accept your messy, unstructured input without judgment
2. **Codebase exploration** - Understand existing code patterns, architecture, and conventions
3. **Confidence scoring** - Assess understanding across 5 dimensions (0-100)
4. **Clarifying questions** - If confidence <95%, ask targeted questions via `AskUserQuestion`
5. **Contract** - When ≥95% confident, write `contract.md` to `./docs/ideation/{project}/`
6. **Phasing & specs** - Determine phases, optionally generate PRDs, generate implementation specs with feedback loops
7. **Feedback quality check** - Self-review specs for feedback loop coverage before presenting
8. **Execution handoff** - Present orchestration strategy (sequential, parallel, or agent team)

**Output artifacts:**

All artifacts are written to `./docs/ideation/{project-name}/`:

```
contract.md                    # Problem, goals, success criteria, scope
prd-phase-1.md                 # Phase 1 requirements (only if PRDs chosen)
spec-phase-1.md                # Phase 1 implementation spec
spec-template-{pattern}.md     # Shared template for repeatable phases (if applicable)
spec-phase-N.md                # Per-phase delta or full spec
```

**Bundled references:**

- `contract-template.md` - Lean contract structure
- `prd-template.md` - Phased PRD template
- `spec-template.md` - Implementation spec template (includes feedback loop sections)
- `confidence-rubric.md` - Scoring criteria for confidence assessment and spec feedback quality
- `feedback-loop-guide.md` - Component-type mapping and design criteria for feedback loops

## Confidence Scoring

The skill scores your brain dump across 5 dimensions (20 points each):

| Dimension        | Question                                    |
| ---------------- | ------------------------------------------- |
| Problem Clarity  | Do I understand what problem we're solving? |
| Goal Definition  | Are the goals specific and measurable?      |
| Success Criteria | Can I write tests for "done"?               |
| Scope Boundaries | Do I know what's in and out of scope?       |
| Consistency      | Are there contradictions to resolve?        |

**Thresholds:**

- < 70: Major gaps - 5+ clarifying questions
- 70-84: Moderate gaps - 3-5 questions
- 85-94: Minor gaps - 1-2 questions
- ≥ 95: Ready to generate contract

Scoring is deliberately conservative — when uncertain between two levels, score lower. One extra question costs minutes; a bad contract costs hours.

## Feedback Loops

Specs now include per-component feedback loops so the executing agent validates its work *during* implementation, not just after.

Each spec defines a **Feedback Strategy** (top-level inner-loop command and playground type), and each iterative component gets:

- **Playground** - Environment to interact with (test suite, dev server, storybook, script harness)
- **Experiment** - Parameterized check with specific inputs and edge cases
- **Check command** - Fastest single validation, runs in seconds

Component types map to feedback mechanisms:

| Component Type | Feedback Mechanism |
| --- | --- |
| Data/logic layers | Test file |
| UI components | Dev server or Storybook |
| API endpoints | curl/httpie script |
| CLI tools | The tool itself |
| Config/types/constants | Skip (typecheck covers it) |

Trivial components (config, types, constants) correctly skip feedback loops. The spec quality is self-reviewed (Strong/Adequate/Weak) before presentation.

## Example

**Input (messy dictation):**

```
okay so i'm thinking about this feature where users can like save their
favorite items you know like bookmarking but also they should be able to
organize them into folders or something maybe tags actually tags might be
better because folders are too rigid and oh we should probably have a
search too...
```

**Process:**

1. Skill accepts input, explores codebase for existing patterns
2. Calculates ~55/100 confidence
3. Asks clarifying questions: "What type of items?", "Tags user-created or predefined?", etc.
4. User responds, confidence rises to 96/100
5. Generates `contract.md` for approval
6. After approval, asks: "Straight to specs or PRDs first?"
7. Generates implementation specs (with template+delta for repeatable phases)

**Result:** Clean, structured artifacts ready for implementation.

## Commands

### /execute-spec

Executes a spec file generated by the ideation skill. Explores relevant codebase patterns, reads the spec, creates tasks with dependencies, and implements step-by-step with validation.

**Usage:**

```bash
# Auto-detect next unblocked task from TaskList
/execute-spec

# Execute a specific spec
/execute-spec docs/ideation/my-project/spec-phase-1.md

# Parallel: spawn subagents for independent tasks
/execute-spec --parallel
```

**Why fresh sessions?**

- Ideation consumes significant context (contract, exploration, specs)
- Execution benefits from clean context focused solely on the spec
- Human review between phases catches issues early
- Each phase is independently committable

**The execution flow:**

1. Load and parse the spec file (and template if referenced)
2. Explore codebase — read existing patterns, modified files, analogous code
3. Set up feedback environment — detect/start test runner, dev server, or storybook
4. Create tasks from implementation details with dependency tracking
5. For each component: set up feedback loop → build incrementally → check → iterate
6. Run validation commands and report completion with acceptance criteria status

## Cross-Session Execution

**Recommended workflow:**

```bash
# Phase 1
/clear
/execute-spec         # auto-detects unblocked task
# ... implement, commit ...

# Phase 2
/clear
/execute-spec         # previous task completed, picks up next
# ... implement, commit ...
```

**For parallel execution across phases, use agent teams** — when 2+ phases are independent, the ideation handoff generates a ready-to-paste prompt for delegate mode. Start a new session, enter delegate mode (Shift+Tab), and paste the prompt. The lead spawns teammates with plan approval, each implementing their assigned spec in parallel.

Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` enabled in settings.

**Within a single phase, use `--parallel`:**

```bash
/execute-spec --parallel   # spawns subagents for independent components within the phase
```

## Installation

```bash
/plugin marketplace add nicknisi/claude-plugins
/plugin install ideation@nicknisi
```

## Version

0.6.0
