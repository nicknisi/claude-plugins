# Content Plugin

Tools for bootstrapping content creation including blog posts and conference talks.

## Skills

### blog-post-writer

Transforms brain dumps into polished blog posts in Nick Nisi's voice.

Use this when you have scattered ideas, talking points, and conclusions that need organization into a cohesive narrative with a conversational, authentic tone.

**Example usage:**

```
/blog-post-writer

[provide your brain dump of ideas, code examples, observations, etc.]
```

The skill will:

- Gather constraints (target length, audience, draft vs revision)
- Fetch your latest posts from nicknisi.com for live voice calibration
- Choose the best narrative framework for the content
- Structure your unorganized thoughts into a post with proper Astro frontmatter
- Apply Nick's writing voice and tone throughout

**Narrative frameworks** (auto-selected based on content):

- **Story Circle** - Personal journey or transformation
- **SCQA** - Analytical problem-solving
- **Progressive Disclosure** - Teaching a concept
- **Compare & Contrast** - Evaluating trade-offs
- **Post-mortem** - Incident or failure retrospective
- **PAS** - Short, punchy fix stories

**Bundled references:**

- `voice-tone.md` - Writing style guide
- `post-template.md` - Astro frontmatter schema and output format
- `ai-slop-checklist.md` - AI writing tells checklist (with live Wikipedia sync)
- 6 narrative framework references (loaded selectively)

### conference-talk-builder

Creates conference talk outlines and iA Presenter markdown slides using the Story Circle narrative framework.

Use this when you need to structure a tech talk, create presentation slides, or organize talk ideas into a story-driven format.

**Example usage:**

```
/conference-talk-builder

I want to create a talk about [your topic]
```

The skill will:

- Gather information about your talk topic and audience
- Map your content to the 8-step Story Circle framework
- Generate properly formatted iA Presenter markdown slides
- Include speaker notes and code examples

**Bundled references:**

- `story-circle.md` - Eight-step narrative structure
- `ia-presenter-syntax.md` - iA Presenter markdown syntax

## Narrative Frameworks

The blog-post-writer skill supports six narrative frameworks, auto-selected based on content type. The conference-talk-builder uses the Story Circle framework. See individual reference files in `skills/blog-post-writer/references/` and `skills/conference-talk-builder/references/` for details.

## Installation

```bash
/plugin marketplace add nicknisi/claude-plugins
/plugin install content@nicknisi
```

## Version

0.3.0
