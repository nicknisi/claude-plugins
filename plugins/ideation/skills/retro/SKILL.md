---
name: retro
description: "Mine a completed ideation project's implementation notes for generalizable spec-gap patterns and append them to a repo-level docs/ideation/learnings.md, so future interviews and specs learn from past gaps. Reads the project's implementation-notes-phase-*.html, contract.md, and git history; keeps only patterns that would change how future specs or interviews are written; dedupes against existing entries. Use when the user says 'retro', 'run a retro', 'what did we learn', or after an ideation project completes."
argument-hint: '[path/to/project-dir]'
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Ideation Retro — Mine Implementation Notes for Learnings

## Arguments: $ARGUMENTS

Close the ideation feedback loop. `execute-spec` writes
`implementation-notes-phase-{n}.html` for each phase — decisions made where the
spec was silent, wrong, or surprised by the codebase. Those notes are write-only
for humans; nothing in the pipeline learns from them. This skill mines a
completed project's notes for **generalizable spec-gap patterns** and appends
them to a repo-level `docs/ideation/learnings.md` that future interviews read at
intake.

**This is a suggestion, never automatic.** Notes may not exist (clean phases
delete their empty note files). A project with zero notes is a valid, expected
input — report "nothing logged, nothing to learn" and exit cleanly.

## Step 1: Locate the Project Directory

- If a path was provided in `$ARGUMENTS`, use it as the project directory.
- Otherwise, glob `./docs/ideation/*/` and pick the **most recently modified**
  directory that contains at least one `implementation-notes-phase-*.html`. If no
  directory has notes, report that there is nothing to retro and stop.

Confirm the chosen directory and its project name (the directory's basename) to
the user before proceeding.

## Step 2: Gather

Collect three sources from the project directory:

1. **Implementation notes** — read every `implementation-notes-phase-*.html` in
   the directory. Each note is a series of `<section class="note-entry">` cards
   with a `<h3>` title and a `<dl>` of Context / Decision / Alternative.
2. **Contract** — read `contract.md` (and `contract-data.json` if present) for the
   project's goals, scope boundaries, and slug.
3. **Git history** — run `git log --oneline --grep="<slug>"` to list the project's
   commits. Match on the **slug-qualified spec path**, not the bare
   `spec-phase-N.md` filename (which collides across projects). The commit
   subjects often name what each phase touched, which helps you judge whether a
   note's pattern is generalizable or project-specific.

**If there are zero note entries across all phases:** report
"No implementation notes logged for {project} — nothing to learn this round" and
stop. Writing nothing is a valid outcome.

## Step 3: Extract

For each note entry, read its Context / Decision / Alternative and classify it by
the existing note categories used in `execute-spec`:

- **spec gap** — the spec didn't address something; a judgment call was required
- **spec deviation** — an intentional divergence from the spec
- **tradeoff** — multiple valid approaches existed; one was chosen
- **codebase surprise** — existing code was in an unexpected state
- **dependency decision** — a dependency version/API/behavior differed from the spec's assumption

## Step 4: Generalize

This is the core filter. Keep **only** patterns that would change how a _future_
spec or interview is written. Discard project trivia.

- **Disqualifying (trivia — discard):** "we picked 3 retries", "the fixture used
  the scope/risk/effort keys", "we left two dead CSS rules in place." These are
  decisions local to one project; they teach nothing transferable.
- **Qualifying (pattern — keep):** "specs that touch test fixtures never declared
  the fixture in their File Changes table, which broke the engine's file-overlap
  serialization", or "every phase assumed the scout agent was registered, but the
  Agent tool was unavailable — specs should not assume optional infrastructure."
  These change how the next spec/interview should be written.

A useful test: would this pattern make you **ask a different interview question**
or **add a row to a future spec's File Changes table**? If not, it's trivia.

**If nothing generalizes**, say so and write nothing. A clean project that
followed its specs produces zero learnings, and that is correct.

## Step 5: Dedupe and Persist

Append qualifying patterns to `docs/ideation/learnings.md` (repo-level — the
sibling of the project directories, **not** per-project and **not** inside the
plugin directory; learnings are codebase-specific and the plugin dir shouldn't
accumulate user state).

1. **Read the existing `learnings.md` first** (if it exists). If it does not
   exist, create it with this header:

   ```markdown
   # Ideation Learnings

   Generalizable spec-gap and interview patterns mined from completed ideation
   projects by `/ideation:retro`. Intake reads this file so recurring gaps inform
   future questioning and spec generation. Each entry is dated and cites its
   evidence; treat entries as hints, never as a substitute for gate evidence.
   ```

2. **Dedupe**: for each qualifying pattern, scan existing entries. If the pattern
   matches one already recorded, do **not** add a duplicate — instead add an
   `_Also seen in {project} ({date})._` line under the existing entry. Only
   genuinely new patterns become new entries.

3. **Entry format** for a new pattern:

   ```markdown
   ## {YYYY-MM-DD} — {project-name}

   - **Pattern**: {one sentence}
     **Evidence**: {which phase / note title, brief}
     **Spec/interview implication**: {what to do differently next time}
   ```

   Use today's date (run `date +%Y-%m-%d` if unsure).

## Step 6: Report

Give a conversational summary:

- Which project was retro'd and how many note entries were scanned.
- How many patterns generalized vs. how many were trivia.
- The new entries added and any "also seen in" amendments made.
- If nothing generalized, say so plainly — that is a healthy result, not a failure.

Then point the user at the file: `cat docs/ideation/learnings.md`.

## Key Principles

1. **Write nothing rather than noise** — trivia pollution makes `learnings.md`
   something future sessions skim past. The generalization filter is the whole
   point; when in doubt, discard.
2. **Dedupe before append** — re-running retro on the same project must amend, not
   duplicate. Always read the existing file first.
3. **Zero notes is normal** — clean phases delete their empty note files. Handle a
   project with no notes by reporting and exiting, never by inventing patterns.
4. **Learnings are hints, not gates** — entries inform future questions; they never
   replace the evidence a gate requires. Codebases drift, so entries are dated.
5. **Markdown, not HTML** — `learnings.md` is a reference document read by future
   sessions, per the SKILL.md Markdown/HTML split.
