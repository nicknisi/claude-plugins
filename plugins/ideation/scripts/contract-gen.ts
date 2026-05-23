import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(join(__dirname, "contract-gen.css"), "utf8");

// --- Types ---

interface ScopeItem {
  item: string;
  reason?: string;
}

interface ConfidenceDimension {
  key: string;
  score: number;
  label: string;
  reason: string;
}

interface Phase {
  title: string;
  risk?: "high" | "medium" | "low";
  blocking?: boolean;
  kind?: "gate" | "phase";
  prereqs?: string[];
  specPath?: string;
  notes?: string;
}

interface ContractData {
  projectName: string;
  slug: string;
  date: string;
  status: "Draft" | "Approved";
  supersedes: string | null;
  confidence: {
    score: number;
    dimensions: ConfidenceDimension[];
  };
  problem: string[];
  goals: string[];
  successCriteria: string[];
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function confidenceColor(score: number): string {
  if (score < 60) return "var(--red-9)";
  if (score < 75) return "var(--yellow-11)";
  return "var(--green-9)";
}

function riskMeta(risk: string): { color: string; label: string } {
  switch (risk) {
    case "high":
      return { color: "var(--red-9)", label: "high" };
    case "medium":
      return { color: "var(--yellow-11)", label: "med" };
    default:
      return { color: "var(--green-11)", label: "low" };
  }
}

function phaseCommand(phase: Phase, slug: string, index: number): string {
  if (phase.kind === "gate") return `# Review: ${phase.specPath ?? phase.title}`;
  if (phase.specPath) return `/ideation:execute-spec ${phase.specPath}`;
  return `/ideation:execute-spec docs/ideation/${slug}/spec-phase-${index + 1}.md`;
}

// --- Section Builders ---

function buildHero(d: ContractData): string {
  const c = d.confidence;
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
            <div>${esc(d.date)}</div>
            ${d.supersedes ? `<div class="hero-supersedes">supersedes ${esc(d.supersedes)}</div>` : ""}
          </div>
        </div>

        <div class="hero-score-row">
          <div class="hero-score-block">
            <div class="kicker">Plan confidence</div>
            <div class="score-display">
              <span class="score-num" style="color: ${confidenceColor(c.score)}">${c.score}</span>
              <span class="score-denom">/100</span>
            </div>
            <div class="score-bar-track">
              <div class="score-bar-fill" style="width: ${c.score}%; background: ${confidenceColor(c.score)}"></div>
            </div>
          </div>
          <div class="hero-dims">
            <div class="kicker">By dimension</div>
            <div class="dim-grid">
${c.dimensions
  .map(
    (dim) => `              <div class="dim-row">
                <span class="dim-score" style="color: ${confidenceColor(dim.score)}">${dim.score}</span>
                <div class="dim-detail">
                  <div class="dim-label">${esc(dim.label.toLowerCase())}</div>
                  <div class="dim-reason">${esc(dim.reason)}</div>
                </div>
              </div>`,
  )
  .join("\n")}
            </div>
          </div>
        </div>
      </div>
    </header>`;
}

function buildFirstMove(d: ContractData): string {
  const phase = d.execution.phases[0];
  if (!phase) return "";
  const cmd = phaseCommand(phase, d.slug, 0);
  return `
    <section class="first-move">
      <div class="first-move-grid">
        <div>
          <div class="kicker kicker-accent">First move</div>
          <div class="first-move-headline">Run this.</div>
          <div class="first-move-phase">Phase 01 — <strong>${esc(phase.title)}</strong></div>
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
          <div class="kicker">Context · 01</div>
          <h2 class="section-title">The problem</h2>
        </div>
        <div class="stack-14">
${d.problem
  .map(
    (p, i) => `          <p class="body-text"><span class="line-num">${pad2(i + 1)}</span>${esc(p)}</p>`,
  )
  .join("\n")}
        </div>
      </section>
      <section>
        <div class="section-hdr">
          <div class="kicker">Commit · 02</div>
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
  .join("\n")}
        </div>
      </section>
    </div>`;
}

function buildSuccess(d: ContractData): string {
  return `
    <section class="section-block">
      <div class="section-hdr">
        <div class="kicker">Signal · 03</div>
        <div class="section-title-row">
          <h2 class="section-title">Done when…</h2>
          <span class="section-count">${d.successCriteria.length} signals</span>
        </div>
      </div>
      <ul class="criteria-grid">
${d.successCriteria
  .map(
    (c, i) => `        <li class="criteria-item">
          <span class="line-num">${pad2(i + 1)}</span>
          <span>${esc(c)}</span>
        </li>`,
  )
  .join("\n")}
      </ul>
    </section>`;
}

function buildScope(d: ContractData): string {
  const tierList = (title: string, tone: string, items: ScopeItem[]) => {
    if (!items.length) return "";
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
    (it) =>
      `              <li><strong>${esc(it.item)}</strong>${it.reason ? `<span class="tier-reason">— ${esc(it.reason)}</span>` : ""}</li>`,
  )
  .join("\n")}
            </ul>
          </div>`;
  };

  return `
    <section class="section-block">
      <div class="section-hdr">
        <div class="kicker">Boundary · 04</div>
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
${tierList("MVP — must ship", "solid", d.scope.mvp)}
${tierList("Full — target outcome", "soft", d.scope.full)}
${tierList("Stretch — if time permits", "ghost", d.scope.stretch)}
        </div>
      </div>

      <div class="two-col scope-extras">
        <div class="scope-out-panel">
          <div class="kicker kicker-danger">Out of scope — said no on purpose</div>
          <ul class="scope-out-list">
${d.scope.outOfScope
  .map(
    (it) =>
      `            <li><span class="scope-out-item">${esc(it.item)}</span>${it.reason ? ` <span class="scope-out-reason">— ${esc(it.reason)}</span>` : ""}</li>`,
  )
  .join("\n")}
          </ul>
        </div>
        <div class="scope-future-panel">
          <div class="kicker kicker-muted">Future — someday, maybe</div>
          <ul class="scope-future-list">
${d.scope.future.map((f) => `            <li>${esc(f)}</li>`).join("\n")}
          </ul>
        </div>
      </div>
    </section>`;
}

