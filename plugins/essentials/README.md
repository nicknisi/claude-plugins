# Essentials

Agents and skills that earn their place in day-to-day Claude Code work.

## Installation

```bash
/plugin marketplace add nicknisi/claude-plugins
/plugin install essentials@nicknisi
```

## Agents

Dispatched via the Task tool, each in its own context window.

| Agent                                | What it does                                                                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `git-committer`                      | Semantic commits with pre-commit validation. Triggers proactively when you commit.                                           |
| `code-simplifier`                    | Refactors for readability without changing behavior. Preserves public APIs.                                                  |
| `security-auditor`                   | Invariant-binding analysis across trust boundaries. Critical/high findings only, with exploit flows. Explicit requests only. |
| `thermo-nuclear-code-quality-review` | Loads the thermo-nuclear rubric and applies it to a diff in an isolated context.                                             |

## Skills

| Skill                                | Use it when                                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brainstorming`                      | Weighing an idea, not committing to it — "should I do X", "am I over-engineering this". Hands off to `ideation` once you've decided to build.                       |
| `explain-diff`                       | You want a rich, shareable HTML explainer for a diff, PR, or branch — with diagrams and a quiz.                                                                     |
| `handoff`                            | Wrapping a session with unfinished work. Writes a portable doc the next session can pick up.                                                                        |
| `link-reader`                        | A twitter.com, x.com, or reddit.com URL needs reading — routes through proxy APIs that aren't blocked.                                                              |
| `prototype`                          | A design question needs answering in code before you commit to the real implementation.                                                                             |
| `socratic-tutor`                     | You want to actually own a change, not skim it. Drills you with quizzes until you can explain the problem, the solution, and the edge cases.                        |
| `squad-review`                       | A thorough review before merging. Six lenses, then every finding attacked by a verifier — only what survives reaches you.                                           |
| `thermo-nuclear-code-quality-review` | You explicitly want the harsh maintainability audit — abstraction quality, the 1k-line rule, code judo. Not for ordinary review; that's the built-in `code-review`. |

Three of these deliberately overlap and stay separate: the built-in `code-review` is the fast
single pass, `squad-review` is the slow verified one (12 agents), and `thermo-nuclear` is one harsh
maintainability lens. `explain-diff` writes an explainer to read or share; `socratic-tutor` quizzes
you live.

The `thermo-nuclear-code-quality-review` SKILL.md is the canonical rubric and the agent of the same
name loads it, so the rules live in exactly one place. Edit the rubric, not the agent.
`squad-review` reuses the `security-auditor` agent as its security lens for the same reason —
one security rubric, not two.

## Layout

```
essentials/
├── agents/*.md                  # frontmatter: name, description, tools, model
└── skills/<name>/
    ├── SKILL.md                 # frontmatter: name, description
    ├── scripts/                 # executables the skill shells out to
    └── references/              # loaded on demand, not upfront
```

Each component's own file is the source of truth for how it behaves — this README is only an
index. Skills that ship scripts treat the script's `--help` as the flag reference rather than
restating it in prose.
