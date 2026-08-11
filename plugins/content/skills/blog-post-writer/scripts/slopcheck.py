#!/usr/bin/env python3
"""
Corpus-calibrated structural slop detector.

Vocabulary scanners miss modern AI prose. The tells are structural and, critically,
they are *rates* — a real writer uses every one of these devices occasionally. Slop
is what happens when a device fires on every section instead of once a post.

So this measures a draft against the author's own published corpus and flags
outliers in BOTH directions (over-suppression is as suspicious as excess).

Usage:
    slopcheck.py --corpus 'posts/*.md*' --draft draft.mdx
    slopcheck.py --corpus 'posts/*.md*'              # just print baselines
    slopcheck.py --corpus 'posts/*.md*' --draft d.mdx --extract-interiority
"""

import argparse
import glob
import re
import statistics
import sys

# ---------------------------------------------------------------- text cleanup


def strip_markdown(text):
    """Reduce a .md/.mdx post to prose. Everything we strip would skew the stats."""
    text = re.sub(r"^---\n.*?\n---\n", "", text, flags=re.S)  # frontmatter
    text = re.sub(r"^import .*$", "", text, flags=re.M)  # mdx imports
    text = re.sub(r"```.*?```", "", text, flags=re.S)  # fenced code
    text = re.sub(r"<[A-Z][^>]*>.*?</[A-Z][^>]*>", "", text, flags=re.S)  # jsx blocks
    text = re.sub(r"<[^>]+>", "", text)  # stray tags
    text = re.sub(r"^\s*\|.*$", "", text, flags=re.M)  # tables
    text = re.sub(r"^\s*>.*$", "", text, flags=re.M)  # blockquotes (quoted sources)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)  # images
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)  # links -> label
    return text


def split_sections(text):
    """Split on ## headers. Returns [(header, body)]; body may be ''."""
    parts = re.split(r"^##+ +(.*)$", text, flags=re.M)
    if len(parts) == 1:
        return [("", text)]
    out = []
    for i in range(1, len(parts), 2):
        out.append((parts[i].strip(), parts[i + 1]))
    return out


def paragraphs(body):
    return [p.strip() for p in re.split(r"\n\s*\n", body) if p.strip()]


def sentences(p):
    return [s for s in re.split(r"(?<=[.!?])\s+", p.strip()) if s]


def words(t):
    return re.findall(r"\b[\w'-]+\b", t)


# ------------------------------------------------------------------- detectors

# "Not X. It's Y." / "wasn't X. That was Y." / "isn't X, it is Y"
ANTITHESIS = re.compile(
    r"\b(?:not|n't|isn't|wasn't|aren't|weren't)\b[^.!?\n]{0,120}[.,;—-]\s*"
    r"(?:it's|that's|it is|that is|it was|that was|they're|you're)\b",
    re.I,
)

# narrator emceeing his own post
STAGE_DIRECTIONS = re.compile(
    r"\b(?:now watch what|here's the (?:part|thing) (?:that|where)|"
    r"watch what happens|let me be clear|make no mistake|"
    r"i want that on the record|that's the part i'd put on|"
    r"and here's the (?:kicker|rub|twist)|but here's the thing)\b",
    re.I,
)

# staged revelation
EPIPHANY = re.compile(
    r"\b(?:reframed everything|changed everything|something clicked|"
    r"the most \w+ (?:sentence|thing|question) i(?:'ve)? \w+|"
    r"that was the moment|it (?:finally )?clicked|then it hit me|"
    r"i'll never forget the moment)\b",
    re.I,
)

# first-person mental-state predicates: the interiority surface
INTERIORITY = re.compile(
    r"\bI\s+(?:felt|feel|realized|realised|knew|thought|believed|wanted|feared|"
    r"assumed|decided|noticed|understood|suspected|hoped|worried|loved|hated|"
    r"didn't (?:think|realize|realise|know|care|notice)|"
    r"never (?:thought|realized|realised|noticed|considered))\b"
    r"|it (?:had )?never occurred to me"
    r"|\bI'd (?:been|spent|assumed|thought|told myself)\b"
    r"|\bmy (?:exit strategy|whole personality|instinct|first instinct)\b",
    re.I,
)

CLOSURE_DEVICES = {
    "direct address": re.compile(r"^(?:and )?[A-Z][a-z]+ —|^(?:and )?[A-Z][a-z]+,\s", re.M),
    "past-self frame": re.compile(r"what i'd tell|if you'd asked me|July me|past me", re.I),
    "bolded lesson": re.compile(r"\*\*[^*]{40,}\*\*"),
    "apology/absolution": re.compile(r"\bsorry about\b|\byou were right\b", re.I),
}


def is_punchline(par):
    """Short, sentence-y, no data. The aphoristic mic-drop."""
    w = words(par)
    if not (0 < len(w) <= 20):
        return False
    if len(sentences(par)) > 2:
        return False
    if re.search(r"\d|`|http|\]\(", par):  # numbers, code, links = informational
        return False
    if par.rstrip().endswith(":"):
        return False
    return True


