---
name: research
description: Launch multiple AI agents in parallel for comprehensive research coverage
disable-model-invocation: true
---

# Research Mode

Launch multiple agents simultaneously for comprehensive research coverage.

## Usage

```
/consultant:research quick What are the best testing frameworks for React?
/consultant:research standard How do modern authentication systems work?
/consultant:research extensive Deep dive into microservices architecture patterns
/consultant:research What is the current state of WebAssembly? (defaults to standard)
```

## Research Intensities

| Intensity     | Agents         | Best For                      |
| ------------- | -------------- | ----------------------------- |
| **quick**     | 5 (1 of each)  | Simple queries, fast answers  |
| **standard**  | 15 (3 of each) | Comprehensive coverage        |
| **extensive** | 40 (8 of each) | Deep-dive, exhaustive reports |

## Agent Types

- `perplexity-researcher`: Citations, current data
- `claude-researcher`: Built-in WebSearch, detailed analysis
- `codex-researcher`: GPT-5 with high reasoning
- `gemini-researcher`: Multi-perspective synthesis
- `grok-researcher`: Alternative LLM perspective

## Execution

Parse `$ARGUMENTS` to extract:

- **Intensity**: First word if `quick`, `standard`, or `extensive` (default: `standard`)
- **Topic**: The research topic

Launch agents using multiple Task tool calls in ONE message.

**IMPORTANT**: All agents MUST be launched in a single message with multiple parallel Task tool calls.

After agents complete, synthesize results:

- Identify consensus points (multiple agents agree)
- Highlight unique insights from specific agents
- Note contradictions or disagreements
- Rate confidence based on corroboration
