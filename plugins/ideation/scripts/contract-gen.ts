import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(join(__dirname, 'contract-gen.css'), 'utf8');

// --- Types ---

interface ScopeItem {
  item: string;
  reason?: string;
}

interface GateDimension {
  key: string;
  label: string;
  status: 'ready' | 'not-ready';
  evidence: string;
}

interface Phase {
  title: string;
  risk?: 'high' | 'medium' | 'low';
  blocking?: boolean;
  kind?: 'gate' | 'phase';
  prereqs?: string[];
  specPath?: string;
  notes?: string;
}

interface SuccessCriterion {
  criterion: string;
  /** Runnable command + expected outcome that verifies the criterion; absent = human judgment */
  check?: string;
}

interface ContractData {
  projectName: string;
  slug: string;
  date: string;
  status: 'Draft' | 'Approved';
  /** When the contract was approved (distinct from creation date) */
  approvedOn?: string;
  /** Who approved it */
  approvedBy?: string;
  supersedes: string | null;
  gates: {
    /** Legacy fields, ignored — readiness is derived from dimensions */
    passed?: number;
    total?: number;
    dimensions: GateDimension[];
  };
  problem: string[];
  goals: string[];
  successCriteria: Array<string | SuccessCriterion>;
  scope: {
    mvp: ScopeItem[];
    full: ScopeItem[];
    stretch: ScopeItem[];
    outOfScope: ScopeItem[];
    future: string[];
  };
  execution: {
    strategy: string;
    phases: Phase[];
    agentTeamPrompt?: string;
  };
}

// --- Helpers ---

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function riskMeta(risk: string): { color: string; label: string } {
  switch (risk) {
    case 'high':
      return { color: 'var(--danger)', label: 'high' };
    case 'medium':
      return { color: 'var(--caution)', label: 'med' };
    default:
      return { color: 'var(--go)', label: 'low' };
  }
}

function asCriterion(c: string | SuccessCriterion): SuccessCriterion {
  return typeof c === 'string' ? { criterion: c } : c;
}

function phaseCommand(phase: Phase, slug: string, index: number): string {
  if (phase.kind === 'gate')
    return `# Review: ${phase.specPath ?? phase.title}`;
  if (phase.specPath) return `/ideation:execute-spec ${phase.specPath}`;
  return `/ideation:execute-spec docs/ideation/${slug}/spec-phase-${index + 1}.md`;
}

function cmdField(id: string, cmd: string, wide = false): string {
  return `<div class="cmd-field${wide ? ' cmd-field-wide' : ''}">
            <span class="cmd-field-text" id="${id}">${esc(cmd)}</span>
            <button type="button" class="copy-btn" data-copy="${id}">copy</button>
          </div>`;
}

function sectionHdr(title: string, count?: string): string {
  return `      <div class="section-hdr">
        <span class="label">${esc(title)}</span>
        <span class="section-hdr-rule"></span>${
          count
            ? `\n        <span class="section-count">${esc(count)}</span>`
            : ''
        }
      </div>`;
}

// --- Pipeline DAG ---

/** Wave (column) per phase: longest prereq chain depth.
    When no phase declares prereqs, the plan is an implicit sequential chain. */
function computeWaves(phases: Phase[]): number[] {
  const anyPrereqs = phases.some(p => p.prereqs && p.prereqs.length > 0);
  if (!anyPrereqs) return phases.map((_, i) => i);

  const byTitle = new Map(phases.map((p, i) => [p.title, i] as const));
  const depth: number[] = new Array(phases.length).fill(-1);
  const visit = (i: number, stack: Set<number>): number => {
    if (depth[i] >= 0) return depth[i];
    if (stack.has(i)) return 0; // cycle guard: treat as root
    stack.add(i);
    const prereqIdx = (phases[i].prereqs ?? [])
      .map(t => byTitle.get(t))
      .filter((x): x is number => x !== undefined);
    depth[i] = prereqIdx.length
      ? 1 + Math.max(...prereqIdx.map(j => visit(j, stack)))
      : 0;
    stack.delete(i);
    return depth[i];
  };
  phases.forEach((_, i) => visit(i, new Set()));
  return depth;
}