function buildExecution(d: ContractData): string {
  const phases = d.execution.phases;
  return `
    <section class="section-block">
      <div class="section-hdr">
        <div class="kicker">Run · 05</div>
        <div class="section-title-row">
          <h2 class="section-title">Execution</h2>
          <span class="section-count">${esc(d.execution.strategy)}</span>
        </div>
      </div>

      <div class="phase-track" style="grid-template-columns: repeat(${phases.length}, 1fr)">
${phases
  .map((p, i) => {
    const rm = riskMeta(p.risk ?? "low");
    const isGate = p.kind === "gate";
    return `        <div class="phase-card${isGate ? " phase-gate" : ""}" style="border-top-color: ${rm.color}">
          ${i < phases.length - 1 ? '<div class="phase-arrow" aria-hidden="true"></div>' : ""}
          <div class="phase-head">
            <span class="phase-num">${pad2(i + 1)}</span>
            <span class="phase-risk" style="color: ${rm.color}">${rm.label}</span>
          </div>
          <div class="phase-title">${esc(p.title)}</div>
          <div class="phase-kind">${isGate ? "gate" : "phase"}${p.blocking ? " · blocking" : ""}</div>
          ${p.notes ? `<div class="phase-notes">${esc(p.notes)}</div>` : ""}
        </div>`;
  })
  .join("\n")}
      </div>

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

      <div class="cmd-list-header kicker">Or run individual phases</div>
      <div class="cmd-list">
${phases
  .map((p, i) => {
    const cmd = phaseCommand(p, d.slug, i);
    const cmdId = `cmd-${i + 1}`;
    return `        <div class="cmd-row">
          <span class="cmd-num">${pad2(i + 1)}</span>
          <span class="cmd-title">${esc(p.title)}</span>
          <div class="copy-cmd">
            <span class="copy-cmd-text" id="${cmdId}">${esc(cmd)}</span>
            <button type="button" class="copy-btn" data-copy="${cmdId}">copy</button>
          </div>
        </div>`;
  })
  .join("\n")}
      </div>
${
  d.execution.agentTeamPrompt
    ? `
      <details class="agent-team-details">
        <summary>Agent Team Prompt (parallel execution)</summary>
        <div class="agent-team-body">
          <div class="copy-cmd copy-cmd-wide">
            <span class="copy-cmd-text" id="agent-team-prompt">${esc(d.execution.agentTeamPrompt)}</span>
            <button type="button" class="copy-btn" data-copy="agent-team-prompt">copy</button>
          </div>
        </div>
      </details>`
    : ""
}
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
${buildFirstMove(d)}
${buildProblemGoals(d)}
${buildSuccess(d)}
${buildScope(d)}
${buildExecution(d)}

    <script>
      document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = document.getElementById(btn.dataset.copy);
          if (!target) return;
          navigator.clipboard.writeText(target.textContent.trim()).then(() => {
            btn.textContent = 'copied';
            setTimeout(() => (btn.textContent = 'copy'), 1500);
          });
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
    input: { type: "string", short: "i" },
    output: { type: "string", short: "o" },
  },
});

if (!values.input) {
  console.error("Usage: contract-gen.ts --input <data.json> --output <contract.html>");
  process.exit(1);
}

const raw = readFileSync(values.input, "utf8");
const data: ContractData = JSON.parse(raw);

const outputPath = values.output ?? `contract.html`;
const outputDir = dirname(outputPath);

if (outputDir && !existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

if (existsSync(outputPath)) {
  const existing = readFileSync(outputPath, "utf8");
  const dateMatch = existing.match(/(\d{4}-\d{2}-\d{2})/);
  const existingDate = dateMatch?.[1] ?? "unknown";
  const renamedBase = basename(outputPath, ".html") + `-${existingDate}.html`;
  const renamedPath = join(outputDir, renamedBase);
  renameSync(outputPath, renamedPath);

  const mdPath = outputPath.replace(/\.html$/, ".md");
  if (existsSync(mdPath)) {
    const renamedMd = join(outputDir, basename(mdPath, ".md") + `-${existingDate}.md`);
    renameSync(mdPath, renamedMd);
  }

  if (!data.supersedes) {
    data.supersedes = renamedBase;
  }

  console.log(`Renamed existing contract to ${renamedBase}`);
}

const html = generate(data);
writeFileSync(outputPath, html, "utf8");
console.log(`Generated ${outputPath} (${html.length} bytes)`);
