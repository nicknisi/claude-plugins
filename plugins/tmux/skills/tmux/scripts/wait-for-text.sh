#!/usr/bin/env bash
set -uo pipefail

usage() {
  cat <<'USAGE'
Usage: wait-for-text.sh -t target [-p success] [-e error] [--idle N] [options]

Poll a tmux pane and stop as soon as a condition is met. Use this to
synchronize with interactive tools instead of guessing at sleeps.

Conditions (combine freely; first to hit wins):
  -p, --pattern   success regex  -> exit 0, print the matching line
  -e, --error     failure regex  -> exit 3, print the matching line (fail fast,
                  e.g. an error string so a crash doesn't burn the full timeout)
      --idle N    succeed once the pane produces no new output for N seconds
                  (good for builds/installs with no known completion string)

Options:
  -t, --target    tmux target (session:window.pane), required
  -S, --socket    tmux socket path (tmux -S); omit to use $TMUX/default
  -F, --fixed     treat -p/-e as fixed strings (grep -F) instead of regex
  -T, --timeout   overall seconds to wait (integer, default: 15)
  -i, --interval  poll interval seconds (default: 0.5)
  -l, --lines     history lines to inspect (integer, default: 1000)
  -h, --help      show this help

At least one of -p, -e, or --idle is required.
Exit codes: 0 success/idle reached, 1 timeout, 3 error pattern matched.

Examples:
  wait-for-text.sh -t web:1.2 -p 'Local:' -e 'Error|EADDRINUSE' -T 30
  wait-for-text.sh -t build:0.0 --idle 3 -T 120
USAGE
}

target=""
socket=""
success_pattern=""
error_pattern=""
idle=""
grep_flag="-E"
timeout=15
interval=0.5
lines=1000

while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--target)   target="${2-}"; shift 2 ;;
    -S|--socket)   socket="${2-}"; shift 2 ;;
    -p|--pattern)  success_pattern="${2-}"; shift 2 ;;
    -e|--error)    error_pattern="${2-}"; shift 2 ;;
    --idle)        idle="${2-}"; shift 2 ;;
    -F|--fixed)    grep_flag="-F"; shift ;;
    -T|--timeout)  timeout="${2-}"; shift 2 ;;
    -i|--interval) interval="${2-}"; shift 2 ;;
    -l|--lines)    lines="${2-}"; shift 2 ;;
    -h|--help)     usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "$target" ]]; then echo "target is required" >&2; usage; exit 1; fi
if [[ -z "$success_pattern" && -z "$error_pattern" && -z "$idle" ]]; then
  echo "provide at least one of -p, -e, or --idle" >&2; usage; exit 1
fi
if ! [[ "$timeout" =~ ^[0-9]+$ ]]; then echo "timeout must be an integer" >&2; exit 1; fi
if ! [[ "$lines" =~ ^[0-9]+$ ]]; then echo "lines must be an integer" >&2; exit 1; fi
if [[ -n "$idle" ]] && ! [[ "$idle" =~ ^[0-9]+$ ]]; then echo "--idle must be an integer" >&2; exit 1; fi
if ! command -v tmux >/dev/null 2>&1; then echo "tmux not found in PATH" >&2; exit 1; fi

tmux_pre=(tmux)
[[ -n "$socket" ]] && tmux_pre=(tmux -S "$socket")

start_epoch=$(date +%s)
deadline=$((start_epoch + timeout))
last_sig=""
last_change=$start_epoch

while true; do
  pane_text="$("${tmux_pre[@]}" capture-pane -p -J -t "$target" -S "-${lines}" 2>/dev/null || true)"

  # Fail fast on the error pattern.
  if [[ -n "$error_pattern" ]]; then
    match="$(printf '%s\n' "$pane_text" | grep $grep_flag -- "$error_pattern" | tail -1 || true)"
    if [[ -n "$match" ]]; then
      echo "error pattern matched in $target: $match" >&2
      exit 3
    fi
  fi

  # Succeed on the success pattern.
  if [[ -n "$success_pattern" ]]; then
    match="$(printf '%s\n' "$pane_text" | grep $grep_flag -- "$success_pattern" | tail -1 || true)"
    if [[ -n "$match" ]]; then
      printf '%s\n' "$match"
      exit 0
    fi
  fi

  # Succeed once output has been stable for N seconds.
  if [[ -n "$idle" ]]; then
    sig="$(printf '%s' "$pane_text" | cksum)"
    now=$(date +%s)
    if [[ "$sig" != "$last_sig" ]]; then
      last_sig="$sig"; last_change=$now
    elif (( now - last_change >= idle )); then
      echo "pane $target idle for ${idle}s" >&2
      exit 0
    fi
  fi

  now=$(date +%s)
  if (( now >= deadline )); then
    echo "Timed out after ${timeout}s on $target" >&2
    echo "Last ${lines} lines:" >&2
    printf '%s\n' "$pane_text" >&2
    exit 1
  fi
  sleep "$interval"
done
