# Agent Team Handoff

Background context for the execution handoff when parallel phases are available.

## Agent Teams

Agent teams let a single lead session automatically spawn and coordinate multiple teammates — the user starts **one** `claude` session, and the lead handles spawning, task assignment, plan approval, and synthesis. No manual terminal juggling.

**Why delegate mode?** Pressing Shift+Tab restricts the lead to coordination-only tools: spawning teammates, messaging, managing tasks, and approving plans. This prevents the lead from implementing tasks itself and ensures work is distributed to teammates.

**Why one session?** The lead automatically spawns each teammate as a separate Claude Code instance. Each teammate gets its own context window, loads project context (CLAUDE.md, MCP servers, skills), and works independently. You interact with the lead and it coordinates everything — use Shift+Up/Down to message individual teammates if needed.

Ensure agent teams are enabled in `.claude/settings.json` or `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Why Fresh Sessions?

- Ideation consumes significant context (contract, specs, exploration)
- Execution benefits from clean context focused on the spec
- Human review between phases catches issues early
- Each phase is independently committable
- Each session creates granular implementation tasks scoped to that phase
