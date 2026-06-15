#!/usr/bin/env bash
set -uo pipefail

usage() {
  cat <<'USAGE'
Usage: run-in-pane.sh -t target [options] -- <command...>

Send a command to a tmux pane running a shell, wait for it to FINISH, and print
only that command's output. Exits with the command's own exit code, so callers
can branch on success/failure. Prompt-agnostic: works regardless of how the
pane's shell prompt is themed.

Options:
  -t, --target    tmux target (session:window.pane), required
  -S, --socket    tmux socket path (passed to tmux -S); omit to use $TMUX/default
  -T, --timeout   max seconds to wait for completion (integer, default: 30)
  -i, --interval  poll interval seconds (default: 0.4)
  -l, --lines     scrollback lines to scan when slicing output (default: 2000)
  --force         send even if the pane is running a non-shell program
  -h, --help      show this help

Everything after `--` is the command, sent literally to the pane.

Example:
  run-in-pane.sh -t projects:3.2 -- pnpm vitest run src/auth
USAGE
}

target=""
socket=""
timeout=30
interval=0.4
lines=2000
force=false
cmd=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--target)   target="${2-}"; shift 2 ;;
    -S|--socket)   socket="${2-}"; shift 2 ;;
    -T|--timeout)  timeout="${2-}"; shift 2 ;;
    -i|--interval) interval="${2-}"; shift 2 ;;
    -l|--lines)    lines="${2-}"; shift 2 ;;
    --force)       force=true; shift ;;
    -h|--help)     usage; exit 0 ;;
    --)            shift; cmd="$*"; break ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "$target" || -z "$cmd" ]]; then
  echo "target and a command (after --) are required" >&2
  usage; exit 1
fi
if ! [[ "$timeout" =~ ^[0-9]+$ ]]; then echo "timeout must be an integer" >&2; exit 1; fi
if ! [[ "$lines" =~ ^[0-9]+$ ]]; then echo "lines must be an integer" >&2; exit 1; fi
if ! command -v tmux >/dev/null 2>&1; then echo "tmux not found in PATH" >&2; exit 1; fi

tmux_pre=(tmux)
[[ -n "$socket" ]] && tmux_pre=(tmux -S "$socket")

# Refuse to type into an editor/pager unless forced — those keystrokes would be
# interpreted as editor commands, not a shell command line.
running="$("${tmux_pre[@]}" display-message -p -t "$target" '#{pane_current_command}' 2>/dev/null || echo "")"
case "$running" in
  vi|vim|nvim|nano|emacs|emacsclient|less|more|most|man|view|bat|top|htop|btop|tig|lazygit|gitui|fzf|ranger|vifm)
    if [[ "$force" != true ]]; then
      echo "Pane $target is running '$running' (not a shell). Refusing to send a command." >&2
      echo "If you really mean to, re-run with --force, or pick a shell pane." >&2
      exit 2
    fi ;;
esac

# Unique markers so we never collide with earlier runs or with the pane's own
# echo of the typed input line.
tok="${RANDOM}${RANDOM}$$"
mstart="__CRP_START_${tok}__"
mend="__CRP_END_${tok}__"

# printf output lands the marker ALONE on its line (leading \n); the echoed
# input line has the marker embedded mid-line, so ^marker$ matches only output.
payload="printf '\n${mstart}\n'; ${cmd}; printf '\n${mend} exit:%s\n' \$?"

"${tmux_pre[@]}" send-keys -t "$target" -l -- "$payload"
"${tmux_pre[@]}" send-keys -t "$target" Enter

start_epoch=$(date +%s)
deadline=$((start_epoch + timeout))
pane_text=""
while true; do
  pane_text="$("${tmux_pre[@]}" capture-pane -p -J -t "$target" -S "-${lines}" 2>/dev/null || true)"
  if printf '%s\n' "$pane_text" | grep -Eq "^${mend} exit:[0-9]+"; then
    break
  fi
  if (( $(date +%s) >= deadline )); then
    echo "Timed out after ${timeout}s waiting for command to finish in $target" >&2
    echo "(Command may still be running; sentinel ${mend} not seen.)" >&2
    exit 124
  fi
  sleep "$interval"
done

# Exit code from the end marker line.
code="$(printf '%s\n' "$pane_text" | grep -E "^${mend} exit:[0-9]+" | tail -1 | sed -E 's/.*exit:([0-9]+).*/\1/')"

# Slice output strictly between the standalone start and end marker lines.
printf '%s\n' "$pane_text" | awk -v s="$mstart" -v e="$mend" '
  $0 == s { cap = 1; buf = ""; next }
  cap && $0 ~ "^" e " exit:" { cap = 0; gsub(/\n+$/, "\n", buf); printf "%s", buf; next }
  cap { buf = buf $0 "\n" }
'

exit "${code:-0}"
