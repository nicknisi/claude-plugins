#!/usr/bin/env node

/**
 * Fetch a YouTube video's captions and metadata, then emit a chapter-aligned
 * bundle the model can synthesize from directly.
 *
 * Two upstream tools, both run via `uvx` so nothing needs installing:
 *   - youtube-transcript-api  -> caption segments
 *   - yt-dlp                  -> title, channel, duration, description, chapters
 *
 * The mechanical work happens here (bucketing, merging, timestamp math) so the
 * model only has to do synthesis.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

type Mode = 'full' | 'triage' | 'transcript';

interface RawSegment {
  text: string;
  start: number;
  duration: number;
}

interface Block {
  /** Human timestamp, e.g. "12:34" or "1:02:03". */
  t: string;
  /** Start in whole seconds — append to the URL as `&t=<s>` for a deep link. */
  s: number;
  text: string;
}

interface Chapter {
  index: number;
  title: string;
  start: number;
  start_hms: string;
  end: number | null;
  link: string;
  word_count: number;
  blocks?: Block[];
  preview?: string;
}

interface Metadata {
  title: string | null;
  channel: string | null;
  duration: number | null;
  upload_date: string | null;
  view_count: number | null;
  description: string | null;
  chapters: { start_time: number; end_time?: number; title: string }[];
  subtitle_langs: string[];
  auto_caption_langs: string[];
}

const HELP = `
fetch_video.ts — fetch a YouTube video's captions + metadata as a chapter-aligned bundle

Usage:
  node fetch_video.ts <url-or-video-id> [options]

Runs directly on Node >= 22.18, which strips TypeScript types natively.
There is no build step.

Options:
  --mode <mode>          full (default) | triage | transcript
                           full       JSON bundle, every chapter with timestamped blocks
                           triage     JSON bundle, chapter previews only (cheap)
                           transcript Markdown transcript under chapter headings
  --lang <codes>         Comma-separated caption language priority (default: en)
  --chapters <list>      Keep only these chapter indices (e.g. 3,7,9 or 4-6).
                           Triage first, then pull just the chapters you need.
  --block-seconds <n>    Target seconds per merged block (default: 15)
  --slice-seconds <n>    Bucket width when the video has no chapters (default: 300)
  --plain                transcript mode only: omit timestamps
  --no-metadata          Skip yt-dlp (faster; loses chapters, title, description)
  --out <path>           Write to a file instead of stdout
  --help

Exit codes:
  0  success
  1  bad usage or runtime error
  2  uvx not found
  3  no captions for this video (permanent — captions are disabled)
  4  YouTube is rate-limiting this IP (transient — retry later)
`.trimStart();

function fail(message: string, code = 1): never {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function run(
  cmd: string,
  args: string[],
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise(resolve => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => (stdout += d));
    child.stderr.on('data', d => (stderr += d));
    child.on('error', err =>
      resolve({ code: -1, stdout, stderr: String(err) }),
    );
    child.on('close', code => resolve({ code: code ?? -1, stdout, stderr }));
  });
}

