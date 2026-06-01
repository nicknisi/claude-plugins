import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { computeWaves, propagateSkips } from '../../workflows/wave-planner.mjs';

/**
 * Deterministic proof that the fixture's dependency graph drives the engine the way
 * the fixture README claims — WITHOUT running autopilot or dispatching agents. Reads
 * the same contract-data.json the rebuilt autopilot would, and checks the planner's
 * waves + skip propagation. The live end-to-end run (which exercises the actual
 * Workflow runtime + execute-spec) is a separate, manually-triggered step documented
 * in README.md.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  readFileSync(join(__dirname, 'contract-data.json'), 'utf8'),
);
const phases = manifest.execution.phases; // { title, prereqs, ... }

const [P1, P2, P3, P4] = phases.map(p => p.title);

describe('orchestration fixture graph', () => {
  it('plans three waves: [P1] → [P2, P3] → [P4]', () => {
    const waves = computeWaves(phases);
    assert.deepEqual(waves[0], [P1]);
    assert.deepEqual(
      new Set(waves[1]),
      new Set([P2, P3]),
      'P2 and P3 share the parallel wave',
    );
    assert.deepEqual(waves[2], [P4]);
    assert.equal(waves.length, 3);
  });

  it('skips P4 (depends on failed P3) but not sibling P2', () => {
    const skips = propagateSkips(phases, new Set([P3]));
    assert.ok(skips.has(P4), 'P4 depends on the failed P3 → skipped');
    assert.ok(!skips.has(P2), 'P2 is a sibling, not a dependent → not skipped');
    assert.ok(!skips.has(P3), 'the failed phase itself is not in the skip set');
  });

  it('resumes: with P1 and P2 already committed, only P3/P4 remain to plan', () => {
    const waves = computeWaves(phases, [P1, P2]);
    assert.deepEqual(waves[0], [P3]);
    assert.deepEqual(waves[1], [P4]);
    assert.ok(
      !waves.flat().includes(P1) && !waves.flat().includes(P2),
      'committed phases are not re-planned',
    );
  });
});
