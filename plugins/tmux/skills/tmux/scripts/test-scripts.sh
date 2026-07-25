#!/usr/bin/env bash
# Smoke tests for the tmux skill's scripts, run against a throwaway tmux server
# on a private socket. No dependencies beyond bash and tmux.
#
#   bash plugins/tmux/skills/tmux/scripts/test-scripts.sh
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOCK="${TMPDIR:-/tmp}/tmux-skill-test-$$.sock"
pass=0
fail=0

cleanup() { tmux -S "$SOCK" kill-server 2>/dev/null; }
trap cleanup EXIT

ok()   { printf '  ok   %s\n' "$1"; pass=$((pass + 1)); }
bad()  { printf '  FAIL %s\n     %s\n' "$1" "$2"; fail=$((fail + 1)); }
check() { # check <name> <expected> <actual>
  if [[ "$3" == *"$2"* ]]; then ok "$1"; else bad "$1" "expected to contain '$2', got: $3"; fi
}
absent() { # absent <name> <needle> <actual>
  if [[ "$3" != *"$2"* ]]; then ok "$1"; else bad "$1" "expected NOT to contain '$2', got: $3"; fi
}

command -v tmux >/dev/null || { echo "tmux not installed; skipping" >&2; exit 0; }

tmux -S "$SOCK" kill-server 2>/dev/null
tmux -S "$SOCK" new-session -d -s test -x 200 -y 50
# Pane indices depend on base-index, so discover rather than assume :0.0.
TARGET="$(tmux -S "$SOCK" list-panes -a -F '#{session_name}:#{window_index}.#{pane_index}' | head -1)"

echo "run-in-pane.sh"

out="$(bash "$HERE/run-in-pane.sh" -S "$SOCK" -t "$TARGET" -T 20 -- printf '[%s]\n' 'fix: two words' 2>&1)"
check "multi-word argument survives re-quoting" '[fix: two words]' "$out"

# Assert on joined output, not on substrings of the command echo: a failing
# shell prints "command not found: printf alpha; printf beta", which contains
# both words and would pass a naive contains-check.
out="$(bash "$HERE/run-in-pane.sh" -S "$SOCK" -t "$TARGET" -T 20 -- 'printf alpha; printf beta; echo' 2>&1)"
check "single-argument compound command actually executes" 'alphabeta' "$out"
absent "single-argument compound command is not mangled into one word" 'command not found' "$out"

out="$(bash "$HERE/run-in-pane.sh" -S "$SOCK" -t "$TARGET" -T 20 -- 2>&1)"; rc=$?
if [[ $rc -ne 0 ]]; then ok "bare -- exits non-zero"; else bad "bare -- exits non-zero" "exit $rc"; fi
check "bare -- explains itself" 'no command given after --' "$out"

out="$(bash "$HERE/run-in-pane.sh" -S "$SOCK" -T 20 -- echo hi 2>&1)"; rc=$?
if [[ $rc -ne 0 ]]; then ok "missing --target exits non-zero"; else bad "missing --target exits non-zero" "exit $rc"; fi

echo "find-sessions.sh"

tmux -S "$SOCK" new-session -d -s 'has|pipe' 2>/dev/null
out="$(bash "$HERE/find-sessions.sh" -S "$SOCK" 2>&1)"
check "lists the session" 'test' "$out"
check "reports attach state, not a literal escape" 'detached' "$out"
check "renders a real creation time" "$(date +%Y)" "$out"
if [[ "$out" != *'\t'* ]]; then ok "no literal backslash-t in output"; else bad "no literal backslash-t in output" "$out"; fi
check "session name containing | stays intact" 'has|pipe' "$out"

echo
printf '%d passed, %d failed\n' "$pass" "$fail"
[[ $fail -eq 0 ]]
