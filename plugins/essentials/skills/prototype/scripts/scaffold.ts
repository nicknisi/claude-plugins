import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    variants: { type: "string", default: "3" },
    framework: { type: "string", default: "next" },
    name: { type: "string" },
    outdir: { type: "string", default: "." },
  },
});

const mode = positionals[0];
if (!mode || !["ui", "tui"].includes(mode)) {
  console.error("Usage: scaffold.ts <ui|tui> [options]");
  console.error("  ui  --variants 3 --framework next --outdir ./src/app/settings");
  console.error("  tui --name checkout-flow --outdir ./src/checkout");
  process.exit(1);
}

const outdir = values.outdir!;

function variantLetters(n: number): string[] {
  return Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
}

function write(path: string, content: string) {
  writeFileSync(path, content, "utf8");
}

function scaffoldUI() {
  const n = Math.min(Math.max(parseInt(values.variants!, 10), 2), 5);
  const letters = variantLetters(n);
  const dir = join(outdir, "__prototype");
  mkdirSync(dir, { recursive: true });

  const framework = values.framework!;
  const isReact = ["next", "react-router", "react", "vite"].includes(framework);

  if (!isReact) {
    console.log(`${framework} scaffolding: __prototype/ created.`);
    console.log("The pattern is identical to React — variants as components, switcher reads a URL search param.");
    console.log("Adapt the generated React components to your framework.");
  }

  const clientDirective = framework === "next" ? `"use client";\n\n` : "";

  write(
    join(dir, "PrototypeSwitcher.tsx"),
    `${clientDirective}import { useCallback, useEffect } from "react";

interface Props {
  variants: string[];
  current: string;
  onChange: (variant: string) => void;
}

export function PrototypeSwitcher({ variants, current, onChange }: Props) {
  const idx = variants.indexOf(current);

  const cycle = useCallback(
    (dir: number) => {
      const next = (idx + dir + variants.length) % variants.length;
      onChange(variants[next]);
    },
    [idx, variants, onChange],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === "ArrowLeft") cycle(-1);
      if (e.key === "ArrowRight") cycle(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cycle]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 16px",
        borderRadius: 999,
        background: "#1a1a2e",
        color: "#e0e0e0",
        fontSize: 14,
        fontFamily: "system-ui, sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 99999,
        userSelect: "none",
      }}
    >
      <button onClick={() => cycle(-1)} style={btnStyle}>
        ←
      </button>
      <span style={{ minWidth: 80, textAlign: "center", fontWeight: 600 }}>
        Variant {current}
      </span>
      <button onClick={() => cycle(1)} style={btnStyle}>
        →
      </button>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid #444",
  borderRadius: 6,
  color: "#e0e0e0",
  padding: "4px 10px",
  cursor: "pointer",
  fontSize: 14,
};
`,
  );

  for (const letter of letters) {
    write(
      join(dir, `Variant${letter}.tsx`),
      `interface Props {
  [key: string]: unknown;
}

export function Variant${letter}(props: Props) {
  return (
    <div>
      <h2>Variant ${letter}</h2>
      {/* TODO: Replace with a structurally distinct layout */}
      <p>Implement a radically different approach here.</p>
    </div>
  );
}
`,
    );
  }

  const imports = letters
    .map((l) => `import { Variant${l} } from "./__prototype/Variant${l}";`)
    .join("\n");

  const renders = letters
    .map((l) => `      {variant === "${l}" && <Variant${l} {...data} />}`)
    .join("\n");

  const variantList = letters.map((l) => `"${l}"`).join(", ");

  write(
    join(dir, "wiring-example.tsx"),
    `// Copy this into your route file and adapt to your framework's router.
// Delete this file after wiring up.

// Imports to add:
// ${imports}
// import { PrototypeSwitcher } from "./__prototype/PrototypeSwitcher";

// Inside your component, read the variant param and render:
//
// const variant = searchParams.get("variant") ?? "A";
//
// return (
//   <>
//     {/* existing page content above */}
// ${renders}
//     <PrototypeSwitcher
//       variants={[${variantList}]}
//       current={variant}
//       onChange={(v) => router.replace(\`?variant=\${v}\`)}
//     />
//   </>
// );
`,
  );

  console.log(`Scaffolded UI prototype in ${dir}/`);
  console.log(`  - PrototypeSwitcher component`);
  console.log(`  - ${n} variant shells (${letters.join(", ")})`);
  console.log(`  - Wiring example`);
  console.log();
  console.log("Next: fill in each Variant file with a structurally different layout.");
}

function scaffoldTUI() {
  const name = values.name;
  if (!name) {
    console.error("--name is required for tui mode");
    process.exit(1);
  }

  const dir = join(outdir, `__prototype-${name}`);
  mkdirSync(dir, { recursive: true });

  write(
    join(dir, "logic.ts"),
    `export interface State {
  // TODO: Define your state shape
  count: number;
}

export type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };

export function initialState(): State {
  return { count: 0 };
}

export function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + 1 };
    case "decrement":
      return { ...state, count: state.count - 1 };
    case "reset":
      return initialState();
  }
}

export function legalActions(_state: State): Action["type"][] {
  // TODO: Return only actions that are valid in the current state
  return ["increment", "decrement", "reset"];
}
`,
  );

  write(
    join(dir, "shell.ts"),
    `import { initialState, reduce, legalActions, type State, type Action } from "./logic";

let state: State = initialState();

function render() {
  console.clear();

  console.log("\\x1b[1m── State ──────────────────────────\\x1b[0m");
  for (const [key, value] of Object.entries(state)) {
    console.log(\`  \\x1b[1m\${key}:\\x1b[0m \${JSON.stringify(value)}\`);
  }

  const legal = legalActions(state);
  console.log("\\n\\x1b[1m── Actions ────────────────────────\\x1b[0m");
  const keymap: Record<string, Action["type"]> = {};
  for (const action of legal) {
    const key = action[0];
    keymap[key] = action;
    console.log(\`  \\x1b[1m[\${key}]\\x1b[0m \${action}\`);
  }
  console.log("  \\x1b[1m[q]\\x1b[0m quit");
  console.log("\\x1b[2m──────────────────────────────────\\x1b[0m");

  return keymap;
}

async function main() {
  if (typeof process.stdin.setRawMode === "function") {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  let keymap = render();

  process.stdin.on("data", (key: string) => {
    if (key === "q" || key === "\\x03") {
      process.stdout.write("\\n");
      process.exit(0);
    }

    const action = keymap[key];
    if (action) {
      state = reduce(state, { type: action } as Action);
      keymap = render();
    }
  });
}

main();
`,
  );

  console.log(`Scaffolded TUI prototype in ${dir}/`);
  console.log(`  - logic.ts  (portable module — the deliverable)`);
  console.log(`  - shell.ts  (throwaway TUI shell)`);
  console.log();
  console.log(`Run with: npx tsx ${join(dir, "shell.ts")}`);
  console.log("Next: replace the example State/Action/reduce with your actual domain logic.");
}

if (mode === "ui") scaffoldUI();
else scaffoldTUI();