const NODE_W = 200;
const NODE_H = 64;
const GAP_X = 64;
const GAP_Y = 16;
const PAD = 6;

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function buildPipeline(phases: Phase[], waves: number[]): string {
  const waveCount = Math.max(...waves) + 1;
  const rows: number[] = phases
    .map((_, i) => waves.slice(0, i).filter(w => w === waves[i]))
    .map(arr => arr.length);
  const maxRows = Math.max(...phases.map((_, i) => rows[i])) + 1;

  const x = (i: number) => PAD + waves[i] * (NODE_W + GAP_X);
  const y = (i: number) => PAD + rows[i] * (NODE_H + GAP_Y);
  const width = PAD * 2 + waveCount * NODE_W + (waveCount - 1) * GAP_X;
  const height = PAD * 2 + maxRows * NODE_H + (maxRows - 1) * GAP_Y;

  const byTitle = new Map(phases.map((p, i) => [p.title, i] as const));
  const anyPrereqs = phases.some(p => p.prereqs && p.prereqs.length > 0);
  const edges: Array<[number, number]> = [];
  if (anyPrereqs) {
    phases.forEach((p, i) => {
      for (const t of p.prereqs ?? []) {
        const j = byTitle.get(t);
        if (j !== undefined) edges.push([j, i]);
      }
    });
  } else {
    for (let i = 1; i < phases.length; i++) edges.push([i - 1, i]);
  }

  const edgePaths = edges
    .map(([from, to]) => {
      const x1 = x(from) + NODE_W;
      const y1 = y(from) + NODE_H / 2;
      const x2 = x(to) - 7; // leave room for the arrowhead
      const y2 = y(to) + NODE_H / 2;
      const mid = x1 + (x(to) - x1) / 2;
      const d =
        y1 === y2
          ? `M ${x1} ${y1} H ${x2}`
          : `M ${x1} ${y1} H ${mid} V ${y2} H ${x2}`;
      return `      <path class="edge" d="${d}" marker-end="url(#arrow)" />`;
    })
    .join('\n');

  const nodes = phases
    .map((p, i) => {
      const rm = riskMeta(p.risk ?? 'low');
      const nx = x(i);
      const ny = y(i);
      const isGate = p.kind === 'gate';
      return `      <g class="node${isGate ? ' node-gate' : ''}">
        <rect class="node-box" x="${nx}" y="${ny}" width="${NODE_W}" height="${NODE_H}" rx="5" />
        <line class="node-rail" x1="${nx + 1}" y1="${ny + 1.5}" x2="${nx + NODE_W - 1}" y2="${ny + 1.5}" stroke="${rm.color}" />
        <text class="node-num" x="${nx + 12}" y="${ny + 22}">${pad2(i + 1)}</text>
        <text class="node-kind" x="${nx + NODE_W - 12}" y="${ny + 22}" text-anchor="end" fill="${rm.color}">${rm.label}</text>
        <text class="node-title" x="${nx + 12}" y="${ny + 41}">${esc(truncate(p.title, 26))}</text>
        <text class="node-kind" x="${nx + 12}" y="${ny + 56}">${isGate ? 'gate' : 'phase'}${p.blocking ? ' · blocking' : ''}</text>
      </g>`;
    })
    .join('\n');

  const waveLabel = anyPrereqs
    ? `${waveCount} wave${waveCount === 1 ? '' : 's'}`
    : 'sequential';
  return `      <div class="panel pipeline-wrap">
        <svg class="pipeline" viewBox="0 0 ${width} ${height}" role="img" aria-label="Phase pipeline: ${esc(
          phases
            .map((p, i) => `${pad2(i + 1)} ${p.title} (wave ${waves[i] + 1})`)
            .join('; '),
        )} — ${waveLabel}">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path class="edge-head" d="M0,0 L10,5 L0,10 z" />
            </marker>
          </defs>
${edgePaths}
${nodes}
        </svg>
      </div>`;
}

