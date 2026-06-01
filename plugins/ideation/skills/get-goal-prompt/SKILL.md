---
name: get-goal-prompt
description: "Generate a /goal command that runs an ideation project to completion UNATTENDED by driving /ideation:autopilot. The /goal is a durability wrapper — it keeps autopilot going across hours/sessions and recovers from failures, while autopilot's Workflow engine does the dependency-ordered dispatch. Reads the contract, builds the /goal, copies it to the clipboard, and prints it. Use when the user says 'goal', 'run as goal', 'goal prompt', or wants to run the project long-haul/unattended rather than watching /ideation:autopilot interactively."
argument-hint: '[path/to/contract.md]'
disable-model-invocation: true
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

# Generate /goal Command for Unattended Execution

## Arguments: $ARGUMENTS

Build a `/goal` command that runs an ideation project to completion **unattended** by
driving `/ideation:autopilot`, then copy it to the clipboard.

**The layered model:** `/ideation:autopilot` is the deterministic Workflow engine that
dispatches phases in dependency order. A `/goal` is an optional **durability wrapper**
around it — it keeps working across turns/hours/sessions and can _recover_ from a failed
phase (fix the spec, re-run) in ways the engine can't. So this `/goal` should **drive
autopilot**, not re-describe per-phase execution. One engine underneath; `/goal` just
makes the run durable and self-healing.

Reach for this over plain `/ideation:autopilot` when the user wants to start the project
and walk away (long-haul, multi-session). For a run they'll watch, plain
`/ideation:autopilot` is lighter.

## Step 1: Find the Contract

- If a path was provided in `$ARGUMENTS`, use it.
- Otherwise, glob for `./docs/ideation/*/contract.md` and pick the most recently modified.

Read `contract.md` (and the sibling `contract-data.json` if present) and extract:

1. **Project name** and the project directory from the contract path.
2. **Whether any phases are already committed** — run `git log --oneline --grep="<slug>"`
   (match the slug-qualified spec path, not the bare `spec-phase-N.md` filename, which
   collides across projects). This is only to tell the user where the run will resume
   from; autopilot itself re-derives this on each run.

If every phase is already committed, tell the user the project is complete and stop.

## Step 2: Build the Goal Prompt

The `/goal` drives autopilot to completion. Keep it short — autopilot + the specs hold
all the per-phase detail, so the `/goal` does **not** list per-phase steps.

```
/goal Drive the {project-name} ideation project to completion by running /ideation:autopilot.

1. Run /ideation:autopilot {contract-path}.
2. autopilot executes the specs in dependency order via its Workflow engine and returns a summary of completed / failed / skipped phases.
3. If any phases failed: read each failure, fix the spec or the implementation, then run /ideation:autopilot {contract-path} again — it automatically skips already-committed phases and resumes from what remains.
4. Repeat until autopilot reports every phase committed with passing validation and zero failed/skipped phases.

Done when: git log shows a commit referencing every phase's slug-qualified spec path, and a final /ideation:autopilot run reports nothing left to do. If the same phase fails 3 times without progress, stop and report which phase and why.
```

Fill in `{project-name}` and `{contract-path}`. If some phases are already committed,
add one line after the template: `Phases {titles} are already committed — autopilot will skip them.`

## Step 3: Output and Copy

1. Copy the full `/goal` command to the clipboard:

   ```bash
   echo '<goal command>' | pbcopy    # macOS
   ```

   On Linux, try `xclip -selection clipboard` or `xsel --clipboard`.

2. Print the command so the user can see what they're about to run:

   ```
   Copied to clipboard. Paste to start an unattended run:

   /goal Drive the {project-name} ideation project to completion ...
   ```

3. Remind the user:
   - "Make sure auto mode is enabled so tool calls don't block each turn (`/auto` if needed)."
   - "autopilot runs on the Workflow engine — make sure the Workflow feature is available in this Claude Code."

That's it. Once the command is on the clipboard, this skill's job is done. The `/goal`
wrapper drives `/ideation:autopilot`, which drives the Workflow engine.
