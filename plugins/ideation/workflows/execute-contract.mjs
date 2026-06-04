export const meta = {
  name: 'execute-contract',
  description:
    'Execute an approved ideation contract: dispatch phases in dependency-ordered waves, run everything reachable, return a structured summary',
  phases: [{ title: 'Execute', detail: 'dependency-ordered phase waves' }],
};

/*
 * execute-contract — the deterministic phase-orchestration engine for ideation.
 *
 * Invoked by the /ideation:autopilot skill via the Workflow tool. The skill does
 * the things this sandboxed script CANNOT: it reads contract-data.json, runs the
 * git-log skip pre-pass, and owns interactive failure-gating + resume. This script
 * receives everything as `args`, plans topological waves, dispatches each phase as
 * a fresh-context subagent running /ideation:execute-spec --headless, and returns
 * { completed, failed, skipped, results } for the skill to act on.
 *
 * Design choices:
 *  - parallel() per wave (not pipeline): skip propagation needs the WHOLE prior
 *    wave's outcome before the next wave is planned. The runtime concurrency cap
 *    (min(16, cores-2)) throttles within a wave.
 *  - Run everything still reachable; a failure only skips its dependents. The
 *    skill, not the engine, decides what to do about failures. This makes the
 *    engine safe to wrap in an unattended /goal.
 *  - Results are schema-validated, killing the old `RESULT: PASS` string-parsing.
 *
 * args: {
 *   projectName: string,
 *   slug: string,
 *   projectDir: string,
 *   phases: [{ title, specPath, prereqs: [titles], risk }],
 *   completedPhases?: [titles]   // already committed; excluded from dispatch
 * }
 *
 * KEEP IN SYNC: the three planner functions below are mirrored from
 * plugins/ideation/workflows/wave-planner.mjs (the unit-tested source of truth).
 * They are inlined here so the script loads without relying on the Workflow
 * sandbox supporting relative imports.
 */

// ---------------------------------------------------------------------------
// Inlined planner logic (mirror of wave-planner.mjs)
// ---------------------------------------------------------------------------

function detectCycle(phases) {
  const prereqsOf = new Map(phases.map(p => [p.title, p.prereqs ?? []]));
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map(phases.map(p => [p.title, WHITE]));
  const stack = [];

  function visit(title) {
    color.set(title, GRAY);
    stack.push(title);
    for (const dep of prereqsOf.get(title) ?? []) {
      if (!color.has(dep)) continue;
      const c = color.get(dep);
      if (c === GRAY) {
        const start = stack.indexOf(dep);
        return stack.slice(start).concat(dep);
      }
      if (c === WHITE) {
        const found = visit(dep);
        if (found) return found;
      }
    }
    stack.pop();
    color.set(title, BLACK);
    return null;
  }

  for (const p of phases) {
    if (color.get(p.title) === WHITE) {
      const found = visit(p.title);
      if (found) return found;
    }
  }
  return null;
}

function computeWaves(phases, completed = []) {
  if (phases.length === 0) return [];
  const titles = new Set(phases.map(p => p.title));
  for (const p of phases) {
    for (const dep of p.prereqs ?? []) {
      if (!titles.has(dep) && !completed.includes(dep)) {
        throw new Error(
          `Unknown prereq "${dep}" referenced by phase "${p.title}" — no phase has that title.`,
        );
      }
    }
  }
  const cycle = detectCycle(phases);
  if (cycle) throw new Error(`Dependency cycle detected: ${cycle.join(' → ')}`);

  const satisfied = new Set(completed);
  const remaining = phases.filter(p => !satisfied.has(p.title));
  const waves = [];
  while (remaining.length > 0) {
    const ready = remaining.filter(p =>
      (p.prereqs ?? []).every(dep => satisfied.has(dep)),
    );
    if (ready.length === 0) {
      throw new Error(
        `Cannot resolve execution order — no phase is ready. Remaining: ${remaining
          .map(p => p.title)
          .join(', ')}`,
      );
    }
    waves.push(ready.map(p => p.title));
    for (const p of ready) satisfied.add(p.title);
    for (const p of ready) remaining.splice(remaining.indexOf(p), 1);
  }
  return waves;
}

function propagateSkips(phases, failedOrSkipped) {
  const skip = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of phases) {
      if (skip.has(p.title) || failedOrSkipped.has(p.title)) continue;
      const blocked = (p.prereqs ?? []).some(
        dep => failedOrSkipped.has(dep) || skip.has(dep),
      );
      if (blocked) {
        skip.add(p.title);
        changed = true;
      }
    }
  }
  return skip;
}