// --- Section Builders ---

function buildHeader(d: ContractData): string {
  const dims = d.gates.dimensions;
  const open = dims.filter(dim => dim.status !== 'ready');
  const allReady = open.length === 0;
  const verdict = allReady
    ? 'All gates ready'
    : `${open.length} gate${open.length === 1 ? '' : 's'} open — interview ended early`;
  const statusClass = d.status === 'Approved' ? 'status-go' : 'status-caution';
  return `
    <header class="deck-header">
      <div class="deck-id">
        <div>
          <div class="deck-slug label">mission brief · ${esc(d.slug)}</div>
          <h1 class="deck-title">${esc(d.projectName)}</h1>
        </div>
        <div class="deck-meta">
          <span class="status-ind ${statusClass}"><span class="status-dot" aria-hidden="true"></span>${esc(d.status)}</span>
          <span class="mono-meta">created ${esc(d.date)}</span>
          ${d.approvedOn ? `<span class="mono-meta">approved ${esc(d.approvedOn)}${d.approvedBy ? ` · ${esc(d.approvedBy)}` : ''}</span>` : ''}
          ${d.supersedes ? `<span class="mono-meta">supersedes ${esc(d.supersedes)}</span>` : ''}
          <button type="button" class="theme-toggle" id="theme-toggle">theme · auto</button>
        </div>
      </div>

      <div class="gate-verdict">
        <span class="label">Readiness gates</span>
        <span class="status-ind ${allReady ? 'status-go' : 'status-caution'}">${esc(verdict)}</span>
      </div>
      <div class="gate-strip">
${dims
  .map(
    dim => `        <div class="gate-cell">
          <span class="gate-mark" style="color: ${dim.status === 'ready' ? 'var(--go)' : 'var(--caution)'}">${dim.status === 'ready' ? '✓' : '✗'}</span>
          <span class="gate-name">${esc(dim.label)}</span>
          <span class="gate-evidence">${esc(dim.evidence)}</span>
        </div>`,
  )
  .join('\n')}
      </div>
    </header>`;
}

function buildFirstMove(d: ContractData): string {
  const phase = d.execution.phases[0];
  if (!phase || d.status === 'Draft') return '';
  const cmd = phaseCommand(phase, d.slug, 0);
  return `
    <section class="run-bar">
      <div>
        <div class="label label-accent">First move</div>
        <div class="run-bar-headline">Run this.</div>
        <div class="run-bar-desc">Phase 01 of ${pad2(d.execution.phases.length)} — <strong>${esc(phase.title)}</strong></div>
      </div>
      ${cmdField('cmd-first', cmd)}
    </section>`;
}

function buildProblemGoals(d: ContractData): string {
  return `
    <div class="section two-col">
      <section>
${sectionHdr('The problem')}
        <div class="prose">
${d.problem
  .map(
    (p, i) =>
      `          <p><span class="line-num">${pad2(i + 1)}</span>${esc(p)}</p>`,
  )
  .join('\n')}
        </div>
      </section>
      <section>
${sectionHdr('Goals', `×${d.goals.length}`)}
        <div class="goal-list">
${d.goals
  .map(
    (g, i) => `          <div class="goal-row">
            <span class="goal-num">${pad2(i + 1)}</span>
            <span class="goal-text">${esc(g)}</span>
          </div>`,
  )
  .join('\n')}
        </div>
      </section>
    </div>`;
}

