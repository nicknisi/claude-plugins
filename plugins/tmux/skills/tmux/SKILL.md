---
name: tmux
description: 'Remote control tmux sessions for interactive/long-running CLIs (Node REPL, dev servers, test watchers, the node debugger, etc.) by sending keystrokes and scraping pane output.'
license: Vibecoded
---

# tmux Skill

Use tmux as a programmable terminal multiplexer — both to **drive the panes the user is already watching** (their dev server, test watcher, REPL, logs) and to **run your own isolated sessions**. Works on Linux and macOS with stock tmux.

If you were launched from inside tmux, a `SessionStart` hook will already have told you so and listed the visible panes — which means Mode A below is available. When in doubt, prefer acting on the surfaces the user can actually see; that's usually what they mean.

## Mode A — observe & control the user's tmux

This is the high-value mode when you're running inside the user's tmux: you can read and drive the same panes they're looking at, instead of spinning up a sandbox they can't see.

Confirm you're inside their tmux and find the server (`$TMUX` is `socket,pid,session`; the socket is the first field):

```bash
[ -n "$TMUX" ] && echo "in tmux — socket=${TMUX%%,*} pane=$TMUX_PANE"
```

Plain `tmux ...` already targets that server; `tmux -S "${TMUX%%,*}" ...` is the explicit form. The user usually works one window per project, so the panes sharing your window are the relevant ones. The bundled scripts cover the common operations — prefer them over hand-rolling:

```bash
./scripts/find-panes.sh -p                    # panes in YOUR window + listening ports
./scripts/find-panes.sh --session -p          # widen to the whole session
```

**Never assume `:0.0`.** The user's tmux may set `base-index 1` / `pane-base-index 1`, so targets can be 1-based. Always use the exact `session:win.pane` reported by `find-panes.sh` (or the SessionStart hook, or `$TMUX_PANE` for your own pane).

Read a pane's output — safe, do it freely:

```bash
tmux capture-pane -p -J -t projects:1.2 -S -200   # scrape a dev server's recent log
```

Run a one-off in the user's shell pane and get just its output back (waits for completion, prompt-agnostic, exits with the command's code):

```bash
./scripts/run-in-pane.sh -t projects:1.3 -- pnpm vitest run src/auth
```

Send keystrokes into a pane through the guard, which refuses editors/pagers (**read the safety rules below first**):

```bash
./scripts/safe-send.sh -t projects:1.2 --enter -- 'rs'   # type 'rs' + Enter (e.g. nodemon restart)
./scripts/safe-send.sh -t projects:1.2 --keys  -- C-c    # control keys
```

## Writing into the user's panes

Reading with `capture-pane` never disturbs anything — reach for it first and often. `send-keys` is different: the keystrokes land in whatever currently has focus in that pane, so a careless send can corrupt the user's editor or kill a process they care about. Before any `send-keys` into a pane you didn't create:

- **Check what's running first** (the `[command]` from the list above). Don't send keystrokes into an editor (`nvim`, `vim`, `emacs`), a pager (`less`, `man`), or any stateful interactive program unless the user explicitly asked you to drive it.
- **Prefer your own surface for new work.** To run something long-lived, open a window the user can watch rather than hijacking a pane: `tmux new-window -n claude-task` (or a fresh session), then drive that. They still see it; you don't clobber their work.
- **Send deliberately.** Use `-l` for literal text; send control keys (`C-c`, `Enter`) as separate calls. Then `capture-pane` to confirm the effect before moving on.
- **Say what you touched.** Tell the user which pane you sent to and give them a `capture-pane`/`attach` command to verify.
- **Confirm destructive sends.** Interrupting a server they're running, or sending input that changes state, deserves a heads-up first unless they've already told you to go ahead.

`safe-send.sh` enforces the editor/pager check for you, and `run-in-pane.sh` is the safe way to run a one-off in a shell pane and capture its output — prefer them over raw `send-keys`.

---

The rest of this skill is **Mode B** — spinning up your own isolated sessions on a private socket, kept cleanly separate from the user's tmux. Use it for throwaway processes the user doesn't need to watch.

## Quickstart (isolated socket)

