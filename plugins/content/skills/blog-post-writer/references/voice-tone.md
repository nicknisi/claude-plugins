# Nick Nisi's Voice — Ceilings and Prohibitions

**This file used to be a feature list.** It said things like "uses single-line
paragraphs for impact" and "ties back to the opening" and "vulnerability builds
credibility." Every one of those was true of his writing and every one of them was
a disaster as an instruction.

Here's why. A feature a real writer uses *sometimes*, at maybe 20% intensity,
becomes a per-section quota the moment you write it as an imperative. "Uses
single-line paragraphs for impact" produced a post where **eight of eight sections**
ended on an aphorism. Nick's own rate is closer to one in eight.

The tell was never the presence of the device. **It was the rate and the
regularity.** Nick uses every technique listed below. He just doesn't use them all,
every time, on schedule.

So this file no longer tells you what to do. It tells you what not to exceed. You
cannot Goodhart a ceiling.

## Read the corpus instead

Before writing a word, read 2–3 recent posts from `src/content/posts/` in full.
Imitate **those**. A model imitates examples far better than it imitates a prose
description of examples, and the description is a lossy round-trip that injects
error twice.

Good ones to load: `fleet.mdx`, `case-statement.mdx`, `ideation.mdx`.

## Stance — the part that actually is his voice

Not observable features. His relationship to the material:

**To his claims:** show the receipt. He states a mechanism, then the evidence, then
understates the conclusion. He'd rather explain how the fusion layer resolves a
stale hook than tell you the lesson was profound.

**To himself:** low ceremony. He does not narrate an arc over his own past. He
admits specific limits about specific things — "the PRs it generated weren't
perfect," "letting go of 'I'll just do it myself' is harder than I expected" —
not staged confessions positioned where a redemption arc needs a cost.

**To the reader:** a peer who already has context. Not an audience to be landed.
He never emcees. He never says "now watch this."

Forbidding moves produces voice. Requesting moves produces pastiche.

## Measured ceilings

Rates from 20 published posts. Run `scripts/slopcheck.py` for current numbers —
these drift as he writes more.

| Feature | His rate | Ceiling | Notes |
| ------- | -------- | ------- | ----- |
| Sections ending on an aphorism | 0.15 (max 0.40) | **≤ 0.33** | The single strongest tell. Most sections end on information. |
| "Not X. It's Y." antithesis | 0.83 / 1k words | **≤ 2 / 1k** | Fine once. Six times is a metronome. |
| Narrator stage directions | 0.05 per post | **≤ 1** | "Now watch what happened next" — he does not do this. |
| Staged epiphany markers | 0.15 per post | **≤ 1** | "reframed everything," "something clicked" |
| First-person mental states | 0.97 / 1k words | **≤ 2 / 1k** | See the hard rule below. |
| Long-long-short rhythm triplets | 0.20 / 1k | **≤ 0.9 / 1k** | Two long sentences then a short one, as a beat. |
| Closure devices in final section | 0.05 per post | **≤ 1** | Callback, direct address, bolded lesson, past-self frame — pick one. |
| Section length variation (CV) | 0.45 | **≥ 0.3** | Suspiciously even sections mean a template. |

**Both directions count.** A draft sitting far *below* his baseline is as suspicious
as one above it — it means someone wrote to the metric. The post that triggered this
rewrite had an em-dash rate of 5.84/1k against his 1.42/1k mean and *that wasn't
even the problem*; the earlier gate had congratulated itself for coming in under
Fleet's em-dash count while shipping six other structural failures.

## The hard rule: interiority

**Facts may come from logs and git history. Feelings may not come from anywhere but
Nick.**

Every sentence claiming what he thought, felt, assumed, realized, feared, or
never considered is either:

1. a verbatim quote from him, or
2. a `[NICK: what were you actually thinking here?]` marker

There is no third option. Not "a reasonable inference from the logs." Not "clearly
implied by his behavior."

Readers don't detect fabricated inner life directly — they detect its artifact:
**narratively convenient** inner life. Invented feelings always arrive exactly on
cue and always point at the moral. Real interiority is lumpy: irrelevant
reactions, unresolved irritation, feelings that don't serve the plot. If every
emotion in a draft is load-bearing, every emotion in it was manufactured.

## Prohibitions

- **No sustained metaphor.** One figure, used once. A metaphor recurring across
  three or more sections is a framework fingerprint, not an image. (The bad post ran
  "the city I'd built" through four sections.)
- **No invented precision.** Every number traces to a source. "Twelve minutes of
  curiosity, nineteen minutes of reading" is arithmetic no human performs on their
  own life.
- **No allusive headers in bulk.** His are descriptive: "What Fleet is," "Three
  signals, none trustworthy alone," "Evidence that can't be faked," "What this
  costs." Not "The drift," "Coming home," "What I'd tell July me."
- **No stacked endings.** The bad post closed with a callback *and* a direct address
  *and* a bolded portable lesson *and* an apology. Pick the plainest one.
- **No fresh metaphor per paragraph.** He runs about 1 novel figure per 1,000 words
  and then plainly explains it. Models mint one per paragraph; humans reuse and
  clumsily extend the few they have.

## What to keep

These survive because they're properties of the material, not moves to execute:

- Specific tool names, real commands, actual file paths
- Real numbers with sources
- Honest limits, stated plainly and specifically
- Credit to named collaborators
- Humor that arises from the facts, not humor constructed to land a section

## The meta-rule

Human technical prose has slack — hedges, redundancy, sentences that merely inform,
uneven paragraphs, the occasional shrug. **Uniform optimization is the meta-tell
that subsumes every specific one.** If every paragraph in your draft is doing
rhetorical work, you have written slop no matter how clean the vocabulary is.

Leave flat ground. Let some paragraphs just say a thing.
