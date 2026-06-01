import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { computeWaves, detectCycle, propagateSkips } from './wave-planner.mjs';

/**
 * Helper: build a phase list from a {title: [prereqs]} map.
 * Only `title` and `prereqs` matter to the planner.
 */
function graph(map) {
  return Object.entries(map).map(([title, prereqs]) => ({ title, prereqs }));
}

describe('computeWaves', () => {
  it('returns no waves for an empty graph (smoke test)', () => {
    assert.deepEqual(computeWaves([]), []);
  });

  it('orders a linear chain into single-phase waves', () => {
    const phases = graph({ A: [], B: ['A'], C: ['B'], D: ['C'] });
    assert.deepEqual(computeWaves(phases), [['A'], ['B'], ['C'], ['D']]);
  });

  it('groups the middle of a diamond into one parallel wave', () => {
    // A -> {B, C} -> D   (D depends on both B and C)
    const phases = graph({ A: [], B: ['A'], C: ['A'], D: ['B', 'C'] });
    const waves = computeWaves(phases);
    assert.deepEqual(waves[0], ['A']);
    assert.deepEqual(new Set(waves[1]), new Set(['B', 'C']));
    assert.deepEqual(waves[2], ['D']);
    assert.equal(waves.length, 3);
  });

  it('puts fully independent phases in a single wave', () => {
    const phases = graph({ A: [], B: [], C: [], D: [] });
    const [wave, ...rest] = computeWaves(phases);
    assert.deepEqual(new Set(wave), new Set(['A', 'B', 'C', 'D']));
    assert.equal(rest.length, 0);
  });

  it('seeds satisfied prereqs from `completed` and excludes them from dispatch', () => {
    const phases = graph({ A: [], B: ['A'], C: ['A'], D: ['B', 'C'] });
    const waves = computeWaves(phases, ['A']);
    assert.deepEqual(new Set(waves[0]), new Set(['B', 'C']));
    assert.deepEqual(waves[1], ['D']);
    assert.equal(waves.length, 2);
    // A must never appear — it is already done.
    assert.ok(!waves.flat().includes('A'));
  });

  it('throws on a cycle', () => {
    const phases = graph({ A: ['B'], B: ['A'] });
    assert.throws(() => computeWaves(phases), /cycle/i);
  });

  it('throws on an unknown prereq title', () => {
    const phases = graph({ A: [], B: ['Nonexistent'] });
    assert.throws(() => computeWaves(phases), /unknown|unresolved|prereq/i);
  });
});

describe('propagateSkips', () => {
  it('returns an empty set when nothing failed', () => {
    const phases = graph({ A: [], B: ['A'] });
    assert.equal(propagateSkips(phases, new Set()).size, 0);
  });

  it('skips transitive dependents of a failed phase but not siblings', () => {
    // A -> {B, C} -> D (D depends on B and C). B fails.
    const phases = graph({ A: [], B: ['A'], C: ['A'], D: ['B', 'C'] });
    const skips = propagateSkips(phases, new Set(['B']));
    assert.ok(skips.has('D'), 'D depends on failed B → skipped');
    assert.ok(!skips.has('C'), 'C depends only on A → not skipped');
    assert.ok(
      !skips.has('B'),
      'the failed phase itself is not in the skip set',
    );
    assert.ok(!skips.has('A'));
  });

  it('propagates skips through a chain', () => {
    // A fails; B->A, C->B  =>  both B and C skip.
    const phases = graph({ A: [], B: ['A'], C: ['B'] });
    const skips = propagateSkips(phases, new Set(['A']));
    assert.deepEqual(new Set(skips), new Set(['B', 'C']));
  });
});

describe('detectCycle', () => {
  it('returns null for an acyclic graph', () => {
    const phases = graph({ A: [], B: ['A'], C: ['B'] });
    assert.equal(detectCycle(phases), null);
  });

  it('returns a cycle path when one exists', () => {
    const phases = graph({ A: ['C'], B: ['A'], C: ['B'] });
    const cycle = detectCycle(phases);
    assert.ok(
      Array.isArray(cycle) && cycle.length > 0,
      'returns the offending path',
    );
  });
});
