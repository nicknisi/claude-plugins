# tmux

Makes Claude aware of tmux — and able to use it. When Claude Code runs inside a
tmux pane, the terminals you're watching (dev servers, test watchers, REPLs,
logs, editors) live on *your* tmux server. This plugin lets Claude see and drive
those surfaces, instead of only spawning sandbox sessions you can't see.

## Components

### SessionStart hook — `hooks/tmux-awareness.sh`

Fires when a session starts. If `$TMUX` is set, it injects a short note plus a
live snapshot of your visible panes (location + running command) into Claude's
context, and points it at the `tmux` skill for the full workflow. If you're not
in tmux, it stays silent. This is what gives Claude *awareness* — a skill alone
only loads on demand, after Claude already suspects tmux is relevant.

### `tmux` skill — `skills/tmux/`

The how-to, in two modes:

- **Mode A — observe & control the user's tmux.** Detect the server from
  `$TMUX`, list panes, scrape output with `capture-pane`, and (carefully) send
  keystrokes into existing panes. Defaults to the current window — the splits
  for the project you're working on. Includes safety rules for writing into
  panes you didn't create.
- **Mode B — isolated sandbox.** Spawn throwaway sessions on a private socket,
  kept separate from your tmux (launched with `-f /dev/null` for predictable
  0-based indexing).

Examples lean toward TypeScript/Node workflows (Node REPL, `vite`/`next dev`,
`vitest`, `node inspect`), but the mechanics are language-agnostic.

### Bundled scripts — `skills/tmux/scripts/`

- **find-panes.sh** — list panes with command, cwd, and listening ports (`-p`);
  scoped to the current window by default.
- **run-in-pane.sh** — run a command in a shell pane, wait for it to finish, and
  return only that command's output (with its exit code).
- **wait-for-text.sh** — poll a pane for a success pattern, an error pattern
  (fail fast), or an idle period.
- **safe-send.sh** — guarded `send-keys` that refuses editors/pagers/TUIs unless
  forced.
- **find-sessions.sh** — enumerate sessions on a socket (Mode B).

## Notes

- Reading panes (`capture-pane`) is always safe. Sending keys into a pane you
  didn't create can disrupt the user's work — the skill documents when to
  confirm first and when to use a dedicated window instead.
- Hooks load at session start; after editing the hook, restart Claude Code for
  changes to take effect (`claude --debug` to inspect).
