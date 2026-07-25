# Claude Plugins

My personal collection of Claude Code plugins.

## Using this marketplace

Add this marketplace to Claude Code:

```bash
/plugin marketplace add nicknisi/claude-plugins
```

Then install plugins:

```bash
/plugin install essentials@nicknisi
```

## Plugins

The list below is generated from `marketplace.json` by `pnpm run sync` — do not edit it by hand.

<!-- plugins:start -->

- [content](plugins/content/README.md) - Tools for bootstrapping content creation such as blog posts and conference talks
- [essentials](plugins/essentials/README.md) - Essential agents and skills for Claude Code workflows - git commits, code simplification, security audits, thermo-nuclear code-quality review, brainstorming, prototyping, diff explainers, session handoffs, and link reading.
- [ideation](https://github.com/nicknisi/ideation) - Transform brain dumps into implementation specs through an evidence-gated interview stress-tested by adversarial plan critics. Interactive HTML contract for planning decisions, Markdown specs for execution. /ideation:autopilot runs all phases on a deterministic workflow engine with overlap-serialized parallel waves; /ideation:retro mines implementation notes into learnings future interviews read. _(lives in its own repo, installs from this marketplace)_
- [image-gen](plugins/image-gen/README.md) - Generate or edit images via Google Gemini (nano-banana-pro) or OpenAI gpt-image-2. Supports 1K/2K/4K resolution and masked inpainting.
- [tmux](plugins/tmux/README.md) - Makes Claude tmux-aware. A SessionStart hook detects when Claude runs inside tmux and surfaces the panes the user is watching, plus a skill for reading and driving interactive/long-running CLIs (Node REPL, dev servers, test watchers, the node debugger) by sending keystrokes and scraping pane output.

<!-- plugins:end -->

## Using with Pi

This repo is also a Pi package. Install it directly:

```bash
pi install git:github.com/nicknisi/claude-plugins
# or, while developing locally:
pi install /Users/nicknisi/Developer/claude-plugins
```

The Pi package loads the same `plugins/*/skills` and `plugins/*/commands` files, plus `pi/extensions/claude-compat.ts` for Claude Code compatibility shims like `AskUserQuestion`, `WebFetch`, `WebSearch`, `TodoWrite`, and file-backed task tools.

For skills that rely on Claude Code's `Task`/`Agent` subagent workflow, install `pi-subagents` once:

```bash
pi install npm:pi-subagents
```

This repo does not load `pi-subagents` directly because Pi currently errors when the same extension/tool is loaded twice, and many Pi setups already have `pi-subagents` installed globally.

## Development

This is a pnpm workspace with TypeScript project references.

```bash
# Install dependencies
pnpm install

# Type check everything
pnpm run typecheck

# Bundle plugin scripts (any package with a `bundle` script)
pnpm run build

# Regenerate marketplace.json and the plugin list above
pnpm run sync
```

### Adding a new plugin

1. Create `plugins/your-plugin/.claude-plugin/plugin.json` with metadata
2. Add components: agents, commands, skills, or MCP servers
3. If adding an MCP server, update `pnpm-workspace.yaml` and root `tsconfig.json`
4. Run `pnpm run sync` to auto-discover and add to marketplace

The sync script scans `plugins/` and automatically discovers all plugins with valid `plugin.json` files. Add a plugin directory and it shows up. Remove one and it disappears.

## License

MIT
