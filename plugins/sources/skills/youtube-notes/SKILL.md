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

## The transcript is cached, so re-running is free

The first fetch for a video is cached by id. Every later call for that video
reads from disk and touches no network: 35s becomes 0.06s, and switching modes
or pulling different chapters costs nothing.

This shapes how to work. Do not ration calls to avoid refetching, because after
the first one there is no refetch. Pull `triage` to see the shape, then pull the
chapters you actually need, then pull different ones when the next question
lands. The only real budget is context, not network.

It is also the main defense against rate limiting, which is the failure mode
this skill hits most. A request you never make cannot be throttled.

`--refresh` forces a refetch, which you need only if a video's captions were
genuinely republished. `--no-cache` skips it entirely.

## The main use: answering questions about a video

Most requests here are conversational. Someone wants to interrogate a video, not
receive a document. Expect several questions across a conversation about one
video.

Load once, properly, then answer from what you have:

1. Pull `--mode triage` to see the chapter map and size.
2. For a short or medium video, pull `--mode full` and keep it in context. Every
   follow-up is then answered without another call.
3. For something multi-hour, pull the chapters that bear on the question with
   `--chapters`, and pull more as the conversation moves. Cached, so cheap.

Answer with the deep links inline so the user can jump to the source. When the
video does not address something, say so plainly rather than reaching for an
adjacent passage.

Resist turning every question into a digest. If someone asks what the speaker
thinks about X, answer that, cite it, and stop.

## Mode by intent

| User intent                                                     | Mode                                        |
| --------------------------------------------------------------- | ------------------------------------------- |
| "is this worth watching", "what's this about", bare pasted link | `triage`                                    |
| "summarize", "take notes", "digest this", "save to my notes"    | `full`                                      |
| a question about the content, or a conversation about the video | `triage`, then `full` (or `--chapters <n>`) |
| "give me the transcript"                                        | `transcript`                                |

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/youtube-notes/scripts/fetch_video.ts "<url>" --mode triage
```

## Long videos

Chapter indices are stable across calls, so an index from triage is safe to
reuse later. A 3h45m podcast is ~75k tokens in `full` and ~2k in `triage`, so
target chapters rather than loading everything:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/youtube-notes/scripts/fetch_video.ts "<url>" \
  --mode full --chapters 3,7 --out /tmp/video.json
```

The script prints an estimated token count to stderr and warns when output is
large. Above roughly 25k tokens, write to `--out` and read the file back rather
than piping it through stdout.

## When captions fail

Two failures, one remedy:

- **Exit 4, rate limited.** YouTube throttles the caption endpoint per IP. It is
  transient and affects only captions; metadata, chapters, and the audio stream
  keep working.
- **Exit 3, no captions published.** Permanent for that video.

Both are answered by `--whisper-fallback`, which downloads the audio and
transcribes it locally. It works during a block because the media CDN is not
subject to the caption quota. Verified: `youtube-transcript-api`, `yt-dlp`
subtitles, and `curl` with a real browser User-Agent all get 429 on the caption
endpoint while audio downloads at full speed.

Ask before using it on the first video of a session. It costs a one-time model
download of roughly 1.6 GB and a minute or two of compute, which is a real cost
the user should agree to. Once they have agreed, keep using it for that
conversation without asking again.

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/youtube-notes/scripts/fetch_video.ts "<url>" \
  --mode full --whisper-fallback
```

Do not suggest browser cookies as a workaround. Upstream warns that
authenticating that way eventually gets the account permanently banned.

Whisper output is cached like any other transcript, so the cost is paid once per
video.

## What comes back

JSON modes return metadata plus a `chapters` array. Fields that drive decisions:

- `chapters_source` — `youtube` (the uploader's own chapters, trustworthy
  structure), `time-sliced` (no chapters, so 5-minute buckets titled by range),
  or `single` (short video, one bucket). Only `youtube` reflects authorial
  intent; do not present time-sliced bucket titles as if they were chapter names.
- `caption_kind` — where the words came from, which sets how much to trust an
  exact quote:
  - `manual` — a human-authored track. Quote freely.
  - `generated` — YouTube's ASR. Mishears proper nouns, technical terms, and
    numbers.
  - `whisper` — local ASR, not anything YouTube served. Usually cleaner prose
    than `generated`, but still guesses at names, product names, and version
    numbers.

  For `generated` or `whisper`, say once that quotes are approximate, and flag
  specific proper nouns you suspect rather than silently correcting them into
  something plausible.

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
- Never search the web for a third-party transcript. A re-publication of unknown
  provenance cannot be verified, and `--whisper-fallback` gets you the real audio
  anyway.
- Do not retry a rate-limited fetch in a loop. It extends the block. Offer
  `--whisper-fallback` or a wait.
- Metadata and chapters survive a caption block, so a title-and-chapter-map
  answer is available even when the transcript is not. Say clearly that it comes
  from metadata and that you have not read the content.
- When `caption_kind` is `whisper`, the words are a local transcription of the
  audio. Do not present them as YouTube's captions.
