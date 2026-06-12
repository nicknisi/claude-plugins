---
name: ideation
description: "You MUST use this before building any new feature, planning a migration, designing a system, or turning scattered ideas into a plan. Triggers on: feature requests, project ideas, brain dumps, 'help me plan,' 'spec this out,' 'think through this,' 'interview me,' 'I want to build,' 'let's design,' or any unstructured idea that needs structure before code. Covers small single-spec projects through multi-phase initiatives. Runs a conversational interview, writes an interactive HTML contract, then generates implementation-ready Markdown specs. Skip ONLY for well-defined implementation tasks (writing code to a known spec, fixing bugs, refactoring, explaining code)."
---

<what-to-do>

# Ideation

Transform unstructured brain dumps into implementation artifacts through a conversational interview that builds shared understanding before writing anything. HTML is for interactive decision-making (visualizations, comparisons, the Mission Brief contract); Markdown is for reference documents (specs, PRDs).

## Workflow

```
INTAKE → INTERVIEW LOOP → CONTRACT.HTML → PHASING → SPEC.MD GENERATION → HANDOFF
              ↓                  ↓             ↓             ↓                ↓
         Accept the mess    One question    Mission       Repeatable?      Phase track
                            at a time,      Brief with      ↓              + copy buttons
                            explore code    gates +      Template +        in contract
                            + show HTML     scope        per-phase
                            examples        tiers        deltas
```

## Phases 1-2: Interview

Read and follow `${CLAUDE_PLUGIN_ROOT}/references/interview-engine.md` for the full intake and interview loop; complete every phase there before Phase 3. Read `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md` for the evidence-gate criteria.

## Phase 3: Contract (HTML)

When all 5 evidence gates are `ready` — **not before** — generate the Mission Brief contract:

1. `AskUserQuestion` to confirm the project name if not obvious; kebab-case it into the `slug`.
2. Create `./docs/ideation/{slug}/`.
3. **Write `contract-data.json`** there, conforming to the `ContractData` schema (the CLI renders HTML from it). It captures all interview findings:

   ```json
   {
     "projectName": "Human-Readable Name",
     "slug": "kebab-case-name",
     "date": "YYYY-MM-DD",
     "status": "Draft",
     "supersedes": null,
     "gates": {
       "dimensions": [
         {
           "key": "scope",
           "label": "Scope",
           "status": "ready",
           "evidence": "One sentence citing the artifact that makes this gate ready"
         },
         {
           "key": "risk",
           "label": "Risk",
           "status": "ready",
           "evidence": "One sentence"
         },
         {
           "key": "effort",
           "label": "Effort",
           "status": "ready",
           "evidence": "One sentence"
         },
         {
           "key": "clarity",
           "label": "Clarity",
           "status": "ready",
           "evidence": "One sentence"
         },
         {
           "key": "tests",
           "label": "Tests",
           "status": "not-ready",
           "evidence": "One sentence naming the gap that keeps this gate not-ready"
         }
       ]
     },
     "problem": ["paragraph 1", "paragraph 2"],
     "goals": ["Measurable goal 1", "Measurable goal 2"],
     "successCriteria": [
       {
         "criterion": "Pass/fail criterion",
         "check": "command that verifies it — expected outcome"
       },
       { "criterion": "Judgment-only criterion (no mechanical check exists)" }
     ],
     "scope": {
       "mvp": [{ "item": "Core feature", "reason": "Why it's MVP" }],
       "full": [{ "item": "Full feature", "reason": "Optional rationale" }],
       "stretch": [{ "item": "Stretch feature" }],
       "outOfScope": [{ "item": "Excluded item", "reason": "Why excluded" }],
       "future": ["Deferred idea 1"]
     },
     "execution": {
       "strategy": "Sequential",
       "phases": [
         {
           "title": "Phase name",
           "risk": "low",
           "blocking": true,
           "specPath": "docs/ideation/slug/spec-phase-1.md",
           "notes": "Brief description of what this phase covers"
         }
       ],
       "agentTeamPrompt": "only if 2+ phases parallelizable"
     }
   }
   ```

   Field semantics live in the `contract-gen.ts` types. Key contracts: each gate `dimension` has a `status` (`ready`/`not-ready`) and one-sentence `evidence` (the artifact making it ready, or the gap keeping it not-ready) — readiness is derived from the dimensions, no counts. Proceed only when all 5 are ready — record not-ready gates only when the user ends the interview early. **Success criteria carry their own verification**: give every criterion a `check` — a runnable command plus its expected outcome (`"npx vitest run src/auth — exits 0"`, `"curl -s localhost:3000/health — returns 200"`) — whenever it can be verified mechanically. Omit `check` only when verification is genuinely human judgment; the contract renders those with a visible "judgment call" tag, and the success-criteria critic challenges any omission where a command is plausible. Phase fields: `risk` (high/medium/low), `blocking`, `specPath`, `notes`; optional `kind` ("gate" for human checkpoints) and `prereqs` (array of phase titles). `status` stays `"Draft"` here — a Draft contract renders the phase track as a plan preview with no run commands; commands appear when Phase 5 flips it to `"Approved"`.

