#!/usr/bin/env bash
# Deterministic suite for fetch_video.ts. No network, so it can't be defeated by
# YouTube's per-IP rate limit on the timedtext endpoint.
#
# Fixtures:
#   metadata.json — real yt-dlp output for 3Blue1Brown's "But what is a neural
#                   network?", trimmed to the fields the script reads. 12 real
#                   chapters, en in `subtitles` (so caption_kind should be manual).
#   captions.json — synthetic: 374 segments, 3 seconds apart, 3 words each,
#                   spanning 0..1119s. Synthetic on purpose — every derived number
#                   below is then hand-checkable rather than "whatever YouTube
#                   returned today".
#
# Hand-derived expectations:
#   374 segments x 3 words                        = 1122 words
#   round(1122 / 238 wpm)                         = 5 reading_minutes
#   chapter 1 spans 0..67s -> segs at 0,3,..,66   = 23 segments = 69 words
#   15s block target / 3s segments                = 5 segments per block
#   23 segments at 5 per block                    = 5 blocks in chapter 1
#   chapter 3 starts at 162s (from real metadata) -> link ends &t=162

set -uo pipefail
cd "$(dirname "$0")"

SCRIPT="../scripts/fetch_video.ts"
export FIXTURES="$PWD/fixtures"
export PATH="$PWD:$PATH" # shadow the real uvx with ./uvx

# Isolate the cache. Without this the suite would write synthetic transcripts
# into the user's real cache under real video ids, and later genuine runs would
# silently serve fixture data.
CACHE="$(mktemp -d)"
export YOUTUBE_NOTES_CACHE="$CACHE"
trap 'rm -rf "$CACHE"' EXIT
# Most checks assert on a fresh fetch, so default to bypassing the cache and
# let the cache-specific checks opt back in.
SCRIPT="$SCRIPT --no-cache"

pass=0
fail=0
ck() {
  if eval "$2" >/dev/null 2>&1; then
    printf '  ok   %s\n' "$1"
    pass=$((pass + 1))
  else
    printf '  FAIL %s\n' "$1"
    fail=$((fail + 1))
  fi
}

echo "== success paths (network stubbed) =="
ck "uses the uploader's 12 real chapters" \
  "node $SCRIPT aircAruvnKk --mode full | jq -e '.chapters_source==\"youtube\" and .chapters_total==12'"
ck "caption_kind=manual from subtitles key" \
  "node $SCRIPT aircAruvnKk --mode full | jq -e '.caption_kind==\"manual\"'"
ck "every segment lands: 1122 words" \
  "node $SCRIPT aircAruvnKk --mode full | jq -e '.word_count==1122'"
ck "reading_minutes=5" \
  "node $SCRIPT aircAruvnKk --mode full | jq -e '.reading_minutes==5'"
ck "chapter 1 = 69 words" \
  "node $SCRIPT aircAruvnKk --mode full | jq -e '.chapters[0].word_count==69'"
ck "chapter 1 = 5 merged blocks" \
  "node $SCRIPT aircAruvnKk --mode full | jq -e '(.chapters[0].blocks|length)==5'"
ck "first block t=0:00 s=0" \
  "node $SCRIPT aircAruvnKk --mode full | jq -e '.chapters[0].blocks[0].t==\"0:00\" and .chapters[0].blocks[0].s==0'"
ck "second block starts at s=15" \
  "node $SCRIPT aircAruvnKk --mode full | jq -e '.chapters[0].blocks[1].s==15'"
ck "chapter 3 deep link ends &t=162" \
  "node $SCRIPT aircAruvnKk --mode full | jq -e '.chapters[2].link|endswith(\"&t=162\")'"
ck "--block-seconds 60 merges further" \
  "node $SCRIPT aircAruvnKk --mode full --block-seconds 60 | jq -e '(.chapters[0].blocks|length)<5'"

echo "== triage mode =="
ck "previews capped at 280 chars" \
  "node $SCRIPT aircAruvnKk --mode triage | jq -e '([.chapters[].preview|length]|max)<=280'"
ck "blocks omitted entirely" \
  "node $SCRIPT aircAruvnKk --mode triage | jq -e '([.chapters[]|has(\"blocks\")]|any)|not'"
ck "description omitted" \
  "node $SCRIPT aircAruvnKk --mode triage | jq -e '.description==null'"

echo "== chapter selection =="
ck "--chapters 3,7 keeps exactly those" \
  "node $SCRIPT aircAruvnKk --mode full --chapters 3,7 | jq -e '[.chapters[].index]==[3,7]'"
ck "--chapters 2-4 expands the range" \
  "node $SCRIPT aircAruvnKk --mode full --chapters 2-4 | jq -e '[.chapters[].index]==[2,3,4]'"
ck "subset reports total vs included" \
  "node $SCRIPT aircAruvnKk --mode full --chapters 3 | jq -e '.chapters_total==12 and .chapters_included==1'"

