# Claude Code Plugin Marketplace

Personal collection of Claude Code plugins. For plugin and marketplace documentation, see:

- [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Creating Plugins](https://code.claude.com/docs/en/plugins#plugins)

## Quick Start

```bash
# Install dependencies
pnpm install

# Build MCP servers and sync marketplace
pnpm run build:all
```

## Plugin Structure

```
plugins/{name}/
├── .claude-plugin/
│   └── plugin.json          # Required metadata
├── .mcp.json                # Optional: MCP server config
├── agents/*.md              # Optional: agent definitions
├── skills/*/SKILL.md        # Optional: skills
├── commands/*.md            # Optional: slash commands
└── mcp-server/              # Optional: custom MCP server
    └── dist/                # Bundled output
```

## Adding a Plugin

1. **Create plugin directory:**

   ```bash
   mkdir -p plugins/my-plugin/.claude-plugin
   ```

2. **Create `plugin.json`:**

   ```json
   {
     "name": "my-plugin",
     "version": "0.1.0",
     "description": "Plugin description",
     "author": {
       "name": "Nick Nisi",
       "email": "nick@nisi.org"
     },
     "keywords": ["optional", "search", "terms"]
   }
   ```

3. **Add components** (agents, skills, commands, or MCP servers)

4. **Sync marketplace:**
   ```bash
   pnpm run sync
   ```

The sync script auto-discovers plugins and generates `marketplace.json`.

5. Make sure to update the README for that plugin.

## MCP Servers

### Custom MCP Server

Use `${CLAUDE_PLUGIN_ROOT}` for paths:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/mcp-server/dist/index.js"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

Build: `pnpm run build` (bundles to `dist/`)

### External MCP Server

```json
{
  "mcpServers": {
    "external": {
      "command": "npx",
      "args": ["-y", "@org/mcp-server"]
    }
  }
}
```

No build needed - runs published package.
