/**
 * wave-planner — pure orchestration logic for the ideation execution engine.
 *
 * No I/O, no agent calls, no Workflow-runtime dependency. These functions turn a
 * phase list with `prereqs` (arrays of phase TITLES) into execution waves and
 * resolve skip propagation. They are unit-tested with `node --test`
 * (wave-planner.test.mjs) and are also INLINED into execute-contract.mjs so the
 * Workflow script loads without relying on sandbox relative-import support.
 *
 * KEEP IN SYNC: if you change a function here, mirror it in execute-contract.mjs.
 *
 * @typedef {{ title: string, prereqs?: string[] }} PlannerPhase
 */

/**
 * Detect a cycle in the prereq graph.
 * @param {PlannerPhase[]} phases
 * @returns {string[] | null} the offending path (titles) if a cycle exists, else null
 */
export function detectCycle(phases) {
  const prereqsOf = new Map(phases.map(p => [p.title, p.prereqs ?? []]));
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map(phases.map(p => [p.title, WHITE]));
  const stack = [];

  /** @param {string} title */
  function visit(title) {
    color.set(title, GRAY);
    stack.push(title);
    for (const dep of prereqsOf.get(title) ?? []) {
      // Unknown prereqs are not this function's concern; computeWaves validates them.
      if (!color.has(dep)) continue;
      const c = color.get(dep);
      if (c === GRAY) {
        // Found a back-edge: return the cycle slice.
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

/**
 * Group phases into execution waves. A phase is ready when all its prereqs are
 * satisfied (either in `completed` or in an earlier wave). `completed` phases are
 * treated as satisfied but are never emitted into a wave (already done).
 *
 * @param {PlannerPhase[]} phases
 * @param {string[]} [completed] titles already finished (e.g. from git)
 * @returns {string[][]} waves, each an array of phase titles to dispatch
 * @throws if a prereq references an unknown title, or the graph has a cycle
 */
export function computeWaves(phases, completed = []) {
  if (phases.length === 0) return [];

  const titles = new Set(phases.map(p => p.title));

  // Validate prereq titles resolve.
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
  if (cycle) {
    throw new Error(`Dependency cycle detected: ${cycle.join(' → ')}`);
  }

  const satisfied = new Set(completed);
  const remaining = phases.filter(p => !satisfied.has(p.title));
  const waves = [];

  while (remaining.length > 0) {
    const ready = remaining.filter(p =>
      (p.prereqs ?? []).every(dep => satisfied.has(dep)),
    );
    if (ready.length === 0) {
      // Should be unreachable after cycle/unknown validation, but guard anyway.
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

/**
 * Given the set of failed-or-skipped titles, return every title that must be
 * skipped because it (transitively) depends on one of them. The failed titles
 * themselves are NOT included in the result.
 *
 * @param {PlannerPhase[]} phases
 * @param {Set<string>} failedOrSkipped
 * @returns {Set<string>} titles to skip
 */
export function propagateSkips(phases, failedOrSkipped) {
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