/** Accepts a bare 11-char id or any YouTube URL shape (watch, youtu.be, shorts, live, embed). */
function extractVideoId(input: string): string | null {
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  let url: URL;
  try {
    url = new URL(input.includes('://') ? input : `https://${input}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www|m)\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  }
  if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null;

  const v = url.searchParams.get('v');
  if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

  const match = url.pathname.match(
    /^\/(?:shorts|live|embed|v)\/([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

function hms(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return h > 0
    ? `${h}:${mm}:${String(s).padStart(2, '0')}`
    : `${mm}:${String(s).padStart(2, '0')}`;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Parse "3,7,9" or "4-6" or a mix into a set of chapter indices. */
function parseIndices(spec: string): Set<number> {
  const wanted = new Set<number>();
  for (const part of spec.split(',')) {
    const range = part.trim().match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const [from, to] = [Number(range[1]), Number(range[2])];
      if (from > to) fail(`Invalid chapter range: ${part.trim()}`);
      for (let i = from; i <= to; i++) wanted.add(i);
      continue;
    }
    const single = Number(part.trim());
    if (!Number.isInteger(single) || single < 1) {
      fail(`Invalid chapter index: ${part.trim()}`);
    }
    wanted.add(single);
  }
  return wanted;
}

async function fetchMetadata(id: string): Promise<Metadata | null> {
  const result = await run('uvx', [
    'yt-dlp',
    '--skip-download',
    '--no-warnings',
    '--dump-single-json',
    `https://www.youtube.com/watch?v=${id}`,
  ]);
  if (result.code !== 0 || !result.stdout.trim()) return null;

  try {
    const info = JSON.parse(result.stdout);
    return {
      title: info.title ?? null,
      channel: info.channel ?? info.uploader ?? null,
      duration: typeof info.duration === 'number' ? info.duration : null,
      upload_date: info.upload_date
        ? String(info.upload_date).replace(
            /^(\d{4})(\d{2})(\d{2})$/,
            '$1-$2-$3',
          )
        : null,
      view_count: typeof info.view_count === 'number' ? info.view_count : null,
      description: info.description ?? null,
      chapters: Array.isArray(info.chapters) ? info.chapters : [],
      subtitle_langs: Object.keys(info.subtitles ?? {}),
      auto_caption_langs: Object.keys(info.automatic_captions ?? {}),
    };
  } catch {
    return null;
  }
}

