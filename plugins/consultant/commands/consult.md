---
description: Ask a specific AI model (codex, gemini, grok, perplexity, claude) for focused analysis or a second opinion
args: "[model] [question]"
---

# Consultation Mode

Ask a specific AI model for focused analysis or a second opinion.

## Usage

```
/consult codex What's the best approach for this architecture?
/consult gemini Analyze this code pattern
/consult grok What do you think about this design?
/consult perplexity Research latest React trends
/consult claude Search for best practices on error handling
```

## Available Consultants

| Model | Agent | Specialization |
|-------|-------|----------------|
| **codex** / **gpt5** | `codex-researcher` | Advanced reasoning, technical analysis, complex problem-solving |
| **gemini** | `gemini-researcher` | Multi-perspective analysis, creative solutions |
| **grok** | `grok-researcher` | Alternative LLM perspective, latest Grok-4 model |
| **perplexity** | `perplexity-researcher` | Web research with citations, real-time data |
| **claude** | `claude-researcher` | Web research, detailed synthesis |

## How It Works

1. Parse the model name from the first argument
2. Launch a single agent of the specified type using the Task tool
3. Pass the question/context to that agent
4. Return the focused analysis from that one expert

## Execution

Parse `$ARGUMENTS` to extract:
- **Model**: First word (codex, gemini, grok, perplexity, claude)
- **Question**: Everything after the model name

Launch ONE agent using the Task tool:

```
Task tool with subagent_type: consultant:[model]-researcher
```

Map model names:
- `codex` or `gpt5` → `consultant:codex-researcher`
- `gemini` → `consultant:gemini-researcher`
- `grok` → `consultant:grok-researcher`
- `perplexity` → `consultant:perplexity-researcher`
- `claude` → `consultant:claude-researcher`

If no model specified or model not recognized, ask the user which consultant they want.

**Speed**: ~10-30 seconds
**Cost**: ~$0.002-0.02
