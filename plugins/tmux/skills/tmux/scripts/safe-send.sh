#!/usr/bin/env bash
set -uo pipefail

usage() {
  cat <<'USAGE'
Usage: safe-send.sh -t target [options] -- <text-or-keys...>

A guarded wrapper around `tmux send-keys`. Before sending, it checks what the
pane is running and REFUSES if it's an editor, pager, or full-screen TUI — where
stray keystrokes would be interpreted as commands and could trash the user's
work. REPLs and shells are allowed (driving them is a legitimate use).

Reading a pane is always safe; this guard only applies to writes.

Options:
  -t, --target   tmux target (session:window.pane), required
  -S, --socket   tmux socket path (tmux -S); omit to use $TMUX/default
  --keys         send arguments as tmux KEY NAMES (e.g. C-c Enter Escape)
                 instead of literal text (the default)
  --enter        append Enter after literal text (ignored with --keys)
  --force        send anyway, even into a denylisted program
  -h, --help     show this help

Everything after `--` is the payload.

Examples:
  safe-send.sh -t web:1.3 --enter -- 'pnpm dev'      # type a command + Enter
  safe-send.sh -t web:1.3 --keys -- C-c              # interrupt
  safe-send.sh -t edit:1.2 -- ':wq'                  # refused (nvim) unless --force
USAGE
}

target=""
socket=""
mode="literal"   # literal | keys
press_enter=false
force=false
payload=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--target) target="${2-}"; shift 2 ;;
    -S|--socket) socket="${2-}"; shift 2 ;;
    --keys)      mode="keys"; shift ;;
    --enter)     press_enter=true; shift ;;
    --force)     force=true; shift ;;
    -h|--help)   usage; exit 0 ;;
    --)          shift; payload=("$@"); break ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "$target" || ${#payload[@]} -eq 0 ]]; then
  echo "target and a payload (after --) are required" >&2
  usage; exit 1
fi
if ! command -v tmux >/dev/null 2>&1; then echo "tmux not found in PATH" >&2; exit 1; fi

tmux_pre=(tmux)
[[ -n "$socket" ]] && tmux_pre=(tmux -S "$socket")

running="$("${tmux_pre[@]}" display-message -p -t "$target" '#{pane_current_command}' 2>/dev/null || echo "")"
if [[ -z "$running" ]]; then
  echo "No such pane: $target (or tmux server unreachable)." >&2
  exit 1
fi

# Programs where keystrokes are destructive or meaningless as shell input.
# Deliberately NOT including REPLs (node, python, etc.) — driving those is fine.
case "$running" in
  vi|vim|nvim|nano|emacs|emacsclient|less|more|most|man|view|bat|tig|lazygit|gitui|fzf|ranger|vifm|top|htop|btop|watch|ssh|mosh)
    if [[ "$force" != true ]]; then
      echo "Refusing to send to $target: it is running '$running' (editor/pager/TUI)." >&2
      echo "Keystrokes there are not shell commands. Use --force to override, or" >&2
      echo "open a dedicated window for your command (tmux new-window)." >&2
      exit 2
    fi
    echo "warning: --force sending into '$running' on $target" >&2 ;;
esac

if [[ "$mode" == "keys" ]]; then
  "${tmux_pre[@]}" send-keys -t "$target" -- "${payload[@]}"
else
  "${tmux_pre[@]}" send-keys -t "$target" -l -- "${payload[*]}"
  [[ "$press_enter" == true ]] && "${tmux_pre[@]}" send-keys -t "$target" Enter
fi

echo "sent to $target (running '$running')" >&2