4. **Fan out the plan critics** (before rendering — fixing a blocker is a one-line JSON edit at this stage, not a regenerate loop). Issue all three `Agent` calls in one message so they run concurrently: `subagent_type: ideation:plan-critic`, prompt = per-invocation inputs only (`contract-data.json` path, project directory, and the **lens** — one of `scope-creep`, `hidden-dependency`, `success-criteria`); workflow/format/read-only `tools` come from the registered definition and are platform-enforced.

   Act on findings: each `blocker` → revise `contract-data.json` to resolve it (re-tier a scope item, add a phase prereq, rewrite a criterion); if a blocker exposes a genuine unknown rather than a fixable defect, return to the interview loop for that gate. Each `notable` → fold in if clearly right, else carry to the digest with a one-line dismissal. `nit` → digest mention only.

   **Failure tolerance:** a failed critic or an unregistered `ideation:plan-critic` (older Claude Code) → warn, proceed without that lens, note the gap in the digest. Critics amplify quality; never block the contract on a critic failure. **Run-once rule:** critics run exactly once per contract — re-run only if a revision changes goals or scope _fundamentally_, not for wording. The "Needs changes" approval loop does **not** re-trigger them.

5. **Run the generator** (it handles lineage — an existing `contract.html` is renamed to `contract-{date}.html` with the supersedes link set):

   ```bash
   npx tsx ${CLAUDE_PLUGIN_ROOT}/scripts/contract-gen.ts \
     --input ./docs/ideation/{slug}/contract-data.json \
     --output ./docs/ideation/{slug}/contract.html
   ```

   The generator is the **only** renderer for `contract.html`. There is no fallback template — never hand-write the contract HTML or "render it from a template" if the generator can't run. **If the command is denied by permissions** (common when the plugin root is outside the current repo — the classifier flags `npx tsx` on an out-of-repo script as untrusted code), do not work around the denial and do not hand-render — the denial message may say you "may attempt other tools to accomplish this goal"; for this step that does not apply, since any other tool means hand-authoring the contract. Instead show the user the exact command and ask them to run it themselves by typing `! npx tsx …` in the prompt, then continue once `contract.html` exists. Run the generator and `open` as **separate** Bash calls — never chained with `&&` — so a denial of one is visible and doesn't silently skip the other.

6. Open it: `open ./docs/ideation/{slug}/contract.html` (macOS) or `xdg-open` (Linux).
7. **Present the Critic digest**, then ask for approval. Only ask once `contract.html` was actually generated and opened — never ask the user to approve a contract they haven't seen. The digest is one line per lens: `found N (B blockers folded in, M notables, dismissed X — reasons)`; note any skipped lens; if all three returned SOUND, say so. Then `AskUserQuestion`:

   ```
   Question: "Does this contract capture your intent? Which scope tier should we target?"
   Options:
   - "Approved — Full scope (Recommended)" - Build MVP + Full tiers
   - "Approved — MVP scope" - Ship the minimum viable version first
   - "Approved — Stretch scope" - Include MVP + Full + Stretch tiers
   - "Needs changes" - Some parts need revision before approving
   - "Start over" - Fundamentally off track, re-interview
   ```

   The approved tier determines what goes into specs; items outside it move to "Future Considerations". **If not approved:** revise (fundamental misunderstanding → back to the interview loop; otherwise re-write the HTML and re-open), iterating until approved. **Do not proceed until explicitly approved.**

