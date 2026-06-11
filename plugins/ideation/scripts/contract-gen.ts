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

function gateStatusColor(status: 'ready' | 'not-ready'): string {
  // Hero-scoped tokens: these sit on the inverted hero surface
  return status === 'ready' ? 'var(--hero-go)' : 'var(--hero-caution)';
}

function asCriterion(c: string | SuccessCriterion): SuccessCriterion {
  return typeof c === 'string' ? { criterion: c } : c;
}

function riskMeta(risk: string): { color: string; label: string } {
  switch (risk) {
    case 'high':
      return { color: 'var(--status-danger)', label: 'high' };
    case 'medium':
      return { color: 'var(--status-caution)', label: 'med' };
    default:
      return { color: 'var(--status-go)', label: 'low' };
  }
}

function phaseCommand(phase: Phase, slug: string, index: number): string {
  if (phase.kind === 'gate')
    return `# Review: ${phase.specPath ?? phase.title}`;
  if (phase.specPath) return `/ideation:execute-spec ${phase.specPath}`;
  return `/ideation:execute-spec docs/ideation/${slug}/spec-phase-${index + 1}.md`;
}

// --- Section Builders ---

function buildHero(d: ContractData): string {
  const dims = d.gates.dimensions;
  const open = dims.filter(dim => dim.status !== 'ready');
  const readiness =
    open.length === 0
      ? 'All gates ready'
      : `${open.length} gate${open.length === 1 ? '' : 's'} open — interview ended early`;
  const readinessColor =
    open.length === 0 ? 'var(--hero-go)' : 'var(--hero-caution)';
  return `
    <header class="hero">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="hero-content">
        <div class="hero-top">
          <div>
            <div class="hero-slug">
              <span class="slug-dot"></span>
              <span>Mission brief · ${esc(d.slug)}</span>
            </div>
            <h1 class="hero-title">${esc(d.projectName)}</h1>
          </div>
          <div class="hero-meta">
            <div class="hero-status">${esc(d.status)}</div>
            <div>created ${esc(d.date)}</div>
            ${d.approvedOn ? `<div>approved ${esc(d.approvedOn)}${d.approvedBy ? ` · ${esc(d.approvedBy)}` : ''}</div>` : ''}
            ${d.supersedes ? `<div class="hero-supersedes">supersedes ${esc(d.supersedes)}</div>` : ''}
          </div>
        </div>

        <div class="hero-gates">
          <div class="gates-line">
            <span class="kicker">Readiness gates</span>
            <span class="gates-verdict" style="color: ${readinessColor}">${esc(readiness)}</span>
          </div>
          <div class="dim-grid">
${dims
  .map(
    dim => `            <div class="dim-row">
              <span class="dim-score" style="color: ${gateStatusColor(dim.status)}">${dim.status === 'ready' ? '✓' : '✗'}</span>
              <div class="dim-detail">
                <div class="dim-label">${esc(dim.label.toLowerCase())}</div>
                <div class="dim-reason">${esc(dim.evidence)}</div>
              </div>
            </div>`,
  )
  .join('\n')}
          </div>
        </div>
      </div>
    </header>`;
}

function buildFirstMove(d: ContractData): string {
  const phase = d.execution.phases[0];
  if (!phase || d.status === 'Draft') return '';
  const cmd = phaseCommand(phase, d.slug, 0);
  return `
    <section class="first-move">
      <div class="first-move-grid">
        <div>
          <div class="kicker kicker-accent">First move</div>
          <div class="first-move-headline">Run this.</div>
          <div class="first-move-phase">Phase 01 of ${pad2(d.execution.phases.length)} — <strong>${esc(phase.title)}</strong></div>
        </div>
        <div class="copy-cmd">
          <span class="copy-cmd-text" id="cmd-first">${esc(cmd)}</span>
          <button type="button" class="copy-btn copy-btn-accent" data-copy="cmd-first">copy</button>
        </div>
      </div>
    </section>`;
}

