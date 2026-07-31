---
name: youtube-notes
description: >-
  Pull captions from a YouTube video and turn them into chapter-aligned notes
  where every claim carries a clickable timestamp. Use this whenever a
  youtube.com or youtu.be link appears, including a bare pasted link with no
  instructions attached, and whenever the user wants to summarize, digest,
  triage, or take notes on a video, talk, lecture, keynote, podcast, or
  interview: "is this worth watching", "TL;DR this talk", "what do they say
  about X", "find the part where they discuss Y", "save this to my notes",
  "get me the transcript". Prefer this over generic web fetching or page
  readers for YouTube links, because the page HTML carries no transcript. Not
  for downloading video or audio files, and not for local media.
---

# YouTube Notes

Turn a video into something citable. The bundled script does the mechanical
work — fetching captions, aligning them to the uploader's chapters, merging
caption slivers into readable blocks — so your job is synthesis and judgment.

## Fetch

One TypeScript file, run directly by Node with no build step. The `--help`
output is the authoritative flag reference:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/youtube-notes/scripts/fetch_video.ts --help
```

It shells out to `uvx` for `youtube-transcript-api` (captions) and `yt-dlp`
(metadata, chapters). Both run on demand; nothing is installed globally. If
`uvx` is missing the script exits 2 and tells the user to `brew install uv`.

## Pick a mode first

Match the ask, using the table below. When the ask is ambiguous, triage is the
cheaper mistake: it costs roughly a tenth of the tokens and frequently ends the
task, whereas a needless `full` pull on a long video spends real context on
something the user never wanted.

| User intent                                                     | Mode                                 |
| --------------------------------------------------------------- | ------------------------------------ |
| "is this worth watching", "what's this about", bare pasted link | `triage`                             |
| "summarize", "take notes", "digest this", "save to my notes"    | `full`                               |
| "what does it say about X", "find where they discuss Y"         | `triage`, then `full --chapters <n>` |
| "give me the transcript"                                        | `transcript`                         |

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/youtube-notes/scripts/fetch_video.ts "<url>" --mode triage
```

## Long videos: triage, then target

Never pull a full multi-hour bundle. A 3h45m podcast is ~75k tokens in `full`
mode and ~2k in `triage`. The two-step flow:

```bash
# 1. See the shape of it — chapter titles, indices, word counts
node ${CLAUDE_PLUGIN_ROOT}/skills/youtube-notes/scripts/fetch_video.ts "<url>" --mode triage

# 2. Pull only the chapters that matter (accepts 3,7,9 or 4-6)
node ${CLAUDE_PLUGIN_ROOT}/skills/youtube-notes/scripts/fetch_video.ts "<url>" \
  --mode full --chapters 3,7 --out /tmp/video.json
```

Chapter indices are stable across calls, so an index from triage is safe to
reuse. The script prints an estimated token count to stderr and warns when the
output is large. Above roughly 25k tokens, write to `--out` and read the file
back instead of piping through stdout.

## What comes back

JSON modes return metadata plus a `chapters` array. Fields that drive decisions:

- `chapters_source` — `youtube` (the uploader's own chapters, trustworthy
  structure), `time-sliced` (no chapters, so 5-minute buckets titled by range),
  or `single` (short video, one bucket). Only `youtube` reflects authorial
  intent; do not present time-sliced bucket titles as if they were chapter names.
- `caption_kind` — `manual` or `generated`. Generated captions mishear proper
  nouns, technical terms, and numbers. When it is `generated`, treat exact
  quotes as approximate and say so once.
- `word_count` and `reading_minutes` — compare `reading_minutes` against
  `duration_hms` to tell the user whether reading beats watching. It usually
  does for interviews and usually doesn't for anything visual.
- `chapters_total` vs `chapters_included` — if these differ you are looking at a
  subset, so do not claim to have covered the whole video.
- `chapters[].blocks[]` — each block is `{ t, s, text }` where `t` is a display
  timestamp and `s` is that timestamp in whole seconds.

## Citation rule

Every claim you attribute to the video gets a deep link built from the block's
`s` value:

```
<url>&t=<s>
```

So a claim from a block with `"s": 754` on video `abc12345678` cites as
`https://www.youtube.com/watch?v=abc12345678&t=754`.

Never invent a timestamp. If you cannot locate a claim in a specific block,
attribute it to the chapter and use the chapter's `link`, or leave it uncited.

## Triage output

Short. The user is deciding whether to spend 40 minutes.

```markdown
**[Title]** — Channel · 18:40 · ~3,400 words

[Two sentences: what it actually covers, and how it treats the subject.]

**Worth it if:** [who this serves]
**Skip if:** [who it wastes]
**Best chapters:** [Chapter name](link) · [Chapter name](link)
```

Give an actual verdict. "It depends on your goals" is not a verdict.

## Digest output

Ordered so someone who stops reading after ten seconds still got the most
valuable part.

```markdown
# [Title]

**Channel:** [name] · **Duration:** [hms] · **Published:** [date]
**Source:** [url]

## TL;DR

[One or two sentences carrying the video's actual thesis.]

## Key takeaways

- [3-7 standalone insights. Each should survive being read alone.]

## Claims worth checking

- [Claim] — [[m:ss]](deep link)
- [Mark anything the speaker asserts without support, and anything you know to
  be contested.]

## Walkthrough

### [Chapter title] ([m:ss](link))

[What happens here, in a few sentences. Follow the video's own chapters when
`chapters_source` is `youtube`.]

## Notable quotes

> "[quote]" — [[m:ss]](deep link)

## Open questions

[What the video raises and does not answer.]
```

Skip sections that would be filler. A ten-minute tutorial does not need
"Claims worth checking."

## Extract mode

When the user asks one question, answer only that question. Do not emit a
digest. Triage first to read the chapter titles, then pull just the plausible
chapters with `--chapters`. Reply with the answer, the deep links backing it,
and an explicit "the video does not address this" when it doesn't.

## Saving to notes

Only write files when the user asks. If they do, look for a vault directory in
`.claude/sources.local.md`:

```markdown
---
vault_dir: /path/to/vault/Videos
---
```

Absent that setting, ask once where notes should live, then offer to record the
answer there.

When writing into a vault, match the conventions already in it — read a
neighboring note before inventing frontmatter. A reasonable default:

```markdown
---
tags:
  - video
  - youtube
youtube_id: '<video id>'
source: '<url>'
channel: '<channel>'
date: <YYYY-MM-DD>
---
```

Quote `youtube_id` so it stays a string, and grep for it before writing to avoid
duplicating a video already captured.

## Honesty

- The transcript is the only evidence you have. You did not watch the video, so
  do not describe visuals, slides, or demos beyond what the captions state.
- Auto-generated captions garble names and numbers. Do not silently "fix" a
  term into something plausible; flag the uncertainty instead.
- Videos with captions disabled exit 3. Tell the user plainly rather than
  searching the web for a third-party transcript of unknown provenance.
- Exit 4 is different: YouTube is rate-limiting the IP, which is transient. Say
  so and offer to retry in a few minutes. Do not report the video as
  unavailable, and do not retry immediately in a loop — that extends the block.
  Metadata and chapters still work, so a title-and-chapters answer is available
  even while captions are blocked.
