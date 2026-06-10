import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

/**
 * Smoke-test the execute-contract.mjs script BODY without the Workflow runtime
 * or real agent dispatch. We load the source, strip the module-level `meta`
 * export, wrap the remainder in an async function (as the runtime does so that
 * top-level await/return are legal), and inject stub globals. This exercises the
 * real wave loop + skip propagation + summarize integration — not just the
 * planner functions in isolation.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(
  join(__dirname, 'execute-contract.mjs'),
  'utf8',
).replace(/export\s+const\s+meta\s*=/, 'const meta =');

/** Compile the script body into a callable async function with injected globals. */
function loadScript() {
  const wrapped = `(async function(args, agent, parallel, phase, log){\n${SRC}\n})`;
  return new vm.Script(wrapped, {
    filename: 'execute-contract.mjs',
  }).runInThisContext();
}

/** Build args for the canonical diamond: P1 → {P2, P3} → P4 (P4 depends on P3). */
function diamondArgs(completedPhases = []) {
  return {
    projectName: 'Smoke',
    slug: 'smoke',
    projectDir: 'docs/ideation/smoke/',
    completedPhases,
    phases: [
      { title: 'P1', specPath: 'p1.md', prereqs: [], risk: 'low' },
      { title: 'P2', specPath: 'p2.md', prereqs: ['P1'], risk: 'low' },
      { title: 'P3', specPath: 'p3.md', prereqs: ['P1'], risk: 'low' },
      { title: 'P4', specPath: 'p4.md', prereqs: ['P3'], risk: 'low' },
    ],
  };
}

/**
 * Run the script with a stub agent. `failing` is a set of phase titles whose
 * agent returns FAIL. Records max concurrency observed inside parallel().
 */
async function run(args, failing = new Set()) {
  const run_ = loadScript();
  const dispatched = [];
  const waveSizes = [];

  const agent = async (prompt, opts) => {
    const title = opts.label.replace('phase:', '');
    dispatched.push(title);
    if (failing.has(title)) {
      return {
        result: 'FAIL',
        commitHash: null,
        summary: `forced failure: ${title}`,
        findings: ['boom'],
      };
    }
    return {
      result: 'PASS',
      commitHash: `sha-${title}`,
      summary: `built ${title}`,
      findings: [],
    };
  };
  // Mirror the runtime contract: parallel() awaits all thunks, returns array.
  const parallel = async thunks => {
    waveSizes.push(thunks.length);
    return Promise.all(thunks.map(t => t()));
  };
  const phase = () => {};
  const log = () => {};

  const summary = await run_(args, agent, parallel, phase, log);
  return { summary, dispatched, waveSizes };
}