function buildProblemGoals(d: ContractData): string {
  return `
    <div class="two-col">
      <section>
        <div class="section-hdr">
          <div class="kicker">Context</div>
          <h2 class="section-title">The problem</h2>
        </div>
        <div class="stack-14">
${d.problem
  .map(
    (p, i) =>
      `          <p class="body-text"><span class="line-num">${pad2(i + 1)}</span>${esc(p)}</p>`,
  )
  .join('\n')}
        </div>
      </section>
      <section>
        <div class="section-hdr">
          <div class="kicker">Commit</div>
          <h2 class="section-title">Goals</h2>
        </div>
        <div class="stack-14">
${d.goals
  .map(
    (g, i) => `          <div class="goal-card">
            <span class="goal-num">${i + 1}</span>
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
    <section class="section-block">
      <div class="section-hdr">
        <div class="kicker">Signal</div>
        <div class="section-title-row">
          <h2 class="section-title">Done when…</h2>
          <span class="section-count">${countLabel}</span>
        </div>
      </div>
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
  const tierList = (title: string, tone: string, items: ScopeItem[]) => {
    if (!items.length) return '';
    return `
          <div class="tier-group">
            <div class="tier-header">
              <span class="tier-dot tier-${tone}"></span>
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
    <section class="section-block">
      <div class="section-hdr">
        <div class="kicker">Boundary</div>
        <div class="section-title-row">
          <h2 class="section-title">Scope</h2>
          <span class="section-count">MVP nests inside Full nests inside Stretch</span>
        </div>
      </div>

      <div class="scope-layout">
        <div class="nested-tiers">
          <div class="tier-box tier-stretch"><span class="tier-box-label">Stretch <span class="tier-box-count">×${d.scope.stretch.length}</span></span></div>
          <div class="tier-box tier-full"><span class="tier-box-label">Full <span class="tier-box-count">×${d.scope.full.length}</span></span></div>
          <div class="tier-box tier-mvp"><span class="tier-box-label">MVP <span class="tier-box-count">×${d.scope.mvp.length}</span></span></div>
        </div>
        <div class="tier-lists">
${tierList('MVP — must ship', 'solid', d.scope.mvp)}
${tierList('Full — target outcome', 'soft', d.scope.full)}
${tierList('Stretch — if time permits', 'ghost', d.scope.stretch)}
        </div>
      </div>

      <div class="two-col scope-extras">
        <div class="scope-out-panel">
          <div class="kicker kicker-danger">Out of scope — said no on purpose</div>
          <ul class="scope-out-list">
${d.scope.outOfScope
  .map(
    it =>
      `            <li><span class="scope-out-item">${esc(it.item)}</span>${it.reason ? ` <span class="scope-out-reason">— ${esc(it.reason)}</span>` : ''}</li>`,
  )
  .join('\n')}
          </ul>
        </div>
        <div class="scope-future-panel">
          <div class="kicker kicker-muted">Future — someday, maybe</div>
          <ul class="scope-future-list">
${d.scope.future.map(f => `            <li>${esc(f)}</li>`).join('\n')}
          </ul>
        </div>
      </div>
    </section>`;
}

function buildExecution(d: ContractData): string {
  const phases = d.execution.phases;
  const isDraft = d.status === 'Draft';
  const phaseTrack = phases.length
    ? `
      <div class="phase-track" style="grid-template-columns: repeat(${phases.length}, 1fr)">
${phases
  .map((p, i) => {
    const rm = riskMeta(p.risk ?? 'low');
    const isGate = p.kind === 'gate';
    const arrow =
      i < phases.length - 1
        ? '\n          <div class="phase-arrow" aria-hidden="true"></div>'
        : '';
    return `        <div class="phase-card${isGate ? ' phase-gate' : ''}" style="border-top-color: ${rm.color}">${arrow}
          <div class="phase-head">
            <span class="phase-num">${pad2(i + 1)}</span>
            <span class="phase-risk" style="color: ${rm.color}">${rm.label}</span>
          </div>
          <div class="phase-title">${esc(p.title)}</div>
          <div class="phase-kind">${isGate ? 'gate' : 'phase'}${p.blocking ? ' · blocking' : ''}</div>${p.notes ? `\n          <div class="phase-notes">${esc(p.notes)}</div>` : ''}
        </div>`;
  })
  .join('\n')}
      </div>`
    : `
      <p class="body-text plan-placeholder">Phases are decided after approval.</p>`;

  if (isDraft) {
    return `
    <section class="section-block">
      <div class="section-hdr">
        <div class="kicker">Plan</div>
        <div class="section-title-row">
          <h2 class="section-title">The plan</h2>
          <span class="section-count">${esc(d.execution.strategy)}</span>
        </div>
      </div>
${phaseTrack}

      <div class="approval-bar">
        <div>
          <div class="kicker kicker-accent">Awaiting approval</div>
          <div class="approval-desc">Approve this contract in the session. Specs are then generated per phase, and this brief regenerates with its run commands.</div>
        </div>
      </div>
    </section>`;
  }

  return `
    <section class="section-block">
      <div class="section-hdr">
        <div class="kicker">Run</div>
        <div class="section-title-row">
          <h2 class="section-title">Execution</h2>
          <span class="section-count">${esc(d.execution.strategy)}</span>
        </div>
      </div>
${phaseTrack}

      <div class="autopilot-bar">
        <div class="autopilot-left">
          <div class="kicker kicker-accent">Run all phases</div>
          <div class="autopilot-desc">Autopilot reads the contract, walks the dependency graph, and dispatches phases automatically.</div>
        </div>
        <div class="copy-cmd copy-cmd-accent">
          <span class="copy-cmd-text" id="cmd-autopilot">/ideation:autopilot</span>
          <button type="button" class="copy-btn copy-btn-accent" data-copy="cmd-autopilot">copy</button>
        </div>
      </div>

      <details class="disclosure">
        <summary>Run phases individually (${phases.length})</summary>
        <div class="disclosure-body">
          <div class="cmd-list">
${phases
  .map((p, i) => {
    const cmd = phaseCommand(p, d.slug, i);
    const cmdId = `cmd-${i + 1}`;
    return `            <div class="cmd-row">
              <span class="cmd-num">${pad2(i + 1)}</span>
              <span class="cmd-title">${esc(p.title)}</span>
              <div class="copy-cmd">
                <span class="copy-cmd-text" id="${cmdId}">${esc(cmd)}</span>
                <button type="button" class="copy-btn" data-copy="${cmdId}">copy</button>
              </div>
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
          <div class="copy-cmd copy-cmd-wide">
            <span class="copy-cmd-text" id="agent-team-prompt">${esc(d.execution.agentTeamPrompt)}</span>
            <button type="button" class="copy-btn" data-copy="agent-team-prompt">copy</button>
          </div>
        </div>
      </details>`
    : ''
}
    </section>
${buildClose(d)}`;
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
        <div class="kicker kicker-accent">Contract approved</div>
        <div class="close-headline">This plan is the commitment.</div>
        <div class="close-desc">${phaseCount} phase${phaseCount === 1 ? '' : 's'} · ${esc(d.execution.strategy)}. Scope changes mean a new revision that supersedes this brief — not silent drift.</div>
      </div>
      <div class="close-meta">
        <div class="close-status">Approved</div>
        <div>${esc(when)}${d.approvedBy ? ` · ${esc(d.approvedBy)}` : ''}</div>
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
    <style>
${CSS}
    </style>
  </head>
  <body>
${buildHero(d)}
    <main>
${buildFirstMove(d)}
${buildProblemGoals(d)}
${buildSuccess(d)}
${buildScope(d)}
${buildExecution(d)}
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