function buildSuccess(d: ContractData): string {
  const criteria = d.successCriteria.map(asCriterion);
  const checked = criteria.filter(c => c.check).length;
  const countLabel =
    checked === criteria.length
      ? `${criteria.length} signals · all mechanically checked`
      : `${criteria.length} signals · ${checked} mechanically checked`;
  return `
    <section class="section">
${sectionHdr('Done when', countLabel)}
      <ul class="criteria-grid">
${criteria
  .map(
    (c, i) => `        <li class="criteria-item">
          <span class="line-num">${pad2(i + 1)}</span>
          <div class="criteria-body">
            <span>${esc(c.criterion)}</span>
            ${
              c.check
                ? `<code class="criteria-check">${esc(c.check)}</code>`
                : `<span class="criteria-judgment">judgment call — no mechanical check</span>`
            }
          </div>
        </li>`,
  )
  .join('\n')}
      </ul>
    </section>`;
}

function buildScope(d: ContractData): string {
  const tierList = (title: string, items: ScopeItem[]) => {
    if (!items.length) return '';
    return `
          <div class="tier-group">
            <div class="tier-header">
              <span class="tier-title">${esc(title)}</span>
              <span class="tier-rule"></span>
              <span class="tier-count">×${items.length}</span>
            </div>
            <ul class="tier-items">
${items
  .map(
    it =>
      `              <li><strong>${esc(it.item)}</strong>${it.reason ? `<span class="tier-reason">— ${esc(it.reason)}</span>` : ''}</li>`,
  )
  .join('\n')}
            </ul>
          </div>`;
  };

  return `
    <section class="section">
${sectionHdr('Scope', 'MVP nests inside Full nests inside Stretch')}
      <div class="scope-layout">
        <div class="nested-tiers" aria-hidden="true">
          <div class="tier-box tier-box-stretch"><span class="tier-box-label">Stretch ×${d.scope.stretch.length}</span></div>
          <div class="tier-box tier-box-full"><span class="tier-box-label">Full ×${d.scope.full.length}</span></div>
          <div class="tier-box tier-box-mvp"><span class="tier-box-label">MVP ×${d.scope.mvp.length}</span></div>
        </div>
        <div class="tier-lists">
${tierList('MVP — must ship', d.scope.mvp)}
${tierList('Full — target outcome', d.scope.full)}
${tierList('Stretch — if time permits', d.scope.stretch)}
        </div>
      </div>

      <div class="two-col scope-extras">
        <div class="scope-panel scope-panel-out">
          <span class="label label-danger">Out of scope — said no on purpose</span>
          <ul class="scope-list">
${d.scope.outOfScope
  .map(
    it =>
      `            <li><span class="scope-out-item">${esc(it.item)}</span>${it.reason ? ` — ${esc(it.reason)}` : ''}</li>`,
  )
  .join('\n')}
          </ul>
        </div>
        <div class="scope-panel">
          <span class="label">Future — someday, maybe</span>
          <ul class="scope-list">
${d.scope.future.map(f => `            <li>${esc(f)}</li>`).join('\n')}
          </ul>
        </div>
      </div>
    </section>`;
}