// ---------------------------------------------------------------------------
// Phase dispatch
// ---------------------------------------------------------------------------

const PHASE_RESULT_SCHEMA = {
  type: 'object',
  required: ['result', 'summary'],
  additionalProperties: true,
  properties: {
    result: { enum: ['PASS', 'FAIL'] },
    commitHash: { type: ['string', 'null'] },
    summary: { type: 'string' },
    findings: { type: 'array', items: { type: 'string' } },
  },
};

function buildPhasePrompt(phase, a) {
  return `You are executing one phase of the "${a.projectName}" ideation project.

Run the execute-spec skill in headless mode against this phase's spec:

    /ideation:execute-spec --headless ${phase.specPath}

Follow that skill's full workflow: Scout → Build → Verify-Review-Fix → Commit.
The --headless flag auto-proceeds through confirmation steps so execution does
not block. Commit only when validations pass and the review cycle passes (or
escalates per the skill's rules).

This phase: "${phase.title}"${phase.risk ? ` (risk: ${phase.risk})` : ''}.

When finished, return a JSON object (the StructuredOutput tool will be provided):
  - result:     "PASS" if the phase committed with passing validation, else "FAIL"
  - commitHash: the commit SHA if you committed, else null
  - summary:    one or two sentences on what was implemented or why it failed
  - findings:   array of any unresolved review findings (empty array if none)

Do NOT ask the user anything — the orchestrator handles failure gates. If the
review cycle fails after 3 cycles, return result "FAIL" with the findings.`;
}

function summarize(results) {
  const completed = results.filter(r => r.result === 'PASS').map(r => r.title);
  const failed = results.filter(r => r.result === 'FAIL').map(r => r.title);
  const skipped = results.filter(r => r.result === 'SKIPPED').map(r => r.title);
  return { completed, failed, skipped, results };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// Defensive: some Workflow runtimes deliver `args` as a JSON string rather than
// a parsed object. Normalize so `a.phases` resolves either way.
const a =
  typeof args === 'string'
    ? (() => {
        try {
          return JSON.parse(args);
        } catch {
          return {};
        }
      })()
    : (args ?? {});
log(
  `args received as ${typeof args}; phases=${
    Array.isArray(a?.phases) ? a.phases.length : 'none'
  }`,
);

const phases = a?.phases ?? [];
if (phases.length === 0) {
  log('No phases supplied in args — nothing to execute.');
  return summarize([]);
}

const byTitle = new Map(phases.map(p => [p.title, p]));
const waves = computeWaves(phases, a.completedPhases ?? []);
log(
  `Planned ${waves.length} wave(s) for ${a.projectName}: ${waves
    .map((w, i) => `W${i + 1}[${w.join(', ')}]`)
    .join(' → ')}`,
);
if ((a.completedPhases ?? []).length > 0) {
  log(`Skipping already-committed: ${a.completedPhases.join(', ')}`);
}

const failedOrSkipped = new Set();
const results = [];
let waveNum = 0;

for (const wave of waves) {
  waveNum++;
  const phaseLabel = `Wave ${waveNum}`;
  phase(phaseLabel);

  const skips = propagateSkips(phases, failedOrSkipped);
  const toRun = wave.filter(t => !skips.has(t));

  for (const t of wave) {
    if (skips.has(t)) {
      results.push({
        title: t,
        result: 'SKIPPED',
        summary: 'blocked by an upstream failure',
      });
      failedOrSkipped.add(t);
      log(`SKIP ${t} — blocked by upstream failure`);
    }
  }

  if (toRun.length === 0) continue;

  const waveResults = await parallel(
    toRun.map(title => () => {
      const p = byTitle.get(title);
      return agent(buildPhasePrompt(p, a), {
        label: `phase:${title}`,
        phase: phaseLabel,
        agentType: 'general-purpose',
        schema: PHASE_RESULT_SCHEMA,
      }).then(r => ({
        title,
        // Null = the agent was skipped mid-run or errored. Never treat as success.
        ...(r ?? { result: 'FAIL', summary: 'agent returned no result' }),
      }));
    }),
  );

  for (const r of waveResults) {
    results.push(r);
    if (r.result !== 'PASS') failedOrSkipped.add(r.title);
    log(`${r.result} ${r.title}${r.commitHash ? ` (${r.commitHash})` : ''}`);
  }
}

const summary = summarize(results);
log(
  `Done: ${summary.completed.length} completed, ${summary.failed.length} failed, ${summary.skipped.length} skipped.`,
);
return summary;
