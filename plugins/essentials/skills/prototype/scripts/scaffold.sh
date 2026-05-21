#!/usr/bin/env bash
set -euo pipefail

# Prototype scaffolder — generates the boilerplate so Claude only writes the interesting parts.
# Usage:
#   scaffold.sh ui  --variants 3 --route /settings --framework next
#   scaffold.sh ui  --variants 2 --route /prototype/dashboard --framework react-router
#   scaffold.sh tui --name checkout-flow --lang ts
#   scaffold.sh tui --name checkout-flow --lang py

MODE="${1:?Usage: scaffold.sh <ui|tui> [options]}"
shift

# Defaults
VARIANTS=3
ROUTE=""
FRAMEWORK="next"
NAME=""
LANG="ts"
OUTDIR="."

while [[ $# -gt 0 ]]; do
  case "$1" in
    --variants)  VARIANTS="$2"; shift 2 ;;
    --route)     ROUTE="$2"; shift 2 ;;
    --framework) FRAMEWORK="$2"; shift 2 ;;
    --name)      NAME="$2"; shift 2 ;;
    --lang)      LANG="$2"; shift 2 ;;
    --outdir)    OUTDIR="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

generate_variant_letters() {
  local n=$1
  local i=0
  while [ $i -lt "$n" ]; do
    printf '%b' "\\$(printf '%03o' $((65 + i)))"
    i=$((i + 1))
  done
}

scaffold_ui() {
  local letters
  letters=$(generate_variant_letters "$VARIANTS")

  mkdir -p "$OUTDIR/__prototype"

  # Generate PrototypeSwitcher component
  case "$FRAMEWORK" in
    next|react-router|react|vite)
      cat > "$OUTDIR/__prototype/PrototypeSwitcher.tsx" << 'SWITCHER_EOF'
import { useCallback, useEffect } from "react";

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
SWITCHER_EOF

      # Generate variant shell files
      for letter in $(echo "$letters" | grep -o .); do
        cat > "$OUTDIR/__prototype/Variant${letter}.tsx" << VARIANT_EOF
interface Props {
  // Accept whatever data the host page provides
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
VARIANT_EOF
      done

      # Generate the switcher wiring
      local imports=""
      local renders=""
      for letter in $(echo "$letters" | grep -o .); do
        imports="${imports}import { Variant${letter} } from \"./__prototype/Variant${letter}\";\n"
        renders="${renders}      {variant === \"${letter}\" && <Variant${letter} {...data} />}\n"
      done

      cat > "$OUTDIR/__prototype/wiring-example.tsx" << WIRING_EOF
// Copy this into your route file and adapt to your framework's router.
// Delete this file after wiring up.

// Imports to add:
// ${imports}// import { PrototypeSwitcher } from "./__prototype/PrototypeSwitcher";

// Inside your component, read the variant param and render:
//
// const variant = searchParams.get("variant") ?? "A";
//
// return (
//   <>
//     {/* existing page content above */}
// ${renders}//     <PrototypeSwitcher
//       variants={[$(for letter in $(echo "$letters" | grep -o .); do printf '"%s", ' "$letter"; done | sed 's/, $//')]}
//       current={variant}
//       onChange={(v) => router.replace(\`?variant=\${v}\`)}
//     />
//   </>
// );
WIRING_EOF
      ;;

    svelte|sveltekit)
      echo "Svelte scaffolding: create __prototype/ with Svelte components manually." >&2
      echo "The pattern is identical — variants as components, switcher reads \$page.url.searchParams." >&2
      mkdir -p "$OUTDIR/__prototype"
      ;;

    vue)
      echo "Vue scaffolding: create __prototype/ with Vue SFCs manually." >&2
      echo "The pattern is identical — variants as components, switcher reads route.query.variant." >&2
      mkdir -p "$OUTDIR/__prototype"
      ;;

    *)
      echo "Unknown framework: $FRAMEWORK. Generating React by default." >&2
      FRAMEWORK=next scaffold_ui
      return
      ;;
  esac

  echo "Scaffolded UI prototype in $OUTDIR/__prototype/"
  echo "  - PrototypeSwitcher component"
  echo "  - $VARIANTS variant shells ($(echo "$letters" | grep -o . | tr '\n' ',' | sed 's/,$//'))"
  echo "  - Wiring example"
  echo ""
  echo "Next: fill in each Variant file with a structurally different layout."
}

scaffold_tui() {
  NAME="${NAME:?--name is required for tui mode}"
  mkdir -p "$OUTDIR/__prototype-${NAME}"

  case "$LANG" in
    ts|typescript)
      # Logic module (the portable part)
      cat > "$OUTDIR/__prototype-${NAME}/logic.ts" << 'LOGIC_EOF'