```bash
SOCKET_DIR=${TMPDIR:-/tmp}/claude-tmux-sockets  # well-known dir for all agent sockets
mkdir -p "$SOCKET_DIR"
SOCKET="$SOCKET_DIR/claude.sock"                # keep agent sessions separate from your personal tmux
SESSION=claude-node                             # slug-like names; avoid spaces
tmux -S "$SOCKET" -f /dev/null new -d -s "$SESSION" -n shell  # -f /dev/null = stock config, so :0.0 indexing is predictable
tmux -S "$SOCKET" send-keys -t "$SESSION":0.0 -- 'node' Enter
tmux -S "$SOCKET" capture-pane -p -J -t "$SESSION":0.0 -S -200  # watch output
tmux -S "$SOCKET" kill-session -t "$SESSION"                   # clean up
```

After starting a session ALWAYS tell the user how to monitor the session by giving them a command to copy paste:

```
To monitor this session yourself:
  tmux -S "$SOCKET" attach -t claude-node

Or to capture the output once:
  tmux -S "$SOCKET" capture-pane -p -J -t claude-node:0.0 -S -200
```

This must ALWAYS be printed right after a session was started and once again at the end of the tool loop. But the earlier you send it, the happier the user will be.

## Socket convention

- Agents MUST place tmux sockets under `CLAUDE_TMUX_SOCKET_DIR` (defaults to `${TMPDIR:-/tmp}/claude-tmux-sockets`) and use `tmux -S "$SOCKET"` so we can enumerate/clean them. Create the dir first: `mkdir -p "$CLAUDE_TMUX_SOCKET_DIR"`.
- Default socket path to use unless you must isolate further: `SOCKET="$CLAUDE_TMUX_SOCKET_DIR/claude.sock"`.

## Targeting panes and naming

- Target format: `{session}:{window}.{pane}`. With the stock config from `-f /dev/null` (above) indices are 0-based, so `:0.0` is the first pane. On the user's own server (Mode A) indices may be 1-based — discover them with `find-panes.sh`, never assume. Keep session names short (e.g., `claude-node`, `claude-vitest`).
- Use `-S "$SOCKET"` consistently to stay on the private socket path.
- Inspect: `tmux -S "$SOCKET" list-sessions`, `./scripts/find-panes.sh -S "$SOCKET" -A`.

## Finding sessions

- List sessions on your active socket with metadata: `./scripts/find-sessions.sh -S "$SOCKET"`; add `-q partial-name` to filter.
- List panes with command, cwd, and ports: `./scripts/find-panes.sh -S "$SOCKET" -A -p`.
- Scan all sockets under the shared directory: `./scripts/find-sessions.sh --all` (uses `CLAUDE_TMUX_SOCKET_DIR` or `${TMPDIR:-/tmp}/claude-tmux-sockets`).

## Sending input safely

- Prefer literal sends to avoid shell splitting: `tmux -S "$SOCKET" send-keys -t target -l -- "$cmd"`
- When composing inline commands, use single quotes or ANSI C quoting to avoid expansion: `tmux ... send-keys -t target -- $'npx serve -l 8000'`.
- To send control keys: `tmux ... send-keys -t target C-c`, `C-d`, `C-z`, `Escape`, etc.

## Watching output

- Capture recent history (joined lines to avoid wrapping artifacts): `tmux -S "$SOCKET" capture-pane -p -J -t target -S -200`.
- For continuous monitoring, poll with the helper script (below) instead of `tmux wait-for` (which does not watch pane output).
- You can also temporarily attach to observe: `tmux -S "$SOCKET" attach -t "$SESSION"`; detach with `Ctrl+b d`.
- When giving instructions to a user, **explicitly print a copy/paste monitor command** alongside the action don't assume they remembered the command.

## Spawning Processes

Some special rules for processes:

- When asked to debug Node/TypeScript, reach for `node inspect` (or `node --inspect-brk` + a client) by default. It's a line-oriented CLI debugger, so it drives cleanly over `send-keys`. Reserve `lldb`/`gdb` for native or compiled binaries.
- Screen-repainting tools — dev servers and watchers like `vite`, `next dev`, `vitest`, `tsx watch` — render into the alternate screen buffer and repaint with ANSI escapes. That corrupts `send-keys` input and leaves `capture-pane` scrollback noisy or empty. Quiet them down so the pane is scrapeable: export `CI=1` (makes `vitest` run once instead of watching, and drops most spinners/animations) and `NO_COLOR=1` (or `FORCE_COLOR=0`) to strip color codes. When you only need a tool's output, prefer its one-shot mode (`vitest run`, `tsc --noEmit`) over its watch mode.

