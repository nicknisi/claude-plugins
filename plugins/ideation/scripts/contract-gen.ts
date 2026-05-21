import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { parseArgs } from "node:util";

// --- Types ---

interface ScopeItem {
  item: string;
  reason?: string;
}

interface Phase {
  title: string;
  prototype?: {
    question: string;
    branch: "logic" | "ui";
  };
}

interface ContractData {
  projectName: string;
  slug: string;
  date: string;
  status: "Draft" | "Approved";
  supersedes: string | null;
  confidence: {
    score: number;
    scope: "High" | "Med" | "Low";
    risk: "High" | "Med" | "Low";
    effort: "High" | "Med" | "Low";
    clarity: "High" | "Med" | "Low";
    tests: "High" | "Med" | "Low";
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
    strategy: "Sequential" | "Agent Team" | "Hybrid";
    phases: Phase[];
    agentTeamPrompt?: string;
  };
}

// --- HTML Helpers ---

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scopeItems(items: ScopeItem[], tier: number, label: string, cssClass: string): string {
  return items
    .map(
      (it) =>
        `              <div class="scope-item ${cssClass}" data-tier="${tier}">
                <strong>${label}:</strong> ${esc(it.item)}${
                  it.reason ? `\n                <div class="scope-reason">${esc(it.reason)}</div>` : ""
                }
              </div>`,
    )
    .join("\n");
}

function outOfScopeItems(items: ScopeItem[]): string {
  return items
    .map(
      (it) =>
        `          <div class="scope-out">
            <strong>Out of scope:</strong> ${esc(it.item)}${
              it.reason ? `\n            <div class="scope-reason">${esc(it.reason)}</div>` : ""
            }
          </div>`,
    )
    .join("\n");
}

// --- SVG Dependency Graph ---

function buildSvg(phases: Phase[], slug: string): string {
  const nodes: { label: string; y: number; isPrototype: boolean }[] = [];
  let y = 10;
  const stride = 90;

  for (const phase of phases) {
    if (phase.prototype) {
      nodes.push({
        label: `▸ Prototype: ${phase.title}`,
        y,
        isPrototype: true,
      });
      y += stride;
    }
    nodes.push({ label: phase.title, y, isPrototype: false });
    y += stride;
  }

  const height = y - stride + 70;
  const width = 280;

  let svg = `          <svg
            class="dep-graph"
            viewBox="0 0 ${width} ${height}"
            width="${width}"
            height="${height}"
            role="img"
            aria-label="Phase dependency graph"
          >
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" />
              </marker>
            </defs>\n`;

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const boxX = 20;
    const boxW = width - 40;
    const boxH = 60;
    const rx = 8;
    const cx = boxX + boxW / 2;

    if (n.isPrototype) {
      svg += `
            <g class="node">
              <rect x="${boxX}" y="${n.y}" width="${boxW}" height="${boxH}" rx="${rx}" ry="${rx}" stroke-dasharray="6 3" />
              <text x="${cx}" y="${n.y + 35}" text-anchor="middle">${esc(n.label)}</text>
            </g>\n`;
    } else {
      svg += `
            <g class="node">
              <rect x="${boxX}" y="${n.y}" width="${boxW}" height="${boxH}" rx="${rx}" ry="${rx}" />
              <text x="${cx}" y="${n.y + 35}" text-anchor="middle">${esc(n.label)}</text>
            </g>\n`;
    }

    if (i < nodes.length - 1) {
      const lineY1 = n.y + boxH;
      const lineY2 = nodes[i + 1].y;
      svg += `            <line x1="${cx}" y1="${lineY1}" x2="${cx}" y2="${lineY2}" marker-end="url(#arrow)" />\n`;
    }
  }

  svg += `          </svg>`;
  return svg;
}

// --- Execution Steps ---