// The portable logic module — this is the deliverable.
// Keep it pure: no I/O, no terminal code, no console.log for control flow.
// The TUI shell imports this; nothing flows the other direction.

export interface State {
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
LOGIC_EOF

      # TUI shell (the throwaway part)
      cat > "$OUTDIR/__prototype-${NAME}/shell.ts" << 'SHELL_EOF'
import { initialState, reduce, legalActions, type State, type Action } from "./logic";

let state: State = initialState();

function render() {
  console.clear();

  // State display
  console.log("\x1b[1m── State ──────────────────────────\x1b[0m");
  for (const [key, value] of Object.entries(state)) {
    console.log(`  \x1b[1m${key}:\x1b[0m ${JSON.stringify(value)}`);
  }

  // Available actions
  const legal = legalActions(state);
  console.log("\n\x1b[1m── Actions ────────────────────────\x1b[0m");
  const keymap: Record<string, Action["type"]> = {};
  for (const action of legal) {
    const key = action[0];
    keymap[key] = action;
    console.log(`  \x1b[1m[${key}]\x1b[0m ${action}`);
  }
  console.log("  \x1b[1m[q]\x1b[0m quit");
  console.log("\x1b[2m──────────────────────────────────\x1b[0m");

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
    if (key === "q" || key === "") {
      process.stdout.write("\n");
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
SHELL_EOF

      echo "Scaffolded TUI prototype in $OUTDIR/__prototype-${NAME}/"
      echo "  - logic.ts  (portable module — the deliverable)"
      echo "  - shell.ts  (throwaway TUI shell)"
      echo ""
      echo "Run with: npx tsx $OUTDIR/__prototype-${NAME}/shell.ts"
      echo "Next: replace the example State/Action/reduce with your actual domain logic."
      ;;

    py|python)
      cat > "$OUTDIR/__prototype-${NAME}/logic.py" << 'LOGIC_EOF'
"""Portable logic module — this is the deliverable.
Keep it pure: no I/O, no terminal code, no print() for control flow.
The TUI shell imports this; nothing flows the other direction."""

from dataclasses import dataclass, replace
from typing import Literal

Action = Literal["increment", "decrement", "reset"]

@dataclass(frozen=True)
class State:
    # TODO: Define your state shape
    count: int = 0

def initial_state() -> State:
    return State()

def reduce(state: State, action: Action) -> State:
    match action:
        case "increment":
            return replace(state, count=state.count + 1)
        case "decrement":
            return replace(state, count=state.count - 1)
        case "reset":
            return initial_state()

def legal_actions(state: State) -> list[Action]:
    # TODO: Return only actions valid in the current state
    return ["increment", "decrement", "reset"]
LOGIC_EOF

      cat > "$OUTDIR/__prototype-${NAME}/shell.py" << 'SHELL_EOF'
"""Throwaway TUI shell. Drives the logic module interactively."""

import sys
import tty
import termios
from logic import State, initial_state, reduce, legal_actions

state = initial_state()

BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"

def render(state: State) -> dict[str, str]:
    print("\033[2J\033[H", end="")

    print(f"{BOLD}── State ──────────────────────────{RESET}")
    for key, value in vars(state).items():
        print(f"  {BOLD}{key}:{RESET} {value}")

    legal = legal_actions(state)
    print(f"\n{BOLD}── Actions ────────────────────────{RESET}")
    keymap: dict[str, str] = {}
    for action in legal:
        key = action[0]
        keymap[key] = action
        print(f"  {BOLD}[{key}]{RESET} {action}")
    print(f"  {BOLD}[q]{RESET} quit")
    print(f"{DIM}──────────────────────────────────{RESET}")

    return keymap

def getch() -> str:
    fd = sys.stdin.fileno()
    old = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        return sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old)

def main():
    global state
    keymap = render(state)

    while True:
        ch = getch()
        if ch in ("q", "\x03"):
            print()
            break
        action = keymap.get(ch)
        if action:
            state = reduce(state, action)
            keymap = render(state)

if __name__ == "__main__":
    main()
SHELL_EOF

      echo "Scaffolded TUI prototype in $OUTDIR/__prototype-${NAME}/"
      echo "  - logic.py  (portable module — the deliverable)"
      echo "  - shell.py  (throwaway TUI shell)"
      echo ""
      echo "Run with: python $OUTDIR/__prototype-${NAME}/shell.py"
      echo "Next: replace the example State/Action/reduce with your actual domain logic."
      ;;

    *)
      echo "Unsupported language: $LANG. Use ts or py." >&2
      exit 1
      ;;
  esac
}

case "$MODE" in
  ui)  scaffold_ui ;;
  tui) scaffold_tui ;;
  *)   echo "Unknown mode: $MODE. Use 'ui' or 'tui'." >&2; exit 1 ;;
esac
