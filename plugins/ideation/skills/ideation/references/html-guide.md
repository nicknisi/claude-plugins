# HTML Design System Guide

This is the canonical reference for **every** HTML artifact produced by the `ideation` skill. Read this file **before** generating any HTML. Every contract, spec, or PRD must use the exact tokens, components, and structure defined here.

## Rules (non-negotiable)

1. Every artifact is **ONE** self-contained `.html` file — all CSS and JS inlined.
2. **No** external CDN links, no build step, no remote fonts.
3. Must work from `file://` offline.
4. Both light **and** dark mode via `prefers-color-scheme`.
5. Minimal JS — only the clipboard copy snippet and the scope slider interaction (see Section 6). No other JS belongs in an artifact.
6. Use **semantic HTML** (`<header>`, `<main>`, `<section>`, `<details>`, `<table>`).
7. Every tab group needs a **unique** `name` attribute on its radio inputs.
8. SVG uses **CSS custom properties** for colors — never hardcoded hex.
9. **Keyboard accessible** — all interactive elements must be focusable and operable via keyboard.
10. Use **design tokens** — never hardcode colors, spacing, or radii in component CSS.

---

## 1. Document Skeleton

Every artifact starts here. Drop in `<title>`, then `<header class="doc-header">`, then `<main class="doc-content">`.

```html
<!doctype html>
<html lang="en" data-theme="auto">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{Artifact title}</title>
    <style>
      /* === DESIGN TOKENS === */
      /* (paste full token block from Section 2) */

      /* === LAYOUT === */
      /* (paste layout CSS from Section 3) */

      /* === COMPONENTS === */
      /* (paste each component's CSS as needed) */

      /* === PRINT === */
      /* (paste print CSS from Section 5) */
    </style>
  </head>
  <body>
    <header class="doc-header">
      <h1>{Artifact title}</h1>
      <p class="doc-meta">{project} · {date} · {version}</p>
    </header>
    <main class="doc-content">
      <!-- artifact body -->
    </main>
    <script>
      /* === CLIPBOARD === */
      /* (paste JS from Section 6) */
    </script>
  </body>
</html>
```

---

## 2. Design Tokens

Paste this **entire** block into the `<style>` element of every artifact.

```css
:root {
  /* Color — light mode */
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

  /* Typography */
  --font-sans:
    system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  --font-mono:
    'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Menlo, Consolas,
    monospace;

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 48px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Layout */
  --max-width: 900px;
  --sidebar-width: 220px;
}

@media (prefers-color-scheme: dark) {
  [data-theme='auto'] {
    --color-bg: #1a1a2e;
    --color-surface: #16213e;
    --color-border: #2a2a4a;
    --color-text: #e0e0e0;
    --color-text-muted: #a0a0b0;

    --color-accent: #6c83f7;
    --color-accent-bg: #1e2a4a;

    --color-success: #4ade80;
    --color-success-bg: #14352a;

    --color-danger: #f87171;
    --color-danger-bg: #3a1818;

    --color-warning: #fbbf24;
    --color-warning-bg: #3a2a08;
  }
}
```

---

## 3. Layout CSS

Base layout — reset, body, headers, responsive sidebar.

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--space-5) var(--space-4);
}

.doc-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-3);
  margin-bottom: var(--space-5);
}

.doc-header h1 {
  margin: 0 0 var(--space-1) 0;
  font-size: 28px;
  line-height: 1.25;
}

.doc-meta {
  color: var(--color-text-muted);
  font-size: 14px;
  margin: 0;
}

.doc-content h2 {
  margin-top: var(--space-6);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
  font-size: 22px;
}

.doc-content h3 {
  margin-top: var(--space-5);
  font-size: 18px;
}

.doc-content p,
.doc-content li {
  font-size: 15px;
}

a {
  color: var(--color-accent);
}

/* Sidebar (optional, when used) */
.doc-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  gap: var(--space-4);
}

.doc-sidebar {
  position: sticky;
  top: var(--space-4);
  align-self: start;
  font-size: 14px;
}

.doc-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-sidebar li {
  padding: var(--space-1) 0;
}

