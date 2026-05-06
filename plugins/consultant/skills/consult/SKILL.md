---
name: consult
description: Ask a specific AI model (codex, gemini, grok, perplexity, claude) for focused analysis or a second opinion
disable-model-invocation: true
---

# Consultation Mode

Ask a specific AI model for focused analysis or a second opinion.

## Usage

```
/consultant:consult codex What's the best approach for this architecture?
/consultant:consult gemini Analyze this code pattern
/consultant:consult grok What do you think about this design?
/consultant:consult perplexity Research latest React trends
/consultant:consult claude Search for best practices on error handling
```

## Available Consultants

| Model                | Agent                   | Specialization                                                  |
| -------------------- | ----------------------- | --------------------------------------------------------------- |
| **codex** / **gpt5** | `codex-researcher`      | Advanced reasoning, technical analysis, complex problem-solving |
| **gemini**           | `gemini-researcher`     | Multi-perspective analysis, creative solutions                  |
| **grok**             | `grok-researcher`       | Alternative LLM perspective, latest Grok-4 model                |
| **perplexity**       | `perplexity-researcher` | Web research with citations, real-time data                     |
| **claude**           | `claude-researcher`     | Web research, detailed synthesis                                |

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
