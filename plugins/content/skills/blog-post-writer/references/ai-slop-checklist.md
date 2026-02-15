# AI Writing Tells — Self-Review Checklist

Adapted from [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), which catalogs patterns statistically overrepresented in LLM output. Use this as a final pass to catch robotic phrasing that slipped through.

This checklist is **descriptive, not prescriptive**. A few of these patterns appear naturally in good human writing. The signal is density — one "pivotal" is fine; five AI vocabulary words in two paragraphs is a rewrite.

## Overused AI Vocabulary

Words that spiked in frequency after 2023, corroborated by peer-reviewed studies. Scan for clusters of these:

> additionally, align with, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight (verb), interplay, intricate/intricacies, key (adjective), landscape (abstract), multifaceted, nuanced, pivotal, realm, showcase, tapestry (abstract), testament, underscore (verb), valuable, vibrant

One or two in a full post is fine. A cluster of 3+ in a section means the LLM was on autopilot.

## Inflated Significance

LLMs inflate importance with a small repertoire of phrases. Scan for:

- "stands as a testament"
- "plays a vital/significant/crucial/pivotal role"
- "underscores its importance"
- "watershed moment" / "key turning point"
- "indelible mark"
- "setting the stage for"
- "evolving landscape"
- "deeply rooted"
- "enduring/lasting legacy"

**The fix:** Say what actually happened. Specific facts beat vague significance.

## Superficial -ing Analysis

LLMs tack present participle phrases onto sentences as fake depth:

- "...ensuring a seamless experience"
- "...highlighting its importance"
- "...emphasizing the need for"
- "...reflecting broader trends"
- "...contributing to the ecosystem"
- "...fostering a sense of community"

**The fix:** If the -ing clause adds no information the reader didn't already have, cut it.

## Promotional Language

Words that read like a travel brochure or sales deck:

> breathtaking, stunning, nestled, in the heart of, boasts a, vibrant, rich (figurative), profound, groundbreaking (figurative), renowned, showcasing, exemplifies, commitment to, natural beauty, rich cultural tapestry/heritage

Nick's voice is enthusiastic but specific. "The terminal felt like home" beats "a vibrant and rich developer experience."

## Vague Authority

LLMs attribute claims to phantom experts:

- "Industry reports suggest..."
- "Observers have cited..."
- "Experts argue..."
- "Some critics contend..."
- "Several publications have noted..."

**The fix:** Name the person or drop the attribution. Nick cites real people, real projects, real numbers.

## Formulaic Transitions

These transitions read like a five-paragraph essay:

> moreover, furthermore, in addition, on the other hand, in contrast, it's important to note, it is worth mentioning, no discussion would be complete without

Nick uses casual transitions: "Here's the thing:", "But then...", "The strange part?"

## Negative Parallelism Overuse

The "not X, it's Y" construction:

- "It's not just about X, it's about Y"
- "Not only... but also..."
- "It isn't X — it's Y"

**Nuance:** Nick uses this pattern deliberately and sparingly ("You're not being replaced; you're being amplified"). The tell is when every other paragraph uses it, or when it creates false profundity from obvious contrasts.

## Rule of Three

LLMs default to grouping things in threes:

- "convenient, efficient, and innovative"
- "keynote sessions, panel discussions, and networking opportunities"

When every list has exactly three items, it's suspicious. Vary the count. Two items is fine. Four is fine. One is fine.

## Copula Avoidance

LLMs replace "is" with fancier verbs:

- "serves as" instead of "is"
- "stands as" instead of "is"
- "represents" instead of "is"
- "marks" instead of "is"
- "boasts" instead of "has"
- "features" instead of "has"

Sometimes the fancy verb is right. Usually "is" is better.

## Elegant Variation

LLMs use increasingly elaborate synonyms to avoid repeating a word:

> the tool → the solution → the platform → the offering → the ecosystem

If you're talking about vim, just say vim again. Readers don't mind repetition of concrete nouns. They notice when you cycle through thesaurus entries.

## Em Dash Overuse

LLMs use em dashes (—) at 2-3x the rate of human writers. They substitute them for commas, parentheses, and colons in a formulaic, "punched up" style.

Nick does use em dashes — they're fine in moderation. The tell is when every other sentence has one, or when a comma would be more natural.

## Formatting Tells

- **Excessive boldface**: bolding every key term mechanically, "key takeaways" style
- **Title Case In Every Heading**: Nick uses sentence case
- **Bullet + bold header + colon**: the "**Term:** Description of term" pattern in every list
- **Emoji decoration**: emoji before every section heading or bullet point

## Challenges-and-Future Formula

The rigid "Despite its success, X faces challenges... Despite these challenges, X continues to thrive" sandwich. If you catch yourself writing "despite" twice in a paragraph, restructure.

## How to Use This Checklist

1. Finish the draft first — don't self-censor while writing
2. Read through once scanning for vocabulary clusters
3. Read through again checking structural patterns (parallelism density, list uniformity, transition formality)
4. For each hit: Is this a deliberate rhetorical choice, or did the LLM default to it? If you can't articulate why the fancy version is better, use the plain one
5. When in doubt, read it aloud. If it sounds like a press release, rewrite it. If it sounds like something you'd actually say, keep it.
