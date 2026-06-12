# Claude Plugins

My personal collection of Claude Code plugins.

## Using this marketplace

Add this marketplace to Claude Code:

```bash
/plugin marketplace add nicknisi/claude-plugins
```

Then install plugins:

```bash
/plugin install consultant@nicknisi
```

## Plugins

- [consultant](plugins/consultant/README.md) - Multi-model AI consultation and research with GPT-5/Codex, Gemini, Grok, Perplexity, and Claude (supports both single-agent consultation and parallel multi-agent research)
- [content](plugins/content/README.md) - Tools for bootstrapping content creation
- [developer-experience](plugins/developer-experience/README.md) - Tools for the experienced developer experience engineer
- [essentials](plugins/essentials/README.md) - Core productivity tools and workflows for Claude Code
- [ideation](https://github.com/nicknisi/ideation) - Evidence-gated planning interviews that turn brain dumps into contracts and implementation specs, with critic-reviewed plans, autopilot execution, and a retro learning loop. Lives in its own repo but still installs from this marketplace.
- [meta](plugins/meta/README.md) - Meta-cognitive tools for Claude Code self-improvement. Learn from feedback, optimize configuration, and evolve your AI development workflow.
- [sandbox](plugins/sandbox/README.md) - Experimental agents, skills, and output styles for unconventional interaction patterns
- [spec-driven](plugins/spec-driven/README.md) - Transform specifications into executable code with validation-driven development
- [workos](plugins/workos/README.md) - Enterprise authentication and SSO integration toolkit

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

# Build all MCP servers
pnpm run build

# Build and sync marketplace metadata
pnpm run build:all
```

### Adding a new plugin

1. Create `plugins/your-plugin/.claude-plugin/plugin.json` with metadata
2. Add components: agents, commands, skills, or MCP servers
3. If adding an MCP server, update `pnpm-workspace.yaml` and root `tsconfig.json`
4. Run `pnpm run sync` to auto-discover and add to marketplace

The sync script scans `plugins/` and automatically discovers all plugins with valid `plugin.json` files. Add a plugin directory and it shows up. Remove one and it disappears.

## License

MIT