function buildExecutionSteps(phases: Phase[], slug: string): string {
  let html = "";
  let cmdIdx = 1;

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const phaseNum = i + 1;
    const blocking = i === 0 ? " <em>(blocking)</em>" : "";

    if (phase.prototype) {
      html += `
          <h3>Prototype — ${esc(phase.title)}</h3>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">bash</span>
              <button class="copy-btn" data-copy="cmd-${cmdIdx}" type="button">Copy</button>
            </div>
            <pre><code id="cmd-${cmdIdx}">/essentials:prototype ${esc(phase.prototype.question)}</code></pre>
          </div>\n`;
      cmdIdx++;
    }

    html += `
          <h3>Phase ${phaseNum} — ${esc(phase.title)}${blocking}</h3>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">bash</span>
              <button class="copy-btn" data-copy="cmd-${cmdIdx}" type="button">Copy</button>
            </div>
            <pre><code id="cmd-${cmdIdx}">/execute-spec docs/ideation/${esc(slug)}/spec-phase-${phaseNum}.md</code></pre>
          </div>\n`;
    cmdIdx++;
  }

  return html;
}

// --- Main Template ---

function generate(data: ContractData): string {
  const d = data;
  const c = d.confidence;

  return `<!doctype html>
<html lang="en" data-theme="auto">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(d.projectName)} Contract — Ideation</title>
    <style>
      :root {
        --color-bg: #ffffff;
        --color-surface: #f8f9fa;
        --color-border: #dee2e6;
        --color-text: #212529;
        --color-text-muted: #6c757d;
        --color-accent: #4361ee;
        --color-accent-bg: #eef0ff;
        --color-success: #2d6a4f;
        --color-success-bg: #d8f3dc;
        --color-danger: #9b2226;
        --color-danger-bg: #fde8e8;
        --color-warning: #b45309;
        --color-warning-bg: #fef3c7;
        --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        --font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Menlo, Consolas, monospace;
        --space-1: 4px; --space-2: 8px; --space-3: 16px; --space-4: 24px; --space-5: 32px; --space-6: 48px;
        --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
        --max-width: 900px; --sidebar-width: 220px;
      }
      @media (prefers-color-scheme: dark) {
        [data-theme='auto'] {
          --color-bg: #1a1a2e; --color-surface: #16213e; --color-border: #2a2a4a;
          --color-text: #e0e0e0; --color-text-muted: #a0a0b0;
          --color-accent: #6c83f7; --color-accent-bg: #1e2a4a;
          --color-success: #4ade80; --color-success-bg: #14352a;
          --color-danger: #f87171; --color-danger-bg: #3a1818;
          --color-warning: #fbbf24; --color-warning-bg: #3a2a08;
        }
      }
      *, *::before, *::after { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body { font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--color-text); background: var(--color-bg); max-width: var(--max-width); margin: 0 auto; padding: var(--space-5) var(--space-4); }
      .doc-header { border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-3); margin-bottom: var(--space-5); }
      .doc-header h1 { margin: 0 0 var(--space-1) 0; font-size: 28px; line-height: 1.25; }
      .doc-meta { color: var(--color-text-muted); font-size: 14px; margin: 0; }
      .doc-content h2 { margin-top: var(--space-6); padding-bottom: var(--space-2); border-bottom: 1px solid var(--color-border); font-size: 22px; }
      .doc-content h3 { margin-top: var(--space-5); font-size: 18px; }
      .doc-content p, .doc-content li { font-size: 15px; }
      a { color: var(--color-accent); }
      .doc-layout { display: grid; grid-template-columns: var(--sidebar-width) 1fr; gap: var(--space-4); }
      .doc-sidebar { position: sticky; top: var(--space-4); align-self: start; font-size: 14px; }
      .doc-sidebar ul { list-style: none; padding: 0; margin: 0; }
      .doc-sidebar li { padding: var(--space-1) 0; }
      @media (max-width: 768px) { .doc-layout { grid-template-columns: 1fr; } .doc-sidebar { position: static; } .feedback-grid { grid-template-columns: 1fr !important; } }
      .tabs { margin: var(--space-4) 0; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
      .tabs > input[type='radio'] { position: absolute; opacity: 0; pointer-events: none; }
      .tabs > label { display: inline-block; padding: var(--space-2) var(--space-3); cursor: pointer; font-size: 14px; font-weight: 500; color: var(--color-text-muted); border-bottom: 2px solid transparent; }
      .tabs > label:hover { color: var(--color-text); }
      .tabs > input:focus-visible + label { outline: 2px solid var(--color-accent); outline-offset: -2px; }
      .tabs > .tab-panel { display: none; padding: var(--space-3); border-top: 1px solid var(--color-border); }
      .tabs > input:nth-of-type(1):checked ~ .tab-panel:nth-of-type(1),
      .tabs > input:nth-of-type(2):checked ~ .tab-panel:nth-of-type(2),
      .tabs > input:nth-of-type(3):checked ~ .tab-panel:nth-of-type(3),
      .tabs > input:nth-of-type(4):checked ~ .tab-panel:nth-of-type(4),
      .tabs > input:nth-of-type(5):checked ~ .tab-panel:nth-of-type(5) { display: block; }
      .tabs > input:nth-of-type(1):checked ~ label:nth-of-type(1),
      .tabs > input:nth-of-type(2):checked ~ label:nth-of-type(2),
      .tabs > input:nth-of-type(3):checked ~ label:nth-of-type(3),
      .tabs > input:nth-of-type(4):checked ~ label:nth-of-type(4),
      .tabs > input:nth-of-type(5):checked ~ label:nth-of-type(5) { color: var(--color-accent); border-bottom-color: var(--color-accent); }
      .collapsible { border: 1px solid var(--color-border); border-radius: var(--radius-md); margin: var(--space-3) 0; overflow: hidden; }
      .collapsible > summary { list-style: none; cursor: pointer; padding: var(--space-2) var(--space-3); background: var(--color-surface); font-weight: 500; display: flex; align-items: center; gap: var(--space-2); }
      .collapsible > summary::-webkit-details-marker { display: none; }
      .collapsible > summary::before { content: '▸'; display: inline-block; transition: transform 0.15s ease; color: var(--color-text-muted); }
      .collapsible[open] > summary::before { transform: rotate(90deg); }
      .collapsible > summary:focus-visible { outline: 2px solid var(--color-accent); outline-offset: -2px; }
      .collapsible-body { padding: var(--space-3); border-top: 1px solid var(--color-border); }
      .confidence { border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-3); margin: var(--space-3) 0; background: var(--color-surface); }
      .confidence-overall { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
      .confidence-label { font-weight: 600; font-size: 14px; min-width: 80px; }
      .confidence-bar { flex: 1; height: 10px; border-radius: 5px; background: var(--color-border); overflow: hidden; }
      .confidence-fill { height: 100%; background: linear-gradient(90deg, var(--color-danger) 0%, var(--color-warning) 50%, var(--color-success) 100%); border-radius: 5px; }
      .confidence-value { font-variant-numeric: tabular-nums; font-weight: 600; min-width: 40px; text-align: right; }
      .confidence-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-2); }
      .confidence-dim { text-align: center; padding: var(--space-2); background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 13px; display: flex; flex-direction: column; gap: var(--space-1); }
      .confidence-dim strong { color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
      .dep-graph { display: block; margin: var(--space-3) auto; max-width: 100%; height: auto; }
      .dep-graph .node rect { fill: var(--color-accent-bg); stroke: var(--color-accent); stroke-width: 1.5; }
      .dep-graph .node text { fill: var(--color-text); font-family: var(--font-sans); font-size: 13px; font-weight: 500; }
      .dep-graph line { stroke: var(--color-text-muted); stroke-width: 1.5; }
      .dep-graph marker path { fill: var(--color-text-muted); }
      .code-block { border: 1px solid var(--color-border); border-radius: var(--radius-md); margin: var(--space-3) 0; background: var(--color-surface); overflow: hidden; }
      .code-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-1) var(--space-3); border-bottom: 1px solid var(--color-border); background: var(--color-bg); }
      .code-lang { font-family: var(--font-mono); font-size: 12px; color: var(--color-text-muted); text-transform: lowercase; }
      .copy-btn { font-family: var(--font-sans); font-size: 12px; padding: var(--space-1) var(--space-2); border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); border-radius: var(--radius-sm); cursor: pointer; }
      .copy-btn:hover { background: var(--color-accent-bg); border-color: var(--color-accent); color: var(--color-accent); }
      .copy-btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 1px; }
      .code-block pre { margin: 0; padding: var(--space-3); overflow-x: auto; font-family: var(--font-mono); font-size: 13px; line-height: 1.5; }
      .code-block code { font-family: inherit; color: var(--color-text); background: none; padding: 0; }
      .scope-in, .scope-out { padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); margin: var(--space-2) 0; border-left: 4px solid; font-size: 14px; }
      .scope-in { background: var(--color-success-bg); border-left-color: var(--color-success); }
      .scope-out { background: var(--color-danger-bg); border-left-color: var(--color-danger); }
      .scope-reason { color: var(--color-text-muted); font-size: 13px; margin-top: var(--space-1); }
      .scope-slider { margin: var(--space-4) 0; }
      .scope-slider-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); }
      .scope-slider-header label { font-weight: 600; }
      .scope-slider-header output { font-weight: 600; color: var(--color-accent); padding: 2px 8px; background: var(--color-accent-bg); border-radius: var(--radius-sm); font-size: 0.85em; }
      #scope-range { width: 100%; height: 6px; -webkit-appearance: none; appearance: none; background: var(--color-border); border-radius: 3px; outline: none; }
      #scope-range::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: var(--color-accent); border-radius: 50%; cursor: pointer; }
      .scope-tier-labels { display: flex; justify-content: space-between; font-size: 0.8em; color: var(--color-text-muted); margin-top: var(--space-1); }
      .criteria-list { list-style: none; padding: 0; margin: var(--space-3) 0; }
      .criteria-list li { padding: var(--space-1) 0; display: flex; align-items: flex-start; gap: var(--space-2); }
      .criteria-list input[type='checkbox'] { margin-top: 4px; flex-shrink: 0; }
      @media print {
        body { font-size: 11pt; max-width: none; color: #000; background: #fff; }
        .tabs > label, .tabs > input[type='radio'] { display: none !important; }
        .tabs > .tab-panel { display: block !important; border-top: none !important; page-break-inside: avoid; }
        .copy-btn { display: none !important; }
        details { display: block; }
        details > summary { list-style: none; }
        details > summary::before { display: none; }
        details:not([open]) > *:not(summary) { display: block !important; }
        .code-block, .confidence, .dep-graph { page-break-inside: avoid; }
        a { color: #000; text-decoration: underline; }
      }
    </style>
  </head>
  <body>
    <header class="doc-header">
      <h1>${esc(d.projectName)} Contract — Ideation</h1>
      <p class="doc-meta">
        Created ${esc(d.date)}
        · Confidence ${c.score}/100
        · ${esc(d.status)}
        · Supersedes ${d.supersedes ? esc(d.supersedes) : "None"}
      </p>
    </header>

    <main class="doc-content">
      <div class="confidence">
        <div class="confidence-overall">
          <span class="confidence-label">Confidence</span>
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${c.score}%;"></div>
          </div>
          <span class="confidence-value">${c.score}%</span>
        </div>
        <div class="confidence-grid">
          <div class="confidence-dim"><strong>Scope</strong><span>${esc(c.scope)}</span></div>
          <div class="confidence-dim"><strong>Risk</strong><span>${esc(c.risk)}</span></div>
          <div class="confidence-dim"><strong>Effort</strong><span>${esc(c.effort)}</span></div>
          <div class="confidence-dim"><strong>Clarity</strong><span>${esc(c.clarity)}</span></div>
          <div class="confidence-dim"><strong>Tests</strong><span>${esc(c.tests)}</span></div>
        </div>
      </div>

      <div class="tabs" role="tablist">
        <input type="radio" name="contract-tabs" id="tab-problem" checked />
        <label for="tab-problem">Problem</label>
        <input type="radio" name="contract-tabs" id="tab-goals" />
        <label for="tab-goals">Goals</label>
        <input type="radio" name="contract-tabs" id="tab-scope" />
        <label for="tab-scope">Scope</label>
        <input type="radio" name="contract-tabs" id="tab-execution" />
        <label for="tab-execution">Execution Plan</label>

        <div class="tab-panel">
          <h2>Problem Statement</h2>
${d.problem.map((p) => `          <p>${esc(p)}</p>`).join("\n")}
        </div>

        <div class="tab-panel">
          <h2>Goals</h2>
          <ol>
${d.goals.map((g) => `            <li>${esc(g)}</li>`).join("\n")}
          </ol>

          <h2>Success Criteria</h2>
          <ul class="criteria-list">
${d.successCriteria.map((cr) => `            <li><input type="checkbox" disabled /><span>${esc(cr)}</span></li>`).join("\n")}
          </ul>
        </div>

        <div class="tab-panel">
          <h2>Scope</h2>
          <div class="scope-slider">
            <div class="scope-slider-header">
              <label for="scope-range">Scope Tier</label>
              <output id="scope-label">Full</output>
            </div>
            <input type="range" id="scope-range" min="0" max="2" value="1" step="1" />
            <div class="scope-tier-labels">
              <span>MVP</span><span>Full</span><span>Stretch</span>
            </div>
            <div class="scope-items">
${scopeItems(d.scope.mvp, 0, "In scope (MVP)", "scope-in")}
${scopeItems(d.scope.full, 1, "In scope (Full)", "scope-in")}
${scopeItems(d.scope.stretch, 2, "Stretch", "scope-out")}
            </div>
          </div>

          <h2>Out of Scope</h2>
${outOfScopeItems(d.scope.outOfScope)}

          <details class="collapsible">
            <summary>Future Considerations</summary>
            <div class="collapsible-body">
              <ul>
${d.scope.future.map((f) => `                <li>${esc(f)}</li>`).join("\n")}
              </ul>
            </div>
          </details>
        </div>

        <div class="tab-panel">
          <h2>Dependency Graph</h2>
${buildSvg(d.execution.phases, d.slug)}

          <h2>Execution Steps</h2>
          <p><strong>Strategy:</strong> ${esc(d.execution.strategy)}</p>
${buildExecutionSteps(d.execution.phases, d.slug)}
${
  d.execution.agentTeamPrompt
    ? `
          <details class="collapsible">
            <summary>Agent Team Prompt (parallel execution)</summary>
            <div class="collapsible-body">
              <div class="code-block">
                <div class="code-header">
                  <span class="code-lang">prompt</span>
                  <button class="copy-btn" data-copy="agent-team-prompt" type="button">Copy</button>
                </div>
                <pre><code id="agent-team-prompt">${esc(d.execution.agentTeamPrompt)}</code></pre>
              </div>
            </div>
          </details>`
    : ""
}
        </div>
      </div>
    </main>

    <script>
      document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = document.getElementById(btn.dataset.copy);
          navigator.clipboard.writeText(target.textContent).then(() => {
            btn.textContent = 'Copied!';
            setTimeout(() => (btn.textContent = 'Copy'), 2000);
          });
        });
      });
      const scopeRange = document.getElementById('scope-range');
      const scopeLabel = document.getElementById('scope-label');
      const tierNames = ['MVP', 'Full', 'Stretch'];
      if (scopeRange) {
        scopeRange.addEventListener('input', () => {
          const tier = parseInt(scopeRange.value);
          scopeLabel.textContent = tierNames[tier];
          document.querySelectorAll('.scope-item').forEach(item => {
            const itemTier = parseInt(item.dataset.tier);
            item.style.display = itemTier <= tier ? '' : 'none';
          });
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
  const dateMatch = existing.match(/Created (\d{4}-\d{2}-\d{2})/);
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
