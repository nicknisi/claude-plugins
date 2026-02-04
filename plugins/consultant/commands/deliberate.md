---
description: Have AI agents debate a topic through multiple rounds of critique and refinement
args: "[topic/question]"
---

# Deliberation Mode

Agents critique each other's answers and refine through peer review.

## Usage

```
/deliberate Should we use REST or GraphQL for our API?
/deliberate What's the best state management approach for this app?
/deliberate Is this architectural decision sound?
```

## How It Works

Deliberation runs in 4 rounds:

### Round 1: Initial Perspectives
- Launch all 5 agents in parallel
- Each agent provides initial analysis independently
- No agent sees others' responses yet

### Round 2: Critique & Challenge
- Share all Round 1 responses with all agents
- Each agent reviews others' answers
- Point out errors, gaps, and strong points
- Challenge assumptions
- Add missing information

### Round 3: Refinement
- Share all critiques with all agents
- Agents revise their positions based on feedback
- Acknowledge valid points from others
- Defend or modify their stance
- Identify emerging consensus

### Round 4: Final Synthesis
- Analyze convergence vs divergence
- Highlight consensus points (all/most agents agree)
- Present unresolved disagreements with reasoning
- Rate confidence based on agent agreement

## Example Flow

```
Topic: "Should we use REST or GraphQL for our API?"

Round 1 (Initial):
- Codex: "GraphQL for flexible querying"
- Gemini: "REST for simplicity"
- Perplexity: [web research on adoption trends]

Round 2 (Critique):
- Codex: "Gemini's simplicity claim ignores client complexity"
- Gemini: "Codex didn't mention GraphQL's caching challenges"
- Perplexity: "Both missing data: GraphQL adoption is 45% in 2025"

Round 3 (Refinement):
- Codex: "Valid point on caching. REST for simple CRUD, GraphQL for complex reads"
- Gemini: "Agree with Codex's nuanced position"
- Consensus emerging...

Round 4 (Synthesis):
- CONSENSUS: Use REST for simple APIs, GraphQL for complex data fetching
- AGREEMENT: Both have trade-offs, no universal answer
- CONFIDENCE: High (agents converged)
```

## Execution

**Round 1**: Launch 5 agents in parallel using Task tool:
- `consultant:codex-researcher`
- `consultant:gemini-researcher`
- `consultant:grok-researcher`
- `consultant:perplexity-researcher`
- `consultant:claude-researcher`

Prompt each: "Provide your initial analysis on: [topic]"

**Round 2**: Launch 5 agents again with context:
- Include all Round 1 responses
- Prompt: "Review these perspectives and critique them: [Round 1 responses]. Point out errors, gaps, and strong points."

**Round 3**: Launch 5 agents with all critiques:
- Include Round 1 and Round 2 responses
- Prompt: "Based on the critiques, refine your position: [all prior responses]. Acknowledge valid points, defend or modify your stance."

**Round 4**: Synthesize in the main session:
- Identify where agents converged
- Note remaining disagreements
- Provide confidence rating

**Timeout**: 5 minutes total
**Best For**: Critical decisions, complex problems, catching errors, finding consensus