def analyze(text):
    prose = strip_markdown(text)
    secs = split_sections(prose)
    all_words = words(prose)
    n = max(len(all_words), 1)
    per_k = lambda c: round(c * 1000 / n, 2)

    sec_stats = []
    punch_endings = 0
    for header, body in secs:
        pars = paragraphs(body)
        if not pars:
            continue
        ends = is_punchline(pars[-1])
        punch_endings += ends
        sec_stats.append((header, len(words(body)), ends, pars[-1][:70]))

    n_secs = max(len(sec_stats), 1)
    sec_lengths = [s[1] for s in sec_stats] or [0]
    cv = (
        statistics.pstdev(sec_lengths) / statistics.mean(sec_lengths)
        if len(sec_lengths) > 1 and statistics.mean(sec_lengths)
        else 0
    )

    # long-long-punch rhythm
    triplets = 0
    for _, body in secs:
        for p in paragraphs(body):
            ss = sentences(p)
            for i in range(len(ss) - 2):
                a, b, c = (len(words(x)) for x in ss[i : i + 3])
                if a > 15 and b > 15 and c < 7:
                    triplets += 1

    tail = " ".join(paragraphs(secs[-1][1])[-3:]) if secs else ""
    closure = [k for k, rx in CLOSURE_DEVICES.items() if rx.search(tail)]

    return {
        "words": n,
        "sections": n_secs,
        "punchline_ending_rate": round(punch_endings / n_secs, 2),
        "antithesis_per_1k": per_k(len(ANTITHESIS.findall(prose))),
        "stage_directions": len(STAGE_DIRECTIONS.findall(prose)),
        "epiphany_markers": len(EPIPHANY.findall(prose)),
        "interiority_per_1k": per_k(len(INTERIORITY.findall(prose))),
        "em_dash_per_1k": per_k(prose.count("—")),
        "section_length_cv": round(cv, 2),
        "long_long_punch_per_1k": per_k(triplets),
        "closure_devices_stacked": len(closure),
        "_closure": closure,
        "_sections": sec_stats,
        "_prose": prose,
    }


# Direction of suspicion: "high" = only excess is bad, "both" = suppression too.
METRICS = {
    "punchline_ending_rate": "high",
    "antithesis_per_1k": "high",
    "stage_directions": "high",
    "epiphany_markers": "high",
    "interiority_per_1k": "high",
    "em_dash_per_1k": "both",
    "long_long_punch_per_1k": "high",
    "closure_devices_stacked": "high",
    "section_length_cv": "low",  # too UNIFORM is the tell
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--corpus", required=True, help="glob of known-genuine posts")
    ap.add_argument("--draft")
    ap.add_argument("--exclude", default="", help="substring of corpus paths to skip")
    ap.add_argument("--extract-interiority", action="store_true")
    args = ap.parse_args()

    files = [f for f in sorted(glob.glob(args.corpus)) if not (args.exclude and args.exclude in f)]
    if not files:
        sys.exit(f"no corpus files matched {args.corpus!r}")

    base = {}
    for f in files:
        a = analyze(open(f, encoding="utf-8").read())
        if a["words"] < 300:
            continue
        for m in METRICS:
            base.setdefault(m, []).append(a[m])

    print(f"CORPUS BASELINE  ({len(base['em_dash_per_1k'])} posts)\n" + "=" * 62)
    stats = {}
    for m in METRICS:
        v = base[m]
        mean, sd = statistics.mean(v), (statistics.pstdev(v) or 0.01)
        stats[m] = (mean, sd)
        print(f"  {m:26s} mean {mean:7.2f}   sd {sd:6.2f}   max {max(v):7.2f}")

    if not args.draft:
        return

    d = analyze(open(args.draft, encoding="utf-8").read())
    print(f"\nDRAFT: {args.draft}  ({d['words']} words, {d['sections']} sections)\n" + "=" * 62)

    fails = []
    for m, direction in METRICS.items():
        mean, sd = stats[m]
        val = d[m]
        z = (val - mean) / sd
        bad = (
            (direction == "high" and z > 2)
            or (direction == "low" and z < -2)
            or (direction == "both" and abs(z) > 2)
        )
        mark = "  FLAG" if bad else "      "
        print(f"{mark}  {m:26s} {val:7.2f}   (corpus {mean:.2f}, z={z:+.1f})")
        if bad:
            fails.append((m, val, mean, z))

    print("\n  section endings:")
    for header, wc, punch, tail in d["_sections"]:
        print(f"    {'PUNCHLINE' if punch else '   flat  '}  {header[:34]:34s} {wc:5d}w  \u2192 {tail}")
    if d["_closure"]:
        print(f"\n  closure devices stacked in final section: {', '.join(d['_closure'])}")

    if args.extract_interiority:
        print("\n" + "=" * 62)
        print("UNSOURCED INTERIORITY \u2014 every line below is a claim about the")
        print("author's inner life. Each needs a real source or the author's own")
        print("words. This check cannot be automated away.\n")
        for i, s in enumerate(
            [s for p in paragraphs(d["_prose"]) for s in sentences(p) if INTERIORITY.search(s)], 1
        ):
            print(f"  {i:2d}. {s.strip()[:150]}")

    print()
    if fails:
        print(f"RESULT: {len(fails)} structural flag(s) \u2014 rewrite before the prose pass.")
        sys.exit(1)
    print("RESULT: no structural outliers vs corpus.")


if __name__ == "__main__":
    main()
