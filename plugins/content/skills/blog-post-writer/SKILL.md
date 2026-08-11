---
name: blog-post-writer
description: Turn Nick Nisi's raw material into a blog post draft in his voice. Use when the user says "write a blog post," "draft a post," "write about [topic]," "turn my notes into a blog post," or provides scattered ideas that need shaping. Produces a deliberately flat draft with sourced facts and tagged gaps — never a finished post.
---

# Nick Nisi Blog Writer

Turn raw material into a draft Nick finishes. This skill does research, structure,
and connective prose. It does **not** produce publishable first-person writing.

## The rule this skill exists to enforce

> **Facts may come from logs. Feelings may not.**

An earlier version of this skill shipped a post that readers called AI slop. The
facts were impeccable — real timestamps, real commit stats, real Slack quotes. The
failure was that it also generated Nick's inner life: what he thought, what he'd
assumed, what moved him. Nine such claims; one had a source. Readers can't always
name that, but they feel it, and they stop trusting the piece.

The measured version: that post claimed inner states at **5.84 per 1,000 words**
against Nick's corpus mean of **0.97**. Six times his rate. He mostly writes about
what he built. The draft wrote about how he felt about what he built.

Everything below follows from that.

## Process

### 1. Gather the raw material

Accept the mess: scattered thoughts, code, commands, conclusions, links. Don't
require organization.

If the material is thin, mine it — session logs, Slack, git history, the repos
themselves. This is the pipeline's genuine strength and there's no reason to hold
back. **Record a source for every fact.** A working file of claim → source keeps
the draft honest and makes step 5 mechanical.

### 2. Interview for the parts you cannot mine

**This is the highest-value step in the skill. Do not skip it.**

Logs record what Nick did. They never record what he thought. Ask 8–15 targeted
questions with `ask_user_question` or plain prose, and capture the answers
**verbatim**:

- "What did you actually think when X happened?"
- "Why did you really stop doing Y? Not the tidy reason — the real one."
- "What's the part of this you'd argue with someone about?"
- "What did you get wrong that you'd rather not include?"

Tell him to type fast and not polish. His unpolished answers are the raw material
for every voice-load-bearing sentence in the post. They will be flat, hedged, and
specific — **that flatness is the voice.** Do not smooth it.

If he declines to be interviewed, the post ships with `[NICK: ...]` markers where
his inner life would go. That is a correct outcome, not a failure.

### 3. Read the corpus, not a description of it

Read 2–3 recent posts from `src/content/posts/` in full — most recent first, plus
any on a similar topic. Write connective prose consistent with **those**, not with
a summary of them.

Then read `references/voice-tone.md`, which is now a list of **ceilings and
prohibitions**, not features to hit. Requesting a feature makes a model execute it
every time it applies; that's what produced eight aphorisms in an eight-section
post. Only constraints are safe to state.

### 4. Structure from the material

Find the chronology or the argument already in the facts and follow it.

**Do not select a narrative framework.** `references/frameworks.md` exists as
diagnostic vocabulary for talking about a draft that already exists — never as a
template to fill. Choosing a framework means choosing what the events *meant*,
which is Nick's call, not the tool's. A flawlessly executed Story Circle is the
single most detectable artifact this skill can produce, because no human drafting
from memory has ever produced one.

The only structural instruction: **identify the one turn the post exists to make,
arrange the facts so it lands, and leave flat ground everywhere else.**

Section headers are descriptive — they name the topic ("What Fleet is", "Three
signals, none trustworthy alone"). Allusive narrative-beat headers ("The drift",
"Coming home") read as chapter titles and are a tell in bulk.

### 5. Write the ugly draft

Informationally complete, rhetorically inert. **Aim for flat.**

Nick is good at adding voice to plain prose and bad at excising pastiche from
clever prose. A draft that already *sounds* finished is the worst possible artifact
to hand him — he has to fight it. Give him something that obviously needs him.

Hard rules while drafting:

| Rule | Why |
| ---- | --- |
| Every mental-state sentence is a verbatim quote from step 2, or a `[NICK: what were you actually thinking here?]` marker | The core failure. Untagged invented interiority is an automatic fail. |
| Sections end on information — a fact, a number, a command, or just stop | Eight aphoristic endings is the template's silhouette |
| Every number traces to a source | "Twelve minutes of curiosity" was invented precision that narrativizes a life |
| One sustained metaphor per post, maximum | A metaphor recurring across 3+ sections is a framework fingerprint |
| No narrator stage directions | "Now watch what happened next" is Nick emceeing a post he'd never emcee |

Where you'd reach for a rhetorical flourish, write the plain sentence instead and
let Nick decide whether it deserves more.

### 6. Run the structural gate — before Nick reads it

```bash
python3 scripts/slopcheck.py \
  --corpus '/Users/nicknisi/Developer/nicknisi.com/src/content/posts/*.md*' \
  --draft path/to/draft.mdx
```

It calibrates against Nick's real posts and flags outliers in both directions —
**suppression is as suspicious as excess.** A draft engineered to dodge a metric
looks different from one that never considered it.

The gate's job is to produce Nick's rewrite list, not to certify the draft. Fix
what it flags, then hand over.

The interiority section always prints and is **not** scored against the corpus —
it exits non-zero while any claim is unconfirmed. A structurally clean draft with
unconfirmed first-person claims is not a passing draft. Those lines go to Nick,
not to you.

Vocabulary checks (the `tighten-prose` skill) run last and matter least. They
scan for 2024-era tells like "delve" and "leverage" and will pass a maximally
slop-shaped draft — they did exactly that on the post that caused this rewrite.

### 7. Hand off, don't ship

Deliver:

1. The flat draft
2. The interiority list — every sentence claiming his inner life, for him to rewrite or cut
3. The gate output
4. Open questions

**Do not publish a post whose first-person sentences Nick has not read and
approved.** He isn't the editor of this artifact. He's the only source for half of
it.

## Output Format

See `references/post-template.md` for frontmatter schema and file conventions.

## Bundled Resources

- `references/voice-tone.md` — ceilings and prohibitions, with measured rates from his corpus
- `references/post-template.md` — frontmatter schema and structural skeleton
- `references/frameworks.md` — diagnostic vocabulary for critiquing a finished draft
- `scripts/slopcheck.py` — corpus-calibrated structural detector
