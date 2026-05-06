---
name: deliberate
description: Have AI agents debate a topic through multiple rounds of critique and refinement
disable-model-invocation: true
---

# Deliberation Mode

Agents critique each other's answers and refine through peer review.

## Usage

```
/consultant:deliberate Should we use REST or GraphQL for our API?
/consultant:deliberate What's the best state management approach for this app?
```

## How It Works

Deliberation runs in 4 rounds:

### Round 1: Initial Perspectives

- Launch all 5 agents in parallel
- Each agent provides initial analysis independently

### Round 2: Critique & Challenge

- Share all Round 1 responses with all agents
- Each agent reviews others' answers, points out errors/gaps/strengths

### Round 3: Refinement

- Agents revise positions based on feedback
- Identify emerging consensus

### Round 4: Final Synthesis

- Analyze convergence vs divergence
- Highlight consensus points
- Present unresolved disagreements with reasoning
- Rate confidence based on agent agreement

## Execution

**Round 1**: Launch 5 agents in parallel using Task tool:

- `consultant:codex-researcher`
- `consultant:gemini-researcher`
- `consultant:grok-researcher`
- `consultant:perplexity-researcher`
- `consultant:claude-researcher`

Prompt each: "Provide your initial analysis on: $ARGUMENTS"

**Round 2**: Launch 5 agents again with all Round 1 responses.
Prompt: "Review these perspectives and critique them. Point out errors, gaps, and strong points."

**Round 3**: Launch 5 agents with all prior responses.
Prompt: "Based on the critiques, refine your position. Acknowledge valid points, defend or modify your stance."

**Round 4**: Synthesize in the main session — identify convergence, note disagreements, provide confidence rating.