</what-to-do>

<supporting-info>

## Phase 4: Phasing & Specification

After approval, determine phases and generate Markdown specs. PRDs are optional.

### 4.1 Choose Workflow

`AskUserQuestion`:

```
Question: "How should we proceed from the contract?"
Options:
- "Straight to specs (Recommended)" — Contract defines what, specs define how. Faster.
- "PRDs then specs" — Adds a requirements layer for stakeholder alignment.
```

### 4.2 Determine Phases

Break scope into logical implementation phases.

**Small-project shortcut:** if the scope fits one phase (1-3 components, fewer than ~10 files), skip phasing — generate a single `spec.md` (no phase number) and go straight to handoff.

**Phasing criteria** (multi-phase): dependencies (build-order), risk (high-risk early), value delivery (benefit after each phase), complexity (balanced effort). Typical: Phase 1 core/infrastructure, Phase 2+ features/integrations, Phase N future considerations.

**Detect repeatable patterns:** 3+ phases with the same structure but different inputs (e.g., "add SDK support for {language}") change how specs are generated (see 4.4).

### 4.3 Generate PRDs (only if "PRDs then specs")

Read `references/prd-template.md`, then generate `prd-phase-{n}.md` per phase: overview/rationale, user stories, functional requirements (grouped), non-functional requirements, dependencies (prerequisites and outputs), acceptance criteria. Review via `AskUserQuestion`, iterating until approved:

```
Question: "Do these PRD phases look correct?"
Options:
- "Approved" - Phases and requirements look good, proceed to specs
- "Adjust phases" - Need to move features between phases
- "Missing requirements" - Some requirements are missing or unclear
- "Start over" - Need to revisit the contract
```

### 4.4 Generate Implementation Specs

Read `references/spec-template.md`, then generate specs **lazily** — only when a phase's details are resolved.

**Standard phases** (each unique): a full `spec-phase-{n}.md` with technical approach, feedback strategy (inner-loop command, playground, rationale), file changes (table with new/modified/deleted), implementation details (per-component, each with a playground → experiment → check-command loop), testing requirements (table), failure modes (table: component, failure, trigger, impact, mitigation), validation commands.

- **Reference existing code:** where the interview found relevant patterns, add "Pattern to follow: `path/to/file.ts`" to implementation details.
- **Feedback loops:** match the mechanism to the component — data layers use tests, UI uses a dev server, APIs use curl scripts, config/types skip loops. See `${CLAUDE_PLUGIN_ROOT}/references/feedback-loop-guide.md` for the full mapping.
- **Failure modes:** for each non-trivial component, name how it fails — data shadows (nil/empty/stale), edge cases (concurrency, oversized input, missing permissions). Trivial components (config, types, constants) skip this.

**Repeatable phases** (3+ share a structure): don't generate N near-identical specs. Generate one full template — `spec-template-{pattern-name}.md` with placeholders for the variable parts — plus lightweight `spec-phase-{n}.md` deltas containing only the phase-specific inputs, deviations from the template, phase-specific concerns, and a reference: "Follow `spec-template-{pattern-name}.md` with the inputs below".

### 4.5 Present Specs for Review

**First, self-review feedback-loop quality** against the Spec Feedback Quality checklist in `${CLAUDE_PLUGIN_ROOT}/references/confidence-rubric.md`: **Strong** (all iterative components have loops, inner-loop command defined, trivial ones skipped) → present as-is; **Adequate** (minor gaps) → present with a note; **Weak** (no Feedback Strategy, or complex components missing loops) → fix the gaps before presenting. Then `AskUserQuestion`, iterating until approved:

```
Question: "Do these specs look correct? (Review them in your browser)"
Options:
- "Approved" - Specs look good, proceed to execution handoff
- "Adjust approach" - Implementation strategy needs changes
- "Missing components" - Some files or steps are missing
- "Revisit phases" - Phase breakdown needs restructuring
```

