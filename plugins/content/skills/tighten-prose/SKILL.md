---
name: tighten-prose
description: This skill should be used when the user asks to "tighten this up", "tighten the prose", "clean up the writing", "check for AI tells", "make this sound more human", "de-slop this", "run a writing pass", or when completing a writing task that should not read like AI output. Scans prose for statistically overrepresented AI writing patterns and rewrites flagged sections.
---

# Tighten

A final editing pass that catches and removes AI-detectable writing patterns. Not a detector — an editor. The output reads like a human wrote it because, after this pass, a human shaped every sentence.

## What this pass cannot see

**This skill scans vocabulary and sentence-level habits. It is blind to structure,
and structure is where modern AI prose gives itself away.**

A ghost-written blog post once passed this gate with zero findings — no AI
vocabulary, em-dash rate *below* the author's own baseline — while ending eight of
eight sections on an aphorism, using six "Not X. That's Y." antitheses, and
asserting nine invented claims about the author's inner life. Readers called it
slop immediately. The gate had certified its own blind spot.

If you are tightening a draft written *for* someone else in their voice, run a
corpus-calibrated structural check first — see
`plugins/content/skills/blog-post-writer/scripts/slopcheck.py`. Two rules that pass
list can't encode:

- **Slop is a rate, not a presence.** Real writers use every device on the list
  below. The tell is one firing on every section instead of once a post. Thresholds
  have to be measured against the author's real corpus.
- **Check both directions.** A metric sitting far *below* an author's baseline means
  someone wrote to the metric. That's as suspicious as excess.

Run this skill last and weight it least.

## When to Run

- After completing any prose-heavy output (blog posts, documentation, emails, talks)
- When another skill requests a tighten pass as a quality gate
- When the user asks to clean up or improve writing
- Before shipping anything where "sounds like AI" would undermine credibility

## Process

### 1. Load the Tells Reference

Read `references/ai-tells.md` for the full catalog of patterns, organized by category with examples and fix strategies.

### 2. Fetch Live Patterns

AI writing tells evolve as models change. Fetch the current vocabulary list from Wikipedia:

```
https://en.wikipedia.org/w/api.php?action=parse&page=Wikipedia:Signs_of_AI_writing&prop=wikitext&format=json
```

Extract the "Words to watch" lists and AI vocabulary entries. Newer models drop old tells and develop new ones — the live source catches drift the static reference cannot.

If the fetch fails, the static reference is sufficient. Proceed without it.

### 3. Scan for Pattern Density

Read the full text and scan across all categories:

| Category                 | Signal                                                      |
| ------------------------ | ----------------------------------------------------------- |
| Vocabulary clusters      | 3+ AI-overused words in a section                           |
| Inflated significance    | Phrases that inflate importance without adding information  |
| Superficial -ing clauses | Participial phrases tacked on as fake depth                 |
| Promotional language     | Travel-brochure / sales-deck vocabulary                     |
| Vague authority          | Phantom expert attributions ("Industry reports suggest...") |
| Formulaic transitions    | Five-paragraph-essay connectors (moreover, furthermore)     |
| Negative parallelism     | Overuse of "not X, it's Y" construction                     |
| Rule of three            | Every list having exactly three items                       |
| Copula avoidance         | "Serves as" instead of "is"                                 |
| Elegant variation        | Thesaurus cycling to avoid repeating a concrete noun        |
| Em dash density          | Em dashes at 2-3x human rate                                |
| Formatting tells         | Mechanical boldface, title case headings, emoji decoration  |

**The signal is density, not individual hits.** One "crucial" is fine. A cluster of three AI vocabulary words in two paragraphs is a rewrite.

### 4. Report Findings

Present a concise summary:

- Which categories showed pattern density above noise level
- Specific examples quoted from the text
- Severity: how many sections need work vs. isolated hits

Do not list every individual word match. Report clusters and structural patterns.

### 5. Rewrite Flagged Sections

For each flagged section, rewrite to eliminate tells while preserving meaning.

**Fix strategies:**

- **Inflated significance** — Say what actually happened. Specific facts beat vague importance.
- **Superficial -ing** — If the clause adds no new information, cut it entirely.
- **Copula avoidance** — If a fancy verb replaces "is" without reason, use "is."
- **Formulaic transitions** — Use casual transitions or drop them. "Here's the thing:" beats "Moreover."
- **Elegant variation** — Repeat the concrete noun. "Vim" twice is better than "vim... the editor... the tool."
- **Rule of three** — Vary list lengths. Two items is fine. Four is fine. One is fine.
- **Vague authority** — Name the person or drop the attribution.
- **Promotional language** — Replace with specifics. What exactly makes it good?
- **Em dashes** — Keep the ones that earn their place. Replace the rest with commas or periods.

**Constraints:**

- Preserve the original meaning and information content
- Maintain the existing voice and tone — do not flatten personality
- Keep legitimate rhetorical devices. A single "not X, it's Y" used for emphasis is a deliberate choice, not a tell. The tell is when every other paragraph uses it.
- When a pattern appears intentional and isolated, leave it

### 6. Present the Tightened Version

If only a few sections changed, present before/after pairs for the changed passages. If the whole piece needed work, present the full rewrite.

Do not explain every change. The writing should speak for itself. Mention only changes where the reasoning is non-obvious.

## Composability

Designed to work standalone or as a step in other writing workflows.

**Standalone:** Point at text and say "tighten this up."

**Composed:** Another skill (like blog-post-writer) calls for a tighten pass as its final quality gate. When composed, respect any voice calibration the parent skill has already established. Tighten removes autopilot patterns, not personality.

## Bundled Resources

- **`references/ai-tells.md`** — Full catalog of AI writing tells with examples, fix strategies, and density guidance. Adapted from Wikipedia's "Signs of AI writing."
