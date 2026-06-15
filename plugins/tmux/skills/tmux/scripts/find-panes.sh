#!/usr/bin/env bash
set -uo pipefail

usage() {
  cat <<'USAGE'
Usage: find-panes.sh [scope] [options]

List tmux panes with location, running command, cwd, and (optionally) the TCP
ports they're listening on. Defaults to the panes in YOUR current window when
run inside tmux — i.e. the sibling splits for the project you're working on.

Scope (pick one; default = current window if inside tmux, else whole server):
  -w, --window     panes in the current window (siblings) [default in tmux]
      --session    panes in the current session
  -A, --all        every pane on the server

Socket (default: $TMUX / the default socket):
  -S, --socket     tmux socket path (tmux -S)
  -L, --socket-name  tmux socket name (tmux -L)

Options:
  -p, --ports      resolve listening TCP ports per pane (needs lsof; slower)
  -q, --query      case-insensitive substring filter on the output line
  -h, --help       show this help

Examples:
  find-panes.sh                 # siblings in your window
  find-panes.sh --session -p    # whole session, with listening ports
  find-panes.sh -A -q vite      # every pane whose line mentions "vite"
USAGE
}

scope=""          # window | session | all (empty = auto)
socket_path=""
socket_name=""
ports=false
query=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -w|--window)      scope="window"; shift ;;
    --session)        scope="session"; shift ;;
    -A|--all)         scope="all"; shift ;;
    -S|--socket)      socket_path="${2-}"; shift 2 ;;
    -L|--socket-name) socket_name="${2-}"; shift 2 ;;
    -p|--ports)       ports=true; shift ;;
    -q|--query)       query="${2-}"; shift 2 ;;
    -h|--help)        usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if ! command -v tmux >/dev/null 2>&1; then echo "tmux not found in PATH" >&2; exit 1; fi

tmux_pre=(tmux)
[[ -n "$socket_path" ]] && tmux_pre=(tmux -S "$socket_path")
[[ -n "$socket_name" ]] && tmux_pre=(tmux -L "$socket_name")

me="${TMUX_PANE:-}"

# Auto scope: current window when we know our pane, else whole server.
if [[ -z "$scope" ]]; then
  if [[ -n "$me" && -z "$socket_path" && -z "$socket_name" ]]; then scope="window"; else scope="all"; fi
fi

# Build the list-panes target args for the chosen scope.
list_args=()
case "$scope" in
  window)
    if [[ -z "$me" ]]; then echo "Not inside tmux (\$TMUX_PANE unset); use --all or --session." >&2; exit 1; fi
    list_args=(-t "$me") ;;
  session)
    sess="$("${tmux_pre[@]}" display-message -p -t "${me:-}" '#{session_name}' 2>/dev/null || true)"
    if [[ -z "$sess" ]]; then echo "Could not determine current session; use --all." >&2; exit 1; fi
    list_args=(-s -t "$sess") ;;
  all)
    list_args=(-a) ;;
esac

# pid -> all descendant pids (so we catch the real server under the shell).
descendants() {
  local pid="$1" k
  printf '%s\n' "$pid"
  for k in $(pgrep -P "$pid" 2>/dev/null || true); do descendants "$k"; done
}

ports_for_pane() {
  command -v lsof >/dev/null 2>&1 || { printf ''; return; }
  local ppid="$1" pids
  pids="$(descendants "$ppid" | sort -un | paste -sd, -)"
  [[ -z "$pids" ]] && { printf ''; return; }
  lsof -nP -iTCP -sTCP:LISTEN -a -p "$pids" 2>/dev/null \
    | awk 'NR>1 {print $9}' | sed -E 's/.*:([0-9]+)$/\1/' | grep -E '^[0-9]+$' \
    | sort -un | paste -sd, -
}

raw="$("${tmux_pre[@]}" list-panes "${list_args[@]}" \
  -F '#{pane_id}|#{session_name}:#{window_index}.#{pane_index}|#{pane_current_command}|#{pane_current_path}|#{pane_pid}' \
  2>/dev/null || true)"

if [[ -z "$raw" ]]; then
  echo "No panes found (scope: $scope)." >&2
  exit 1
fi

output=""
while IFS='|' read -r pid loc cmd cwd ppid; do
  [[ -z "$loc" ]] && continue
  line="  ${loc}  [${cmd}]  ${cwd}"
  if [[ "$ports" == true ]]; then
    p="$(ports_for_pane "$ppid")"
    [[ -n "$p" ]] && line="${line}  ports=${p}"
  fi
  [[ "$pid" == "$me" ]] && line="${line}  <-- you (Claude)"
  output+="${line}"$'\n'
done <<< "$raw"

if [[ -n "$query" ]]; then
  output="$(printf '%s' "$output" | grep -i -- "$query" || true)"
  [[ -z "$output" ]] && { echo "No panes match query: $query" >&2; exit 0; }
fi

printf 'Panes (scope: %s):\n%s' "$scope" "$output"