function buildExecution(d: ContractData): string {
  const phases = d.execution.phases;
  const isDraft = d.status === 'Draft';

  if (!phases.length) {
    return `
    <section class="section">
${sectionHdr(isDraft ? 'Plan' : 'Execution', d.execution.strategy)}
      <p class="plan-placeholder">Phases are decided after approval.</p>
    </section>`;
  }

  const waves = computeWaves(phases);
  const pipeline = buildPipeline(phases, waves);

  const table = `      <div class="panel">
        <table class="phase-table">
          <thead>
            <tr>
              <th scope="col">##</th>
              <th scope="col">Phase</th>
              <th scope="col">Kind</th>
              <th scope="col">Risk</th>
              <th scope="col" class="phase-notes-col">Notes</th>
            </tr>
          </thead>
          <tbody>
${phases
  .map((p, i) => {
    const rm = riskMeta(p.risk ?? 'low');
    return `            <tr>
              <td class="phase-num">${pad2(i + 1)}</td>
              <td class="phase-title">${esc(p.title)}</td>
              <td class="phase-kind">${p.kind === 'gate' ? 'gate' : 'phase'}${p.blocking ? ' · blocking' : ''}</td>
              <td class="phase-risk" style="color: ${rm.color}">${rm.label}</td>
              <td class="phase-notes phase-notes-col">${p.notes ? esc(p.notes) : '—'}</td>
            </tr>`;
  })
  .join('\n')}
          </tbody>
        </table>
      </div>`;

  if (isDraft) {
    return `
    <section class="section">
${sectionHdr('Plan', d.execution.strategy)}
${pipeline}
${table}

      <div class="approval-bar">
        <span class="status-ind status-caution"><span class="status-dot" aria-hidden="true"></span>Awaiting approval</span>
        <div class="approval-desc">Approve this contract in the session. Specs are then generated per phase, and this brief regenerates with its run commands.</div>
      </div>
    </section>`;
  }

  return `
    <section class="section">
${sectionHdr('Execution', d.execution.strategy)}
${pipeline}
${table}

      <div class="run-bar">
        <div>
          <div class="label label-accent">Run all phases</div>
          <div class="run-bar-headline">Autopilot.</div>
          <div class="run-bar-desc">Reads the contract, walks the dependency graph, and dispatches phases automatically.</div>
        </div>
        ${cmdField('cmd-autopilot', '/ideation:autopilot')}
      </div>

      <details class="disclosure">
        <summary>Run phases individually (${phases.length})</summary>
        <div class="disclosure-body">
          <div class="cmd-list">
${phases
  .map((p, i) => {
    const cmd = phaseCommand(p, d.slug, i);
    return `            <div class="cmd-row">
              <span class="cmd-row-num">${pad2(i + 1)}</span>
              <span class="cmd-row-title">${esc(p.title)}</span>
              ${cmdField(`cmd-${i + 1}`, cmd)}
            </div>`;
  })
  .join('\n')}
          </div>
        </div>
      </details>
${
  d.execution.agentTeamPrompt
    ? `
      <details class="disclosure">
        <summary>Agent Team Prompt (parallel execution)</summary>
        <div class="disclosure-body">
          ${cmdField('agent-team-prompt', d.execution.agentTeamPrompt, true)}
        </div>
      </details>`
    : ''
}
    </section>`;
}

/** Closing approval band — the contract ends on the decision, not a footnote.
    Approval happens in the session; this records it (peak-end). */
function buildClose(d: ContractData): string {
  if (d.status !== 'Approved') return '';
  const phaseCount = d.execution.phases.length;
  const when = d.approvedOn ?? d.date;
  return `
    <section class="contract-close">
      <div>
        <div class="label label-accent">Contract approved</div>
        <div class="close-headline">This plan is the commitment.</div>
        <div class="close-desc">${phaseCount} phase${phaseCount === 1 ? '' : 's'} · ${esc(d.execution.strategy)}. Scope changes mean a new revision that supersedes this brief — not silent drift.</div>
      </div>
      <div class="close-meta">
        <span class="status-ind status-go"><span class="status-dot" aria-hidden="true"></span>Approved</span>
        <span class="mono-meta">${esc(when)}${d.approvedBy ? ` · ${esc(d.approvedBy)}` : ''}</span>
      </div>
    </section>`;
}

// --- Main Template ---

function generate(data: ContractData): string {
  const d = data;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(d.projectName)} — Mission Brief</title>
    <script>
      // Apply a saved forced theme before first paint to avoid a flash
      try {
        const saved = localStorage.getItem('ideation-contract-theme');
        if (saved === 'light' || saved === 'dark')
          document.documentElement.dataset.theme = saved;
      } catch {}
    </script>
    <style>
${CSS}
    </style>
  </head>
  <body>
${buildHeader(d)}
    <main>