describe('execute-contract script body', () => {
  it('all phases pass → everything completed in dependency order', async () => {
    const { summary, waveSizes } = await run(diamondArgs());
    assert.deepEqual(
      new Set(summary.completed),
      new Set(['P1', 'P2', 'P3', 'P4']),
    );
    assert.equal(summary.failed.length, 0);
    assert.equal(summary.skipped.length, 0);
    // Wave 2 dispatches P2 and P3 together → a parallel wave of size 2.
    assert.ok(
      waveSizes.includes(2),
      `expected a wave of size 2, saw ${waveSizes}`,
    );
  });

  it('a failed phase skips its dependents but not its siblings', async () => {
    const { summary, dispatched } = await run(diamondArgs(), new Set(['P3']));
    assert.deepEqual(new Set(summary.completed), new Set(['P1', 'P2']));
    assert.deepEqual(summary.failed, ['P3']);
    assert.deepEqual(summary.skipped, ['P4']);
    // P4 must never be dispatched to an agent — it was skipped.
    assert.ok(!dispatched.includes('P4'), 'P4 should not be dispatched');
  });

  it('completedPhases are excluded from dispatch (resume)', async () => {
    const { summary, dispatched } = await run(diamondArgs(['P1', 'P2']));
    assert.ok(
      !dispatched.includes('P1') && !dispatched.includes('P2'),
      'committed phases not re-dispatched',
    );
    assert.deepEqual(new Set(dispatched), new Set(['P3', 'P4']));
    assert.deepEqual(new Set(summary.completed), new Set(['P3', 'P4']));
  });

  it('a null agent result is treated as FAIL, not success', async () => {
    const run_ = loadScript();
    const agent = async () => null; // simulate skipped/errored agent
    const parallel = async thunks => Promise.all(thunks.map(t => t()));
    const args = {
      projectName: 'Null',
      slug: 'null',
      projectDir: 'd/',
      completedPhases: [],
      phases: [{ title: 'Only', specPath: 'o.md', prereqs: [] }],
    };
    const summary = await run_(
      args,
      agent,
      parallel,
      () => {},
      () => {},
    );
    assert.deepEqual(summary.failed, ['Only']);
    assert.equal(summary.completed.length, 0);
  });

  it('serializes two same-wave phases that share a declared file', async () => {
    // P2 and P3 are both ready after P1 (same prereq wave) and both touch foo.ts.
    // The overlap split must dispatch them in separate waves, not together.
    const args = {
      projectName: 'Overlap',
      slug: 'overlap',
      projectDir: 'd/',
      completedPhases: [],
      phases: [
        { title: 'P1', specPath: 'p1.md', prereqs: [], files: ['p1.ts'] },
        {
          title: 'P2',
          specPath: 'p2.md',
          prereqs: ['P1'],
          files: ['foo.ts'],
        },
        {
          title: 'P3',
          specPath: 'p3.md',
          prereqs: ['P1'],
          files: ['foo.ts'],
        },
      ],
    };
    const { summary, waveSizes } = await run(args);
    assert.deepEqual(new Set(summary.completed), new Set(['P1', 'P2', 'P3']));
    // No parallel wave of size > 1 — every wave is a single phase.
    assert.ok(
      waveSizes.every(n => n === 1),
      `expected all single-phase waves, saw ${waveSizes}`,
    );
  });

  it('does NOT serialize same-wave phases with disjoint files', async () => {
    // Same shape as above, but P2/P3 touch different files → stay parallel.
    const args = {
      projectName: 'Disjoint',
      slug: 'disjoint',
      projectDir: 'd/',
      completedPhases: [],
      phases: [
        { title: 'P1', specPath: 'p1.md', prereqs: [], files: ['p1.ts'] },
        { title: 'P2', specPath: 'p2.md', prereqs: ['P1'], files: ['a.ts'] },
        { title: 'P3', specPath: 'p3.md', prereqs: ['P1'], files: ['b.ts'] },
      ],
    };
    const { waveSizes } = await run(args);
    assert.ok(
      waveSizes.includes(2),
      `expected P2+P3 to share a wave of size 2, saw ${waveSizes}`,
    );
  });

  it('manifests without files behave identically to before (regression guard)', async () => {
    // The canonical diamond has no `files` → the overlap split is identity.
    const { summary, waveSizes } = await run(diamondArgs());
    assert.deepEqual(
      new Set(summary.completed),
      new Set(['P1', 'P2', 'P3', 'P4']),
    );
    assert.ok(
      waveSizes.includes(2),
      `expected the file-less diamond to keep its size-2 wave, saw ${waveSizes}`,
    );
  });

  it('empty phases → empty summary, no dispatch', async () => {
    const run_ = loadScript();
    let called = false;
    const agent = async () => (
      (called = true),
      { result: 'PASS', summary: '' }
    );
    const summary = await run_(
      {
        projectName: 'E',
        slug: 'e',
        projectDir: 'd/',
        phases: [],
        completedPhases: [],
      },
      agent,
      async t => Promise.all(t.map(x => x())),
      () => {},
      () => {},
    );
    assert.deepEqual(summary, {
      completed: [],
      failed: [],
      skipped: [],
      results: [],
    });
    assert.equal(called, false);
  });
});