## Phase 5: Execution Handoff

After specs are approved, update the contract with the execution plan and emit Markdown for `/ideation:execute-spec`.

### 5.1 Analyze Orchestration Strategy

Do **not** create tasks here — they are ephemeral and lost on a fresh session; each `/ideation:execute-spec` creates its own. Analyze the phase dependency graph: 2+ phases sharing a single blocker (e.g., all blocked only by Phase 1) are **parallelizable**; a linear chain is **sequential**; mixed graphs have both.

| Pattern                       | Recommendation                                                                |
| ----------------------------- | ----------------------------------------------------------------------------- |
| All phases sequential (chain) | **Sequential execution** — one session at a time                              |
| 2+ independent phases         | **Agent team** — lead orchestrates teammates in parallel                      |
| Mixed dependencies            | **Hybrid** — sequential for dependent chain, agent team for independent group |

### 5.2 Update Contract Data with Execution Plan

Update `contract-data.json` with the final plan and re-run `contract-gen.ts` so the contract is self-contained:

- **Status** — set `"status": "Approved"`. This is what unlocks the run UI: Draft contracts render the phase track as a plan preview with an "awaiting approval" note; Approved contracts render First Move, the autopilot bar, and per-phase copy commands.
- **Phase Track** — populate `execution.phases` (titles, risk, blockers, spec paths, notes, human gates); the CLI renders the risk-colored track.
- **Execution Commands** — the CLI renders copy buttons for `/ideation:autopilot` and each `/ideation:execute-spec`.
- **Agent Team Prompt** — set `execution.agentTeamPrompt` only if 2+ phases are parallelizable (CLI renders it in a collapsible section); **omit entirely** for sequential projects.

**Shared file detection:** before writing the agent team prompt, scan specs' "Modified Files". If multiple specs touch the same files, add a coordination note: "Coordinate on shared files ({list}) — only one teammate should modify a shared file at a time." **Batching:** more than 5 parallelizable phases → note starting with the highest-priority batch first. Re-open the regenerated contract.

### 5.3 Generate Contract Markdown

Generate `contract.md` from `references/contract-template.md` mirroring `contract.html` (including the Execution Plan) — needed for execute-spec lineage detection. Specs and PRDs are already Markdown.

### 5.4 Present Handoff Summary

Present a brief summary, then **recommend one entry point** — don't hand over an undifferentiated menu. Always include:

```
Ideation complete. Artifacts written to `./docs/ideation/{project-name}/`.
Open contract.html to review the full plan — phase track, scope, and the Mission Brief.
```

Then apply the decision rule:

- **Single phase:** recommend the one spec directly, no question:
  > Your next step: `/ideation:execute-spec docs/ideation/{project-name}/spec.md`
  > _(One phase — orchestration adds nothing.)_
- **Multi-phase:** ask exactly one question — whether they'll watch or walk away:

  ```
  Question: "How do you want to run this?"
  Options:
  - "Watch it run now (Recommended)" — /ideation:autopilot runs the phases on its Workflow engine while you watch.
  - "Start it and walk away" — get a /goal that drives autopilot to completion unattended, recovering from failures.
  - "I'll run phases myself" — run each /ideation:execute-spec manually.
  ```

  **Recommend by verifiability:** the unattended path can only trust what it can check. If most `successCriteria` carry a `check` command, keep "Watch it run now" or "Start it and walk away" as viable recommendations. If most criteria are judgment calls, do **not** recommend the walk-away option — say why in one line: a `/goal` run would complete phases nothing mechanical verified.

  Then echo the exact command for their choice:
  - Watch now → `/ideation:autopilot docs/ideation/{project-name}/contract.md`
  - Walk away → `run /ideation:get-goal-prompt docs/ideation/{project-name}/contract.md, then paste the /goal it copies`
  - Manually → the per-phase `/ideation:execute-spec` commands in dependency order

**The layered model** (state once if helpful): `/ideation:autopilot` is the deterministic Workflow **engine**; the `/goal` is a durability **wrapper** that drives it unattended; `/ideation:execute-spec` is the per-phase **unit** all of them call. Graph shape doesn't change which entry point to recommend — the engine handles parallelism internally — so route on phase count, attended-vs-unattended, and whether the contract's checks make unattended verification trustworthy.