async function fetchSegments(
  id: string,
  langs: string[],
): Promise<RawSegment[]> {
  const result = await run('uvx', [
    '--from',
    'youtube-transcript-api',
    'youtube_transcript_api',
    id,
    '--languages',
    ...langs,
    '--format',
    'json',
  ]);

  if (result.code === -1 && /ENOENT/.test(result.stderr)) {
    fail(
      'uvx not found. Install uv first:\n  brew install uv\n' +
        '(or see https://docs.astral.sh/uv/getting-started/installation/)',
      2,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    const detail = (result.stdout + result.stderr).trim();

    // A rate-limited IP and a captions-disabled video both fail here, but they
    // call for opposite responses: wait and retry vs. give up on this video.
    // yt-dlp is no escape hatch — it fetches captions from the same timedtext
    // endpoint and gets the same 429.
    if (
      /blocking requests from your IP|RequestBlocked|IpBlocked|Too Many Requests|429/i.test(
        detail,
      )
    ) {
      fail(
        `YouTube is rate-limiting this IP, so captions for ${id} are temporarily unavailable.\n` +
          'This is transient. Wait a few minutes, or pass cookies from a logged-in\n' +
          'browser session if it persists. Metadata and chapters are unaffected.\n\n' +
          detail,
        4,
      );
    }

    fail(
      `No captions retrieved for ${id}.\n${detail || 'youtube-transcript-api produced no output.'}`,
      3,
    );
  }

  // The CLI takes a list of video ids, so it returns a list of transcripts.
  const segments =
    Array.isArray(parsed) && Array.isArray(parsed[0])
      ? (parsed[0] as RawSegment[])
      : (parsed as RawSegment[]);

  if (!Array.isArray(segments) || segments.length === 0) {
    fail(`No caption segments returned for ${id}.`, 3);
  }

  return segments
    .filter(seg => seg && typeof seg.start === 'number')
    .map(seg => ({
      start: seg.start,
      duration: typeof seg.duration === 'number' ? seg.duration : 0,
      text: String(seg.text ?? '')
        .replace(/\s+/g, ' ')
        .trim(),
    }))
    .filter(seg => seg.text.length > 0);
}

/**
 * Merge short caption fragments into readable blocks of roughly `target`
 * seconds. Auto-generated captions arrive in 2-3 second slivers; merging cuts
 * the line count several-fold and reads like prose.
 */
function mergeBlocks(segments: RawSegment[], target: number): Block[] {
  const blocks: Block[] = [];
  let start: number | null = null;
  let parts: string[] = [];

  const flush = () => {
    if (start === null || parts.length === 0) return;
    blocks.push({
      t: hms(start),
      s: Math.floor(start),
      text: parts.join(' ').replace(/\s+/g, ' ').trim(),
    });
    start = null;
    parts = [];
  };

  for (const seg of segments) {
    if (start === null) start = seg.start;
    parts.push(seg.text);
    if (seg.start + seg.duration - start >= target) flush();
  }
  flush();

  return blocks;
}

/** Prefer the uploader's own chapters; otherwise slice time into even buckets. */
function buildChapters(
  segments: RawSegment[],
  meta: Metadata | null,
  url: string,
  blockSeconds: number,
  sliceSeconds: number,
): {
  chapters: (Chapter & { blocks: Block[] })[];
  source: 'youtube' | 'time-sliced' | 'single';
} {
  const lastSegment = segments[segments.length - 1];
  const end = Math.max(
    meta?.duration ?? 0,
    lastSegment.start + lastSegment.duration,
  );

  let bounds: { title: string; start: number; end: number | null }[];
  let source: 'youtube' | 'time-sliced' | 'single';

  if (meta?.chapters?.length) {
    source = 'youtube';
    bounds = meta.chapters.map((chapter, i) => ({
      title: chapter.title,
      start: chapter.start_time,
      end: chapter.end_time ?? meta.chapters[i + 1]?.start_time ?? end,
    }));
  } else if (end > sliceSeconds) {
    source = 'time-sliced';
    bounds = [];
    for (let t = 0; t < end; t += sliceSeconds) {
      const stop = Math.min(t + sliceSeconds, end);
      bounds.push({ title: `${hms(t)}–${hms(stop)}`, start: t, end: stop });
    }
  } else {
    source = 'single';
    bounds = [{ title: 'Full transcript', start: 0, end: null }];
  }

  const chapters = bounds.map((bound, i) => {
    const owned = segments.filter(
      seg =>
        seg.start >= bound.start &&
        (bound.end === null || seg.start < bound.end),
    );
    const blocks = mergeBlocks(owned, blockSeconds);
    return {
      index: i + 1,
      title: bound.title,
      start: bound.start,
      start_hms: hms(bound.start),
      end: bound.end === null ? null : Math.floor(bound.end),
      link: `${url}&t=${Math.floor(bound.start)}`,
      word_count: blocks.reduce((sum, b) => sum + countWords(b.text), 0),
      blocks,
    };
  });

  return { chapters: chapters.filter(c => c.blocks.length > 0), source };
}

function renderTranscript(
  chapters: Chapter[],
  meta: Metadata | null,
  url: string,
  plain: boolean,
): string {
  const lines: string[] = [];
  lines.push(`# ${meta?.title ?? 'Transcript'}`);
  lines.push('');
  if (meta?.channel) lines.push(`**Channel:** ${meta.channel}`);
  lines.push(`**URL:** ${url}`);
  lines.push('');
  for (const chapter of chapters) {
    lines.push(`## ${chapter.title}`);
    lines.push('');
    for (const block of chapter.blocks ?? []) {
      lines.push(plain ? block.text : `[${block.t}] ${block.text}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP);
    process.exit(argv.length === 0 ? 1 : 0);
  }

  let target: string | null = null;
  let mode: Mode = 'full';
  let langs = ['en'];
  let blockSeconds = 15;
  let sliceSeconds = 300;
  let plain = false;
  let withMetadata = true;
  let out: string | null = null;
  let keep: Set<number> | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) fail(`${arg} requires a value`);
      return value;
    };
    switch (arg) {
      case '--mode': {
        const value = next();
        if (value !== 'full' && value !== 'triage' && value !== 'transcript') {
          fail(`Unknown mode: ${value}`);
        }
        mode = value;
        break;
      }
      case '--lang':
        langs = next()
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        break;
      case '--block-seconds':
        blockSeconds = Number(next());
        if (!Number.isFinite(blockSeconds) || blockSeconds <= 0) {
          fail('--block-seconds must be a positive number');
        }
        break;
      case '--slice-seconds':
        sliceSeconds = Number(next());
        if (!Number.isFinite(sliceSeconds) || sliceSeconds <= 0) {
          fail('--slice-seconds must be a positive number');
        }
        break;
      case '--chapters':
        keep = parseIndices(next());
        break;
      case '--plain':
        plain = true;
        break;
      case '--no-metadata':
        withMetadata = false;
        break;
      case '--out':
        out = next();
        break;
      default:
        if (arg.startsWith('-')) fail(`Unknown option: ${arg}`);
        if (target) fail('Pass exactly one video URL or id');
        target = arg;
    }
  }

  if (!target) fail('Missing video URL or id');
  const id = extractVideoId(target);
  if (!id) fail(`Could not parse a YouTube video id from: ${target}`);

  const url = `https://www.youtube.com/watch?v=${id}`;

  // Both calls hit the network; run them together.
  const [segments, meta] = await Promise.all([
    fetchSegments(id, langs),
    withMetadata ? fetchMetadata(id) : Promise.resolve(null),
  ]);

  if (withMetadata && !meta) {
    process.stderr.write(
      'warning: yt-dlp metadata unavailable; falling back to time-sliced chapters\n',
    );
  }

  const { chapters: allChapters, source } = buildChapters(
    segments,
    meta,
    url,
    blockSeconds,
    sliceSeconds,
  );

  // Chapter indices are assigned before empty chapters are dropped, so they
  // stay stable between a triage call and a follow-up --chapters call.
  const chapters = keep
    ? allChapters.filter(chapter => keep.has(chapter.index))
    : allChapters;

  if (keep && chapters.length === 0) {
    fail(
      `No chapters matched. Available indices: ${allChapters
        .map(c => c.index)
        .join(', ')}`,
    );
  }

  let output: string;
  if (mode === 'transcript') {
    output = renderTranscript(chapters, meta, url, plain);
  } else {
    const wordCount = chapters.reduce((sum, c) => sum + c.word_count, 0);
    const lang = langs[0];
    const captionKind = !meta
      ? 'unknown'
      : meta.subtitle_langs.some(l => l.startsWith(lang))
        ? 'manual'
        : meta.auto_caption_langs.some(l => l.startsWith(lang))
          ? 'generated'
          : 'unknown';

    const bundle = {
      id,
      url,
      title: meta?.title ?? null,
      channel: meta?.channel ?? null,
      duration: meta?.duration ?? null,
      duration_hms: meta?.duration != null ? hms(meta.duration) : null,
      upload_date: meta?.upload_date ?? null,
      view_count: meta?.view_count ?? null,
      caption_kind: captionKind,
      caption_language: lang,
      chapters_source: source,
      chapters_total: allChapters.length,
      chapters_included: chapters.length,
      word_count: wordCount,
      // ~238 wpm silent reading. Compare against duration to judge whether
      // reading the transcript beats watching.
      reading_minutes: Math.round(wordCount / 238),
      description: mode === 'triage' ? null : (meta?.description ?? null),
      chapters:
        mode === 'triage'
          ? chapters.map(({ blocks, ...rest }) => ({
              ...rest,
              preview: (blocks ?? [])
                .slice(0, 2)
                .map(b => b.text)
                .join(' ')
                .slice(0, 280),
            }))
          : chapters,
    };
    output = JSON.stringify(bundle, null, 2);
  }

  // Roughly 4 chars per token. Long podcasts run past 70k tokens in full mode.
  const estimatedTokens = Math.round(output.length / 4);
  if (estimatedTokens > 25000 && !keep) {
    process.stderr.write(
      `note: this output is ~${estimatedTokens.toLocaleString()} tokens. ` +
        `Consider --mode triage first, then --chapters <indices> for the parts you need.\n`,
    );
  }

  if (out) {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, output.endsWith('\n') ? output : `${output}\n`);
    process.stderr.write(
      `Wrote ${out} (~${estimatedTokens.toLocaleString()} tokens)\n`,
    );
  } else {
    process.stdout.write(output.endsWith('\n') ? output : `${output}\n`);
  }
}

main().catch(err => fail(err instanceof Error ? err.message : String(err)));