${buildFirstMove(d)}
${buildProblemGoals(d)}
${buildSuccess(d)}
${buildScope(d)}
${buildExecution(d)}
${buildClose(d)}
    </main>

    <script>
      document.querySelectorAll('.copy-btn').forEach(btn => {
        // aria-live so the copied/failed text swap is announced
        btn.setAttribute('aria-live', 'polite');
        btn.addEventListener('click', () => {
          const target = document.getElementById(btn.dataset.copy);
          if (!target) return;
          const flash = label => {
            btn.textContent = label;
            setTimeout(() => (btn.textContent = 'copy'), 2000);
          };
          navigator.clipboard
            .writeText(target.textContent.trim())
            .then(() => flash('copied'))
            // file:// or denied permission — the text is select-all, so
            // point at the manual path instead of failing silently
            .catch(() => flash('press ⌘C / Ctrl+C'));
        });
      });

      /* === THEME TOGGLE (auto → light → dark) === */
      const themeBtn = document.getElementById('theme-toggle');
      if (themeBtn) {
        const KEY = 'ideation-contract-theme';
        const root = document.documentElement;
        const apply = mode => {
          if (mode === 'auto') delete root.dataset.theme;
          else root.dataset.theme = mode;
          themeBtn.textContent = 'theme · ' + mode;
          try {
            if (mode === 'auto') localStorage.removeItem(KEY);
            else localStorage.setItem(KEY, mode);
          } catch {}
        };
        apply(root.dataset.theme || 'auto');
        themeBtn.addEventListener('click', () => {
          const order = ['auto', 'light', 'dark'];
          const current = root.dataset.theme || 'auto';
          apply(order[(order.indexOf(current) + 1) % order.length]);
        });
      }
    </script>
  </body>
</html>
`;
}

// --- CLI ---

const { values } = parseArgs({
  options: {
    input: { type: 'string', short: 'i' },
    output: { type: 'string', short: 'o' },
  },
});

if (!values.input) {
  console.error(
    'Usage: contract-gen.ts --input <data.json> --output <contract.html>',
  );
  process.exit(1);
}

const raw = readFileSync(values.input, 'utf8');
const parsed = JSON.parse(raw) as Record<string, unknown>;

if (!('gates' in parsed) && 'confidence' in parsed) {
  console.error(
    'contract-data.json uses the pre-gate `confidence` schema; regenerate via ideation to produce the `gates` schema.',
  );
  process.exit(1);
}

const data = parsed as unknown as ContractData;

const outputPath = values.output ?? `contract.html`;
const outputDir = dirname(outputPath);

if (outputDir && !existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

/** First free lineage path: base-{date}.ext, then base-{date}-2.ext, -3, ... */
function nextLineagePath(
  dir: string,
  base: string,
  date: string,
  ext: string,
): string {
  for (let n = 1; ; n++) {
    const candidate = join(
      dir,
      `${base}-${date}${n === 1 ? '' : `-${n}`}${ext}`,
    );
    if (!existsSync(candidate)) return candidate;
  }
}

if (existsSync(outputPath)) {
  const existing = readFileSync(outputPath, 'utf8');
  const dateMatch = existing.match(/(\d{4}-\d{2}-\d{2})/);
  const existingDate = dateMatch?.[1] ?? 'unknown';
  const htmlMtime = statSync(outputPath).mtimeMs;
  const renamedPath = nextLineagePath(
    outputDir,
    basename(outputPath, '.html'),
    existingDate,
    '.html',
  );
  const renamedBase = basename(renamedPath);
  renameSync(outputPath, renamedPath);

  // Archive the sibling .md only if it belongs to the superseded revision —
  // an .md newer than the .html being archived was written for the NEW
  // revision and must stay in place.
  const mdPath = outputPath.replace(/\.html$/, '.md');
  if (existsSync(mdPath) && statSync(mdPath).mtimeMs <= htmlMtime) {
    renameSync(
      mdPath,
      nextLineagePath(outputDir, basename(mdPath, '.md'), existingDate, '.md'),
    );
  }

  if (!data.supersedes) {
    data.supersedes = renamedBase;
  }

  console.log(`Renamed existing contract to ${renamedBase}`);
}

const html = generate(data);
writeFileSync(outputPath, html, 'utf8');
console.log(`Generated ${outputPath} (${html.length} bytes)`);