</supporting-info>

## Output Artifacts

All written to `./docs/ideation/{project-name}/`:

```
_comparison.html                   # Ephemeral decision aid (deleted after choice is made)
contract.html                      # Mission Brief contract (for review)
contract.md                        # Plain contract (for execute-spec lineage)
prd-phase-1.md                     # Phase 1 requirements (only if PRDs chosen)
...
spec-phase-1.md                    # Implementation spec (for execute-spec)
spec-template-{pattern}.md         # Shared template for repeatable phases (if applicable)
spec-phase-{n}.md                  # Per-phase delta or full spec
...
```

## Bundled Resources

**Shared references** (plugin root):

- `interview-engine.md` — interview engine (Phases 1-2)
- `confidence-rubric.md` — evidence-gate criteria for readiness and spec feedback quality
- `feedback-loop-guide.md` — component-type mapping and design criteria for spec feedback loops
- `workflow-example.md` — end-to-end walkthrough

**Skill references** — HTML (interactive): `references/html-guide.md` (component library, design tokens, constraints — for ephemeral comparison artifacts only; `contract.html` comes exclusively from `scripts/contract-gen.ts`). Markdown: `references/contract-template.md`, `references/prd-template.md`, `references/spec-template.md`.

**Examples** (filled-in artifacts for a bookmark feature — reference for tone, structure, detail): `examples/contract-example.md`, `examples/prd-example.md`, `examples/spec-example.md`.

## Decision Aids: Previews First, HTML When Visual

During the interview and phasing, comparisons help the user decide. **Default to `AskUserQuestion` previews; escalate to ephemeral HTML only when the decision hinges on something a monospace preview can't show.**

`AskUserQuestion`'s per-option `preview` field renders side-by-side in a monospace box (markdown) — the default routing, since it keeps the decision inline with no file to write or clean up. Use it for ASCII layout mockups, code snippets (signature/config/schema per option), dependency-flow or phasing sketches, and compact pros/cons blocks. By stage: interview examples → ASCII mockups; architecture comparisons → structure + trade-offs per approach; phasing strategies → core-first vs. risk-first vs. value-first as dependency-flow sketches; orchestration strategy → sequential vs. parallel vs. hybrid as ASCII timelines.

**Constraints:** previews are **single-select only** — never combine with `multiSelect` (drop previews and rely on labels + descriptions, or escalate to HTML). Keep them **comparative** — a preview earns its place only when seeing options side-by-side changes the choice; otherwise skip it.

**Escalate to ephemeral HTML** only when a monospace box can't render the deciding factor: real visual design (color, typography, spacing), interactive behavior (sliders, toggles, hover), or side-by-side rendered (not sketched) artifacts. Workflow: write `_comparison.html` (prefix `_` marks it ephemeral) using `references/html-guide.md` components, show each option as a card/column (name, description, trade-offs, visual where apt), `open` it, ask via `AskUserQuestion` referencing the browser view, then delete it after the choice. Genuine visual mockups still use this path — the contract HTML does not; it comes only from the generator.

**When NOT to use a decision aid:** simple yes/no, choices where the recommended option is clearly best, or anything faster to explain in text.

## Important Notes

- **HTML is for interactive artifacts only** (contract, ephemeral visualizations); specs and PRDs are Markdown.
- **Read templates before writing:** `references/html-guide.md` before any ephemeral HTML, `references/spec-template.md` before specs. `contract.html` is generator output — never hand-written.
- **Use `AskUserQuestion` for all questions and approvals** — one at a time, with your recommended answer.
- **Judge gates conservatively** — when unsure the evidence is sufficient, the gate is not-ready. No fixed question limit.
- **Open HTML artifacts** after writing (`open` / `xdg-open`).
- **Create files lazily** — only when decisions are locked.
- **Small projects don't need phases** — 1-3 components → single spec. Template + delta for repeatable phases.
- **Specs must stand alone** — implementable without re-reading PRDs or the contract.
