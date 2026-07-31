# Sources

Read and extract from external source material. Some pages block direct fetching,
some carry their content somewhere other than the HTML, and video carries it in a
caption track that has to be reassembled before it means anything.

## Installation

```
/plugin marketplace add nicknisi/claude-plugins
/plugin install sources@nicknisi
```

## Skills

| Skill           | Use when                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `link-reader`   | A twitter.com, x.com, or reddit.com URL needs reading. Routes through proxy APIs that aren't blocked.                  |
| `youtube-notes` | A YouTube video needs triaging, digesting, or answering one question, with every claim carrying a clickable timestamp. |

They stay separate on purpose. `link-reader` fetches and formats: what it returns
is the post. `youtube-notes` fetches, aligns captions to the uploader's chapters,
synthesizes, and cites: what it returns is notes about the video. Merging them
would force one description to cover tweets, Reddit threads, and video digests,
which makes triggering mushy for all three.

## Requirements

`link-reader` needs nothing. It uses built-in web fetching against proxy APIs.

`youtube-notes` needs [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
on `PATH`:

```bash
brew install uv
```

Plus Node >= 22.18, which strips TypeScript types natively so the script runs
without a build step. Older Node fails at parse time with a syntax error before
the script can report anything useful.

Nothing is installed globally. `youtube-transcript-api` (captions) and `yt-dlp`
(metadata, chapters) both run through `uvx` on demand, so they stay current and
leave no footprint.

---

## `link-reader`

Platforms and their workarounds:

| Platform    | URL patterns                                        | Route                      |
| ----------- | --------------------------------------------------- | -------------------------- |
| Twitter / X | `*/status/*`, `*/article/*` on twitter.com or x.com | FxTwitter API              |
| Reddit      | `reddit.com/r/*/comments/*`                         | Append `.json` to the path |

X articles arrive as Draft.js blocks, so the skill documents the block-type and
entity-range mapping needed to turn them back into markdown.

---

## `youtube-notes`

Built for interrogating a video, not just summarizing one. The transcript is
cached per video id on first fetch, so follow-up questions, mode switches, and
different chapter pulls all read from disk. Load once, then ask freely.

```
first fetch (whisper path)   35.6s
every call after that         0.06s
```

Three modes:

- **triage** — a worth-watching verdict for roughly a tenth of the tokens.
  Metadata, chapter titles, per-chapter previews.
- **digest** — TL;DR, key takeaways, claims worth checking, a chapter walkthrough,
  quotes, open questions. Every claim carries a timestamped deep link.
- **extract** — one question, answered from the relevant chapters only.

Optionally writes notes into a vault. Set the destination in
`.claude/sources.local.md`:

```markdown
---
vault_dir: /path/to/vault/Videos
---
```

### Script

One TypeScript file, run directly by Node. No build, no dependencies, no `dist/`
to drift out of sync with its source. `--help` is the authoritative reference:

```bash
node skills/youtube-notes/scripts/fetch_video.ts --help
```

```bash
# Worth watching?
node skills/youtube-notes/scripts/fetch_video.ts "https://youtu.be/aircAruvnKk" --mode triage

# Full bundle, JSON
node skills/youtube-notes/scripts/fetch_video.ts aircAruvnKk --mode full --out video.json

# Only the chapters that matter (indices are stable across calls)
node skills/youtube-notes/scripts/fetch_video.ts aircAruvnKk --mode full --chapters 3,7-9

# Plain markdown transcript
node skills/youtube-notes/scripts/fetch_video.ts aircAruvnKk --mode transcript
```

Accepts a bare 11-character video id or any YouTube URL shape: `watch?v=`,
`youtu.be/`, `/shorts/`, `/live/`, `/embed/`.

### Notable behavior

- **Block merging.** Auto-generated captions arrive in 2-3 second fragments. The
  script merges them into ~15 second blocks (`--block-seconds`), which cut an
  18-minute video from 286 lines to 68 and read like prose instead of a stutter.
- **Chapter fallback.** No uploader chapters means 5-minute time slices
  (`--slice-seconds`), reported honestly as `chapters_source: "time-sliced"` so
  bucket labels are never passed off as real chapter names.
- **Caption provenance.** `caption_kind` reports `manual`, `generated`, or `whisper`,
  so quotes get trusted according to where the words actually came from.
- **Transcript cache.** Keyed by video id under `$XDG_CACHE_HOME/youtube-notes`.
  The cached payload is the raw upstream input, not a rendered bundle, so every
  mode is a pure transformation of it and switching modes after the first fetch
  costs nothing. `--refresh` refetches, `--no-cache` opts out, `--cache-dir`
  relocates it.
- **Token estimate.** Printed to stderr, with a nudge toward `--chapters` when the
  bundle is large. A 3h45m podcast is ~75k tokens whole, ~2k in triage.
- **Metadata is optional.** If `yt-dlp` fails, captions still come through and
  chapters fall back to time slices.
- **Rate limiting is real and no client change escapes it.** Roughly 25 caption
  requests in ten minutes got a residential IP 429'd on YouTube's `timedtext`
  endpoint, and the block outlasted half an hour. Measured, not guessed:

  | Request                              | Result |
  | ------------------------------------ | ------ |
  | `youtube-transcript-api`             | 429    |
  | `yt-dlp` subtitle download           | 429    |
  | `curl` with a real Chrome User-Agent | 429    |
  | `curl` of the watch page (metadata)  | 200    |

  The quota is per-IP and per-endpoint, and it ignores request headers, so
  swapping libraries or hand-rolling the HTTP call buys nothing. Exit 4 marks the
  condition transient so the skill says "retry shortly" instead of "this video
  has no captions."

  Two things do get around it. The cache, because a request never made can't be
  throttled. And `--whisper-fallback`, below.

- **Whisper fallback.** `--whisper-fallback` downloads the audio and transcribes
  it locally. This works _during_ a block: the media CDN serving audio is not
  subject to the caption quota, and pulled 7.73 MiB at 25 MB/s while every
  caption request was still 429ing.

  Apple Silicon uses `mlx-whisper`; everywhere else falls back to
  `openai-whisper` (untested here, no non-Mac machine to try it on). An 8:20
  video transcribed in 78s on an M3 Pro including the one-time ~1.6 GB model
  download, then 35s on subsequent videos. Output is cached like any other
  transcript, and reports `caption_kind: "whisper"` so local ASR is never
  mistaken for something YouTube served.

  Every other skill in this space treats Whisper as the answer to _captions
  being disabled_. It also answers _being rate-limited_, which nobody seems to
  have noticed.

  Browser cookies are deliberately not offered. [Upstream warns](https://github.com/jdepoix/youtube-transcript-api)
  that authenticating that way eventually gets the account permanently banned.

### Exit codes

| Code | Meaning                                            |
| ---- | -------------------------------------------------- |
| 0    | Success                                            |
| 1    | Bad usage or runtime error                         |
| 2    | `uvx` not found                                    |
| 3    | No captions published (try `--whisper-fallback`)   |
| 4    | Rate-limited by YouTube (try `--whisper-fallback`) |
| 5    | Local transcription failed                         |

### Development

Edit `scripts/fetch_video.ts` and run it. Nothing to install or rebuild.

```bash
./skills/youtube-notes/test/run.sh   # 45 checks, no network
```

The suite shadows `uvx` on `PATH` with a stub that replays fixtures, so it can't
be defeated by the rate limit above. It runs against an isolated cache dir, and
the cache checks include a control that proves they aren't passing vacuously by
confirming the same call genuinely fails with no cache and no upstream. Captions are synthetic (374 segments, three
seconds apart, three words each) which makes every derived number hand-checkable
instead of dependent on what YouTube served that day. Metadata is a real `yt-dlp`
dump trimmed to the fields the script reads.

Types are checked on demand:

```bash
npx tsc --noEmit --strict --target ES2022 --module NodeNext \
  --moduleResolution NodeNext --types node skills/youtube-notes/scripts/fetch_video.ts
```

## Layout

```
plugins/sources/
├── .claude-plugin/plugin.json
├── README.md
└── skills/
    ├── link-reader/SKILL.md
    └── youtube-notes/
        ├── SKILL.md
        ├── scripts/fetch_video.ts
        └── test/            run.sh, uvx stub, fixtures
```