@media (max-width: 768px) {
  .doc-layout {
    grid-template-columns: 1fr;
  }
  .doc-sidebar {
    position: static;
  }
  .feedback-grid {
    grid-template-columns: 1fr !important;
  }
}
```

---

## 4. Components

### 4.1 Tabs (CSS-only)

Hidden radio inputs control which panel shows. Each tab group **must** use a unique `name`. Supports up to 5 tabs.

```html
<div class="tabs" role="tablist">
  <input type="radio" name="tabs-overview" id="t1" checked />
  <label for="t1">Overview</label>
  <input type="radio" name="tabs-overview" id="t2" />
  <label for="t2">Details</label>
  <input type="radio" name="tabs-overview" id="t3" />
  <label for="t3">FAQ</label>

  <div class="tab-panel"><p>Panel 1 content</p></div>
  <div class="tab-panel"><p>Panel 2 content</p></div>
  <div class="tab-panel"><p>Panel 3 content</p></div>
</div>
```

```css
.tabs {
  margin: var(--space-4) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.tabs > input[type='radio'] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.tabs > label {
  display: inline-block;
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  border-bottom: 2px solid transparent;
}

.tabs > label:hover {
  color: var(--color-text);
}

.tabs > input:focus-visible + label {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.tabs > .tab-panel {
  display: none;
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
}

/* Show panel matching the checked input.
   Pattern: nth input checked => nth panel shown. */
.tabs > input:nth-of-type(1):checked ~ .tab-panel:nth-of-type(1),
.tabs > input:nth-of-type(2):checked ~ .tab-panel:nth-of-type(2),
.tabs > input:nth-of-type(3):checked ~ .tab-panel:nth-of-type(3),
.tabs > input:nth-of-type(4):checked ~ .tab-panel:nth-of-type(4),
.tabs > input:nth-of-type(5):checked ~ .tab-panel:nth-of-type(5) {
  display: block;
}

/* Style the active label */
.tabs > input:nth-of-type(1):checked ~ label:nth-of-type(1),
.tabs > input:nth-of-type(2):checked ~ label:nth-of-type(2),
.tabs > input:nth-of-type(3):checked ~ label:nth-of-type(3),
.tabs > input:nth-of-type(4):checked ~ label:nth-of-type(4),
.tabs > input:nth-of-type(5):checked ~ label:nth-of-type(5) {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
```

### 4.2 Collapsible Sections

Native `<details>` / `<summary>`.

```html
<details class="collapsible">
  <summary>Implementation notes</summary>
  <div class="collapsible-body">
    <p>Body content here.</p>
  </div>
</details>
```

```css
.collapsible {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin: var(--space-3) 0;
  overflow: hidden;
}

.collapsible > summary {
  list-style: none;
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.collapsible > summary::-webkit-details-marker {
  display: none;
}

.collapsible > summary::before {
  content: '▸';
  display: inline-block;
  transition: transform 0.15s ease;
  color: var(--color-text-muted);
}

.collapsible[open] > summary::before {
  transform: rotate(90deg);
}

.collapsible > summary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.collapsible-body {
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
}
```

### 4.3 Styled Tables

```html
<table class="data-table">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>id</td>
      <td>uuid</td>
      <td>primary</td>
    </tr>
    <tr>
      <td>name</td>
      <td>string</td>
      <td>indexed</td>
    </tr>
  </tbody>
</table>
```

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--space-3) 0;
  font-size: 14px;
}

.data-table th {
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 600;
  padding: var(--space-2) var(--space-3);
  border-bottom: 2px solid var(--color-border);
}

.data-table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.data-table tbody tr:hover {
  background: var(--color-surface);
}
```

### 4.4 Confidence Meter

Five dimensions with a gradient fill.

```html
<div class="confidence">
  <div class="confidence-overall">
    <span class="confidence-label">Confidence</span>
    <div class="confidence-bar">
      <div class="confidence-fill" style="width: 72%;"></div>
    </div>
    <span class="confidence-value">72%</span>
  </div>
  <div class="confidence-grid">
    <div class="confidence-dim"><strong>Scope</strong><span>High</span></div>
    <div class="confidence-dim"><strong>Risk</strong><span>Med</span></div>
    <div class="confidence-dim"><strong>Effort</strong><span>Med</span></div>
    <div class="confidence-dim"><strong>Clarity</strong><span>High</span></div>
    <div class="confidence-dim"><strong>Tests</strong><span>Low</span></div>
  </div>
</div>
```

```css
.confidence {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin: var(--space-3) 0;
  background: var(--color-surface);
}

.confidence-overall {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.confidence-label {
  font-weight: 600;
  font-size: 14px;
  min-width: 80px;
}

.confidence-bar {
  flex: 1;
  height: 10px;
  border-radius: 5px;
  background: var(--color-border);
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-danger) 0%,
    var(--color-warning) 50%,
    var(--color-success) 100%
  );
  border-radius: 5px;
}

.confidence-value {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
}

.confidence-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
}

.confidence-dim {
  text-align: center;
  padding: var(--space-2);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.confidence-dim strong {
  color: var(--color-text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### 4.5 SVG Dependency Graph

Vertical flow for sequential dependencies, horizontal for parallel. Boxes are 200x60px, 8px radius. Colors come from CSS custom properties.

```html
<svg
  class="dep-graph"
  viewBox="0 0 240 280"
  width="240"
  height="280"
  role="img"
  aria-label="Sequential dependency graph"
>
  <defs>
    <marker
      id="arrow"
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto"
    >
      <path d="M0,0 L10,5 L0,10 z" />
    </marker>
  </defs>

  <g class="node">
    <rect x="20" y="10" width="200" height="60" rx="8" ry="8" />
    <text x="120" y="45" text-anchor="middle">Task 1: Foundation</text>
  </g>
  <line x1="120" y1="70" x2="120" y2="100" marker-end="url(#arrow)" />

  <g class="node">
    <rect x="20" y="100" width="200" height="60" rx="8" ry="8" />
    <text x="120" y="135" text-anchor="middle">Task 2: Core logic</text>
  </g>
  <line x1="120" y1="160" x2="120" y2="190" marker-end="url(#arrow)" />

  <g class="node">
    <rect x="20" y="190" width="200" height="60" rx="8" ry="8" />
    <text x="120" y="225" text-anchor="middle">Task 3: UI integration</text>
  </g>
</svg>
```

```css
.dep-graph {
  display: block;
  margin: var(--space-3) auto;
  max-width: 100%;
  height: auto;
}

.dep-graph .node rect {
  fill: var(--color-accent-bg);
  stroke: var(--color-accent);
  stroke-width: 1.5;
}

.dep-graph .node text {
  fill: var(--color-text);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
}

.dep-graph line {
  stroke: var(--color-text-muted);
  stroke-width: 1.5;
}

.dep-graph marker path {
  fill: var(--color-text-muted);
}
```

For **parallel** tasks, lay nodes out horizontally with a single source node fanning out:

```html
<svg
  class="dep-graph"
  viewBox="0 0 680 200"
  width="680"
  height="200"
  role="img"
  aria-label="Parallel dependency graph"
>
  <defs>
    <marker
      id="arrow-p"
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto"
    >
      <path d="M0,0 L10,5 L0,10 z" />
    </marker>
  </defs>
  <g class="node">
    <rect x="240" y="10" width="200" height="60" rx="8" ry="8" />
    <text x="340" y="45" text-anchor="middle">Setup</text>
  </g>
  <line x1="340" y1="70" x2="120" y2="120" marker-end="url(#arrow-p)" />
  <line x1="340" y1="70" x2="340" y2="120" marker-end="url(#arrow-p)" />
  <line x1="340" y1="70" x2="560" y2="120" marker-end="url(#arrow-p)" />
  <g class="node">
    <rect x="20" y="120" width="200" height="60" rx="8" ry="8" />
    <text x="120" y="155" text-anchor="middle">Task A</text>
  </g>
  <g class="node">
    <rect x="240" y="120" width="200" height="60" rx="8" ry="8" />
    <text x="340" y="155" text-anchor="middle">Task B</text>
  </g>
  <g class="node">
    <rect x="460" y="120" width="200" height="60" rx="8" ry="8" />
    <text x="560" y="155" text-anchor="middle">Task C</text>
  </g>
</svg>
```

### 4.6 Code Blocks

```html
<div class="code-block">
  <div class="code-header">
    <span class="code-lang">typescript</span>
    <button class="copy-btn" data-copy="code-1" type="button">Copy</button>
  </div>
  <pre><code id="code-1">export function greet(name: string) {
  return `Hello, ${name}!`;
}</code></pre>
</div>
```

```css
.code-block {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin: var(--space-3) 0;
  background: var(--color-surface);
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.code-lang {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: lowercase;
}

.copy-btn {
  font-family: var(--font-sans);
  font-size: 12px;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.copy-btn:hover {
  background: var(--color-accent-bg);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.copy-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.code-block pre {
  margin: 0;
  padding: var(--space-3);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.5;
}

.code-block code {
  font-family: inherit;
  color: var(--color-text);
  background: none;
  padding: 0;
}
```

### 4.7 Scope Badges

```html
<div class="scope-in">
  <strong>In scope:</strong> Add OAuth login flow
  <div class="scope-reason">Required for the launch milestone.</div>
</div>

<div class="scope-out">
  <strong>Out of scope:</strong> SAML federation
  <div class="scope-reason">
    Tracked in follow-up RFC; needs separate review.
  </div>
</div>
```

```css
.scope-in,
.scope-out {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  margin: var(--space-2) 0;
  border-left: 4px solid;
  font-size: 14px;
}

.scope-in {
  background: var(--color-success-bg);
  border-left-color: var(--color-success);
}

.scope-out {
  background: var(--color-danger-bg);
  border-left-color: var(--color-danger);
}

.scope-reason {
  color: var(--color-text-muted);
  font-size: 13px;
  margin-top: var(--space-1);
}
```

### 4.8 File Badges

Inline badges for file change indicators.

```html
<p>
  Touch
  <span class="file-new">src/auth/login.ts</span>,
  <span class="file-mod">src/router.ts</span>, and
  <span class="file-del">src/legacy/session.ts</span>.
</p>
```

```css
.file-new,
.file-mod,
.file-del {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  border: 1px solid;
  white-space: nowrap;
}

.file-new {
  background: var(--color-success-bg);
  color: var(--color-success);
  border-color: var(--color-success);
}

.file-new::before {
  content: '+ ';
  font-weight: 700;
}

.file-mod {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.file-mod::before {
  content: '~ ';
  font-weight: 700;
}

.file-del {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.file-del::before {
  content: '− ';
  font-weight: 700;
}
```

### 4.9 Feedback Cards

3-column grid for the playground → experiment → check command flow.

```html
<div class="feedback-grid">
  <div class="feedback-card feedback-playground">
    <h4>Playground</h4>
    <p>Try the new flow in the local sandbox.</p>
    <code>pnpm playground</code>
  </div>
  <div class="feedback-card feedback-experiment">
    <h4>Experiment</h4>
    <p>Run the scripted experiment to capture metrics.</p>
    <code>pnpm experiment auth-v2</code>
  </div>
  <div class="feedback-card feedback-check">
    <h4>Check</h4>
    <p>Verify the diff against the contract.</p>
    <code>pnpm check</code>
  </div>
</div>
```

```css
.feedback-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  margin: var(--space-4) 0;
}

.feedback-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-accent);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.feedback-card h4 {
  margin: 0 0 var(--space-2) 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.feedback-card p {
  margin: 0 0 var(--space-2) 0;
  font-size: 14px;
}

.feedback-card code {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-2);
}

.feedback-playground {
  border-top-color: var(--color-accent);
}
.feedback-experiment {
  border-top-color: var(--color-warning);
}
.feedback-check {
  border-top-color: var(--color-success);
}
```

### 4.10 Copy Buttons

See JS in Section 6. HTML pattern is shown in the Code Block component (4.6) — every `data-copy="ID"` must target an element with that exact `id`.

### 4.11 Scope Slider

Interactive range input that shows/hides scope items based on the selected tier (MVP / Full / Stretch). This is the **one** exception to "clipboard only" JS — the slider needs a small input listener to toggle item visibility. Each `.scope-item` carries a `data-tier` attribute: `0` = MVP, `1` = Full, `2` = Stretch. Items at or below the selected tier are visible; items above are hidden. Re-use the existing `.scope-in` / `.scope-out` classes for the in/out styling.

```html
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
    <div class="scope-item scope-in" data-tier="0">
      {MVP item — always visible}
    </div>
    <div class="scope-item scope-in" data-tier="1">
      {Full item — visible at Full+}
    </div>
    <div class="scope-item scope-out" data-tier="2">
      {Stretch item — visible at Stretch only}
    </div>
  </div>
</div>
```

```css
.scope-slider {
  margin: var(--space-4) 0;
}

.scope-slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.scope-slider-header label {
  font-weight: 600;
}

.scope-slider-header output {
  font-weight: 600;
  color: var(--color-accent);
  padding: 2px 8px;
  background: var(--color-accent-bg);
  border-radius: var(--radius-sm);
  font-size: 0.85em;
}

#scope-range {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-border);
  border-radius: 3px;
  outline: none;
}

#scope-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: var(--color-accent);
  border-radius: 50%;
  cursor: pointer;
}

.scope-tier-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}
```

JS (paste alongside the clipboard snippet in the `<script>` block — see Section 6):

```javascript
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
```

### 4.12 Implementation Notes

Styles for the `implementation-notes-phase-{N}.html` log written during execute-spec.

```css
.note-entry {
  padding: var(--space-3);
  margin: var(--space-3) 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-md);
}

.note-entry h3 {
  margin: 0 0 var(--space-2) 0;
  font-size: 1em;
}

.note-entry dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-1) var(--space-3);
  margin: 0;
  font-size: 0.9em;
}

.note-entry dt {
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.note-entry dd {
  margin: 0;
}
```

---

## 5. Print Styles

```css
@media print {
  body {
    font-size: 11pt;
    max-width: none;
    color: #000;
    background: #fff;
  }

  /* Show all tab panels, hide tab UI */
  .tabs > label,
  .tabs > input[type='radio'] {
    display: none !important;
  }
  .tabs > .tab-panel {
    display: block !important;
    border-top: none !important;
    page-break-inside: avoid;
  }

  /* Hide copy buttons */
  .copy-btn {
    display: none !important;
  }

  /* Force details open */
  details {
    display: block;
  }
  details > summary {
    list-style: none;
  }
  details > summary::before {
    display: none;
  }
  details:not([open]) > *:not(summary) {
    display: block !important;
  }

  /* Avoid splitting key blocks */
  .code-block,
  .data-table,
  .confidence,
  .feedback-card,
  .dep-graph {
    page-break-inside: avoid;
  }

  a {
    color: #000;
    text-decoration: underline;
  }
}
```

---

## 6. JavaScript — Clipboard and Scope Slider Only

Append once at the bottom of `<body>`. **JS exceptions: clipboard copy AND scope slider interaction — no other JS** belongs in an artifact. The scope slider block is a no-op when the artifact does not include a `#scope-range` element (the `if (scopeRange)` guard handles that), so it is safe to include in every artifact.

```javascript
/* Clipboard */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.copy);
    navigator.clipboard.writeText(target.textContent).then(() => {
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = 'Copy'), 2000);
    });
  });
});

/* Scope slider */
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
```

---

## 7. Authoring Checklist

Before saving any artifact, verify:

- [ ] One file, all CSS + JS inlined, no external requests.
- [ ] `<html data-theme="auto">` set on the root.
- [ ] Token block from Section 2 present **verbatim**.
- [ ] Layout CSS from Section 3 present.
- [ ] Component CSS only for components used in the artifact.
- [ ] Every tab group has a unique `name` attribute.
- [ ] Every `.copy-btn` has a matching `id` target.
- [ ] No hardcoded colors, spacing, or radii outside the token block.
- [ ] SVGs reference CSS custom properties for fill/stroke.
- [ ] Print CSS included.
- [ ] Page renders correctly in both light and dark OS themes.
- [ ] Tab through interactive elements — focus is visible everywhere.
