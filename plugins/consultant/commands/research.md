---
description: Launch multiple AI agents in parallel for comprehensive research coverage
args: "[quick|standard|extensive] [topic]"
---

# Research Mode

Launch multiple agents simultaneously for comprehensive research coverage.

## Usage

```
/research quick What are the best testing frameworks for React?
/research standard How do modern authentication systems work?
/research extensive Deep dive into microservices architecture patterns
/research What is the current state of WebAssembly? (defaults to standard)
```

## Research Intensities

| Intensity | Agents | Timeout | Best For |
|-----------|--------|---------|----------|
| **quick** | 5 (1 of each type) | 2 min | Simple queries, fast answers |
| **standard** | 15 (3 of each type) | 3 min | Comprehensive coverage, balanced depth |
| **extensive** | 40 (8 of each type) | 10 min | Deep-dive analysis, exhaustive reports |

## Available Agent Types

**Web Search Agents:**
- `perplexity-researcher`: Citations, Sonar models, current data
- `claude-researcher`: Built-in WebSearch, detailed analysis

**LLM Analysis Agents:**
- `codex-researcher`: GPT-5 with high reasoning, technical deep-dives
- `gemini-researcher`: Multi-perspective synthesis
- `grok-researcher`: Alternative LLM perspective

## How It Works

1. **Query Decomposition**: Break the topic into sub-questions
2. **Parallel Launch**: Launch all agents in a SINGLE message with multiple Task tool calls
3. **Collection**: Wait for agents to complete (up to timeout)
4. **Synthesis**: Integrate findings with confidence ratings based on agent agreement

## Execution

Parse `$ARGUMENTS` to extract:
- **Intensity**: First word if it's `quick`, `standard`, or `extensive` (default: `standard`)
- **Topic**: The research topic

Launch agents using multiple Task tool calls in ONE message:

### Quick Research (5 agents)
```
Launch 1 of each:
- consultant:codex-researcher
- consultant:gemini-researcher
- consultant:grok-researcher
- consultant:perplexity-researcher
- consultant:claude-researcher
```

### Standard Research (15 agents)
```
Launch 3 of each type (15 total agents)
```

### Extensive Research (40 agents)
```
Launch 8 of each type (40 total agents)
```

**IMPORTANT**: All agents MUST be launched in a single message with multiple parallel Task tool calls.

After agents complete, synthesize results:
- Identify consensus points (multiple agents agree)
- Highlight unique insights from specific agents
- Note any contradictions or areas of disagreement
- Rate confidence based on corroboration

**Speed**: 30 seconds to 3 minutes depending on intensity
**Cost**: $0.01-0.40 depending on intensity