## Synchronizing / waiting for prompts

- To just run a command and capture its output, `run-in-pane.sh` does the send/wait/capture in one step — reach for it first.
- To wait for a specific signal yourself, poll with `wait-for-text.sh` instead of guessing at sleeps:
  ```bash
  ./scripts/wait-for-text.sh -t "$SESSION":0.0 -p '^> ' -T 15                    # Node REPL ready
  ./scripts/wait-for-text.sh -t web:1.2 -p 'Local:' -e 'EADDRINUSE|Error' -T 30  # dev server up, or fail fast
  ./scripts/wait-for-text.sh -t build:0.0 --idle 3 -T 120                        # wait for a noisy build to go quiet
  ```
- Good ready/completion signals: `"Local:"` / `"ready in"` (Vite/Next), `"waiting for file changes"` (watcher), a test summary like `"Tests "`, or `--idle` when there's no reliable string.

## Interactive tool recipes

- **Node REPL**: `tmux ... send-keys -- 'node' Enter`; wait for `^> `; send code with `-l`; for multi-line input enter `.editor`, send the block, then `C-d` to run it; interrupt a hung evaluation with `C-c`; exit with `.exit` or two `C-c`. Use `tsx` instead of `node` when you need a TypeScript-aware REPL.
- **node inspect** (the gdb analog): `tmux ... send-keys -- 'node inspect ./dist/app.js' Enter` (or `node inspect $(npx --no-install which tsx) ./src/app.ts`); wait for `debug> `; drive with `cont`/`c`, `next`/`n`, `step`/`s`, `out`/`o`, and `repl` to inspect state; set breakpoints with `setBreakpoint('file.js', 42)` or a `debugger;` statement; pause a running program with `C-c`; quit via `.exit`.
- **Dev servers & watchers** (`vite`, `next dev`, `tsx watch`, `vitest`): start the process, poll for its ready line (see above), then read the visible pane rather than deep scrollback — these repaint, so `capture-pane` without `-S` is usually cleaner. Remember `CI=1`/`NO_COLOR=1` to tame the output.
- **Other TTY apps** (`psql`, `redis-cli`, `prisma studio` CLI prompts, `bash`): same pattern—start the program, poll for its prompt, then send literal text and Enter.

## Cleanup

- Kill a session when done: `tmux -S "$SOCKET" kill-session -t "$SESSION"`.
- Kill all sessions on a socket: `tmux -S "$SOCKET" list-sessions -F '#{session_name}' | xargs -r -n1 tmux -S "$SOCKET" kill-session -t`.
- Remove everything on the private socket: `tmux -S "$SOCKET" kill-server`.

## Bundled scripts

All live in `./scripts/`, work on Linux/macOS (bash + tmux + grep; `find-panes -p` also needs `lsof`/`pgrep`), and take `-S <socket>` to target a private socket (omit to use `$TMUX`/default). Run any with `-h` for full options.

- **find-panes.sh** — list panes with location, command, cwd, and (with `-p`) listening ports. Defaults to your current window; `--session` / `-A` widen the scope. Answers "which pane is my `:3000` server?"
- **run-in-pane.sh** — `-t target -- <cmd>`: send a command to a shell pane, wait for it to finish (prompt-agnostic sentinel), print only that command's output, and exit with its exit code. Refuses non-shell panes unless `--force`.
- **wait-for-text.sh** — poll a pane until a condition is met: `-p` success regex (exit 0, prints the match), `-e` error regex (exit 3, fail fast), and/or `--idle N` (exit 0 once output is quiet for N seconds). `-T` overall timeout (exit 1); `-F` for fixed strings.
- **safe-send.sh** — guarded `send-keys`: refuses editors/pagers/TUIs (where keystrokes aren't commands) unless `--force`. `--enter` appends Enter to literal text; `--keys` sends key names (`C-c`, `Escape`). REPLs and shells are allowed.
- **find-sessions.sh** — list sessions on a socket, or `--all` to scan every socket under `CLAUDE_TMUX_SOCKET_DIR` (Mode B discovery/cleanup).