echo "== transcript mode =="
ck "timestamped lines" \
  "node $SCRIPT aircAruvnKk --mode transcript | grep -q '^\[0:00\] seg0 alpha bravo'"
ck "--plain drops timestamps" \
  "node $SCRIPT aircAruvnKk --mode transcript --plain | grep -q '^seg0 alpha bravo'"
ck "real title in the header" \
  "node $SCRIPT aircAruvnKk --mode transcript | grep -q 'But what is a neural network'"

echo "== degraded metadata =="
ck "--no-metadata falls back to time slices" \
  "node $SCRIPT aircAruvnKk --mode triage --no-metadata | jq -e '.title==null and .chapters_source==\"time-sliced\"'"

echo "== url parsing =="
for form in \
  "aircAruvnKk" \
  "https://www.youtube.com/watch?v=aircAruvnKk" \
  "https://youtu.be/aircAruvnKk" \
  "https://m.youtube.com/watch?v=aircAruvnKk&list=PLZ&index=2" \
  "https://www.youtube.com/shorts/aircAruvnKk" \
  "https://www.youtube.com/live/aircAruvnKk" \
  "https://www.youtube.com/embed/aircAruvnKk"; do
  ck "parses $form" \
    "node $SCRIPT '$form' --mode triage | jq -e '.id==\"aircAruvnKk\"'"
done

echo "== cache =="
# A dedicated dir per assertion keeps these independent of each other.
C1="$CACHE/c1"
# Keeps node reachable while removing both the uvx stub and any real uvx, so a
# run that still succeeds provably touched no upstream at all.
NOUPSTREAM="$(dirname "$(command -v node)"):/usr/bin:/bin"
ck "first run writes an entry" \
  "node ../scripts/fetch_video.ts aircAruvnKk --mode triage --cache-dir $C1 >/dev/null && test -f $C1/aircAruvnKk.json"
ck "entry records source and segments" \
  "jq -e '.version==1 and .transcript_source==\"manual\" and (.segments|length)==374' $C1/aircAruvnKk.json"
ck "second run serves from cache with no upstream reachable" \
  "PATH='$NOUPSTREAM' node ../scripts/fetch_video.ts aircAruvnKk --mode triage --cache-dir $C1 | jq -e '.chapters_total==12'"
ck "cached data feeds a different mode for free" \
  "PATH='$NOUPSTREAM' node ../scripts/fetch_video.ts aircAruvnKk --mode full --chapters 3 --cache-dir $C1 | jq -e '[.chapters[].index]==[3]'"
ck "no upstream + no cache genuinely fails (control)" \
  "! PATH='$NOUPSTREAM' node ../scripts/fetch_video.ts aircAruvnKk --mode triage --cache-dir $CACHE/empty >/dev/null 2>&1"
ck "--refresh ignores the cached copy" \
  "! node ../scripts/fetch_video.ts aircAruvnKk --mode triage --cache-dir $C1 --refresh 2>&1 >/dev/null | grep -q 'cache hit'"
ck "cache hit is announced on stderr" \
  "node ../scripts/fetch_video.ts aircAruvnKk --mode triage --cache-dir $C1 2>&1 >/dev/null | grep -q 'cache hit'"
ck "--no-cache writes nothing" \
  "node ../scripts/fetch_video.ts aircAruvnKk --mode triage --cache-dir $CACHE/c2 --no-cache >/dev/null && ! test -e $CACHE/c2"
ck "corrupt entry falls back to refetch" \
  "mkdir -p $CACHE/c3 && echo 'not json' > $CACHE/c3/aircAruvnKk.json && node ../scripts/fetch_video.ts aircAruvnKk --mode triage --cache-dir $CACHE/c3 | jq -e '.chapters_total==12'"

echo "== error paths =="
ck "bad url exits 1" "node $SCRIPT https://example.com/x; test \$? -eq 1"
ck "chapter index 0 exits 1" "node $SCRIPT aircAruvnKk --chapters 0; test \$? -eq 1"
ck "reversed range exits 1" "node $SCRIPT aircAruvnKk --chapters 9-2; test \$? -eq 1"
ck "unmatched chapter exits 1" "node $SCRIPT aircAruvnKk --chapters 99; test \$? -eq 1"
ck "unknown flag exits 1" "node $SCRIPT aircAruvnKk --nope; test \$? -eq 1"
ck "two video ids exits 1" "node $SCRIPT abc12345678 def12345678; test \$? -eq 1"
ck "flag without value exits 1" "node $SCRIPT aircAruvnKk --mode; test \$? -eq 1"
ck "no args exits 1" "node $SCRIPT; test \$? -eq 1"
ck "--help exits 0" "node $SCRIPT --help; test \$? -eq 0"

printf '\n%d passed, %d failed\n' "$pass" "$fail"
test "$fail" -eq 0
