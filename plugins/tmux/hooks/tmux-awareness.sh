#!/usr/bin/env bash
#
# SessionStart hook: make Claude aware when it is running inside a tmux pane.
#
# The user typically works one window per project, with Claude in one split and
# their editor / shells / dev servers in sibling splits of the SAME window. So
# the high-value context is the panes sharing Claude's window — surfaced here —
# plus a short summary of what else exists. Those surfaces live on the default
# tmux server ($TMUX), not on any private socket Claude might spawn.
#
# Stays silent (exit 0) when not in tmux, so non-tmux sessions are unaffected.

set -uo pipefail

# Drain stdin (SessionStart sends JSON we don't need).
cat >/dev/null 2>&1 || true

if [ -z "${TMUX:-}" ] || ! command -v tmux >/dev/null 2>&1; then
  exit 0
fi

socket="${TMUX%%,*}"
me="${TMUX_PANE:-}"

# Claude's own location.
loc="$(tmux display-message -p -t "$me" '#{session_name}:#{window_index}.#{pane_index}' 2>/dev/null || echo 'unknown')"
session="$(tmux display-message -p -t "$me" '#{session_name}' 2>/dev/null || echo '')"
winlabel="$(tmux display-message -p -t "$me" '#{window_index} (#{window_name})' 2>/dev/null || echo '?')"

# Sibling panes in Claude's window — the project's editor/shells/servers.
siblings="$(tmux list-panes -t "$me" \
  -F '#{pane_id}|#{session_name}:#{window_index}.#{pane_index}|#{pane_current_command}|#{pane_current_path}' 2>/dev/null \
  | awk -F'|' -v me="$me" '{ mark = ($1==me) ? "  <-- you (Claude)" : ""; printf "  %s  [%s]  %s%s\n", $2, $3, $4, mark }')"
[ -z "$siblings" ] && siblings="  (could not enumerate panes)"

# One-line summary of everything else, so Claude knows more exists without a dump.
other_wins=0
if [ -n "$session" ]; then
  wc_wins="$(tmux list-windows -t "$session" -F '#{window_index}' 2>/dev/null | grep -c . || echo 0)"
  other_wins=$(( wc_wins > 0 ? wc_wins - 1 : 0 ))
fi
all_sessions="$(tmux list-sessions -F '#{session_name}' 2>/dev/null || echo '')"
other_sessions="$(printf '%s\n' "$all_sessions" | grep -vxF "$session" 2>/dev/null | paste -sd, - | sed 's/,/, /g')"
other_sess_count="$(printf '%s\n' "$all_sessions" | grep -vxF "$session" 2>/dev/null | grep -c . || echo 0)"

elsewhere="Elsewhere on this server: ${other_wins} other window(s) in '${session}'"
if [ "${other_sess_count:-0}" -gt 0 ]; then
  elsewhere="${elsewhere}; ${other_sess_count} other session(s): ${other_sessions}"
fi
elsewhere="${elsewhere}."

read -r -d '' context <<EOF || true
You are running inside a tmux pane — a split alongside the user's other panes.
The user works one window per project, so the panes sharing YOUR window (below)
are usually this project's editor, shells, and dev servers. You can read and
drive them; that is the point of being here.

- socket:    ${socket}   (plain \`tmux ...\` targets it; explicit: \`tmux -S ${socket} ...\`)
- your pane: ${loc}  in window ${winlabel}

Panes in your window (location  [command]  cwd):
${siblings}

${elsewhere}

Read a pane:  tmux capture-pane -p -J -t <session:win.pane> -S -200
To list panes (with cwd + listening ports), run a command and wait for it to
finish, or send keys safely into a pane, use the \`tmux\` skill — it bundles
find-panes.sh, run-in-pane.sh, wait-for-text.sh, and safe-send.sh.
EOF

if command -v jq >/dev/null 2>&1; then
  jq -n --arg ctx "$context" \
    '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: $ctx}}'
else
  printf '%s\n' "$context"
fi

exit 0
