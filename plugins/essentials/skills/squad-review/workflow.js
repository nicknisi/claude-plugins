export const meta = {
  name: 'squad-review',
  description:
    'Six review lenses over the branch diff, every finding adversarially verified',
  phases: [
    { title: 'Review', detail: 'six specialist lenses in parallel (fable-5)' },
    {
      title: 'Verify',
      detail: 'a skeptic re-opens every cited line and tries to refute it',
    },
  ],
};

// Scope comes from the skill, which reads the git state and picks. Defaults keep
// the workflow runnable standalone.
const scope = (args && args.scope) || 'git diff main...HEAD';
const label = (args && args.label) || 'the current branch';

const FINDINGS = {
  type: 'object',
  additionalProperties: false,
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'file',
          'line',
          'severity',
          'title',
          'what_breaks',
          'evidence',
          'fix',
        ],
        properties: {
          id: {
            type: 'string',
            description: 'short kebab slug, unique within this lens',
          },
          file: { type: 'string', description: 'repo-relative path' },
          line: {
            type: 'string',
            description: 'line or range, e.g. "42" or "42-58"',
          },
          severity: {
            type: 'string',
            enum: ['blocker', 'high', 'medium', 'low'],
          },
          title: { type: 'string', description: 'one short line' },
          what_breaks: {
            type: 'string',
            description:
              'Concrete failure: the input or state, and the wrong result. Not "this is risky".',
          },
          evidence: {
            type: 'string',
            description: 'VERBATIM quote of the offending code. Required.',
          },
          fix: {
            type: 'string',
            description:
              'Smallest change that fixes it. One or two sentences, no code dumps.',
          },
        },
      },
    },
    nothing_found: {
      type: 'string',
      description:
        'If no findings, one sentence on what you checked so the reader knows it ran.',
    },
  },
};

const VERDICTS = {
  type: 'object',
  additionalProperties: false,
  required: ['verdicts'],
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'status', 'reason'],
        properties: {
          id: { type: 'string' },
          status: {
            type: 'string',
            enum: ['CONFIRMED', 'PLAUSIBLE', 'REFUTED'],
          },
          reason: { type: 'string' },
          severity_correction: {
            type: 'string',
            enum: ['blocker', 'high', 'medium', 'low', 'none'],
          },
          fix_correction: {
            type: 'string',
            description: 'Only if the proposed fix would break something.',
          },
        },
      },
    },
    missed: {
      type: 'array',
      items: { type: 'string' },
      description:
        "Real defects in this lens's territory the reviewer overlooked. file:line + one sentence. Do not pad.",
    },
  },
};

const SHARED = `## Scope

Read the diff yourself with: \`${scope}\`
Target: ${label}

Read surrounding code freely to judge impact, but only report on what the diff
changes or newly exposes. Ignore binary files, images, dist/, node_modules/, and
lockfiles.

Read every CLAUDE.md in the repo before judging conventions, architecture, or
project fit.

## Bar

Every finding needs a verbatim quote from the code and a concrete failure — the
input or state that triggers it and the wrong result. A finding you cannot make
fail is not a finding. A skeptic will re-open every line you cite and try to
refute you; findings that read as plausible but aren't reproducible get thrown
out, so do not pad. Three real findings beat twelve soft ones.

If the diff is clean on your lens, return zero findings and say what you checked.`;

const LENSES = [
  {
    key: 'security',
    agentType: 'essentials:security-auditor',
    prompt: `${SHARED}

Apply your full invariant-binding methodology to this diff. Critical and high
severity only — map those to "blocker" and "high" in the schema.`,
  },
  {
    key: 'correctness',
    prompt: `${SHARED}

## Your lens: correctness

Find real bugs the diff introduces or exposes — logic that misbehaves at runtime
for plausible inputs. Silent failure is the worst kind; hunt for it.

For each changed function: enumerate the input classes (types, ranges, null,
empty, edge), enumerate the outputs and side effects, then trace each class
through. Where does it diverge from what a caller would expect?

Look for: swapped or misordered arguments; off-by-one and inclusive/exclusive
confusion; inverted conditions and && / || mixups; error paths that return
success; exception swallowing (empty catch, catch-and-log, catch-and-default);
fallbacks that mask the real failure (empty array on network error, 0 on parse
error); null coalesced instead of propagated; missing await, races, unhandled
rejections, ordering assumptions between parallel promises; timezone, DST,
overflow, floating-point money; serialization round-trips that lose data (Date,
BigInt, Set/Map through JSON); regex wrong at anchors, multiline, or Unicode;
pagination and chunking boundaries; retries without idempotency.

Not your lens: style, naming, performance unless algorithmically wrong.`,
  },
  {
    key: 'conventions',
    prompt: `${SHARED}

## Your lens: conventions

Catch where the diff violates *this repo's* established patterns and written
rules. Not generic best practice from elsewhere — this repo's.

Every finding must cite either a CLAUDE.md rule (quote the line) or an
established pattern you can point to in 3+ other places (list file:line for
each). No evidence, no finding.

Check: CLAUDE.md rules violated or ignored; new spellings of things the repo
already does one specific way (error handling, logging, config access, HTTP
responses, DB access, test structure); file and directory placement; naming
scheme drift; imports crossing module boundaries the rest of the code respects;
bypassed wrappers, helpers, or factories the repo funnels through.

Not your lens: bracket placement, import order unless lint-enforced, "I'd have
written it differently".`,
  },
  {
    key: 'tests',
    prompt: `${SHARED}

## Your lens: test coverage

Judge whether the tests exercise the behavior the diff introduces, and whether
they would fail if the implementation broke.

Take a mutation-testing stance on each non-test change: imagine flipping the
condition, returning a constant, dropping an await. Does any test catch it? If
not, that path is behaviorally uncovered no matter what the coverage number says.

Flag: new logic with no new tests; tests that mock away the thing under test
(mock returns the expected value, test asserts that value — vacuous); tests
asserting only shape with no behavioral content; happy-path-only tests where the
diff adds error handling, and the reverse; snapshot tests that would pass for any
output including wrong ones; integration points stubbed so they can't catch the
common failure (DB mocked to always succeed).

Not your lens: coverage percentage.`,
  },
  {
    key: 'architecture',
    prompt: `${SHARED}

## Your lens: architecture

Judge whether the change fits the shape of the system it lands in — not whether
the code is locally clean.

Ask: does an import point the wrong way (domain importing transport, a low-level
util importing app-level code)? Does the diff leak implementation across a
previously clean boundary (raw SQL in a handler, HTTP concerns in a domain
function, DB types in an API response)? Does it tie 3+ modules into a knot that
now changes together? Does it weaken a tight type (any, unknown, stringly-typed),
rely on a nullable the rest of the system treats as non-null, or widen a union
consumers don't handle? Does it introduce a second source of truth for one fact,
or shared mutable state where callers had isolation? Is the blast radius
proportional — a one-line feature touching 40 files has a shape problem, and so
does a 2,000-line rewrite hiding inside a "small fix"?

Not your lens: naming, comments, local structure.`,
  },
  {
    key: 'duplication',
    prompt: `${SHARED}

## Your lens: duplication and drift

Find where the diff reinvents something this repo already has. This is the lens
that prevents slow entropy — four formatDate helpers, three HTTP wrappers, two
ways to read one config value, none authoritative.

For every meaningful new symbol (function, class, util, constant, wrapper,
adapter, config lookup, type alias, error class, test helper): grep for prior art
by name, by signature shape, by the problem it solves. Does it already exist?
Does something almost like it exist — same intent, different spelling?

Also flag: utility modules parallel to existing utility modules; new error
hierarchies beside existing ones; new config accessors when a helper exists;
fixtures duplicating fixtures; inlined logic (regex, URL parsing, date math) the
repo has a helper for; a new dependency when a installed library already does it.

Do not flag intentional divergence or declared v1/v2 forks. Every finding must
cite the existing implementation with file:line — if you can't find it, there is
no finding.`,
  },
];

log(
  `Reviewing ${label} across ${LENSES.length} lenses, each finding then adversarially verified`,
);

const results = await pipeline(
  LENSES,
  lens =>
    agent(lens.prompt, {
      label: `review:${lens.key}`,
      phase: 'Review',
      schema: FINDINGS,
      model: 'fable',
      ...(lens.agentType ? { agentType: lens.agentType } : {}),
    }),
  (review, lens) => {
    if (!review || !review.findings || !review.findings.length) {
      return {
        lens: lens.key,
        findings: [],
        refuted: [],
        missed: [],
        checked: review && review.nothing_found,
      };
    }
    return agent(
      `You are a SKEPTICAL VERIFIER. A ${lens.key} reviewer produced the findings below against
this diff. Your job is to REFUTE them. Assume each is wrong until you prove otherwise.

Scope: \`${scope}\` — ${label}

For each finding:
1. Open the cited file at the cited line. Does the \`evidence\` quote appear there? If the quote
   is absent, or the location is wrong by more than a couple of lines, or the file does not
   exist → REFUTED. No benefit of the doubt.
2. Is \`what_breaks\` actually reachable? Try to construct the failing input or state. If you
   cannot, or if a guard elsewhere makes it unreachable → REFUTED. Quoting real code and
   misreading its effect is the most common failure mode.
3. Would \`fix\` break something else? Grep for other callers and dependents. If so, use
   fix_correction.
4. Is the severity inflated? Reviewers systematically over-rate. A real but cosmetic issue is
   "low". Reserve "blocker" for things that must not merge.

CONFIRMED means you personally reproduced both the quote and the reasoning. PLAUSIBLE means the
quote is real but the judgment is genuinely arguable. Use REFUTED liberally — a review whose
findings all survive is a review that did not verify.

In \`missed\`, name real defects in this lens's territory the reviewer overlooked, with file:line.
Only real ones.

FINDINGS:
${JSON.stringify(review.findings, null, 2)}`,
      {
        label: `verify:${lens.key}`,
        phase: 'Verify',
        schema: VERDICTS,
        model: 'fable',
      },
    ).then(v => {
      const vmap = new Map(((v && v.verdicts) || []).map(x => [x.id, x]));
      const scored = review.findings.map(f => {
        const verdict = vmap.get(f.id);
        const corrected =
          verdict &&
          verdict.severity_correction &&
          verdict.severity_correction !== 'none'
            ? verdict.severity_correction
            : f.severity;
        return {
          ...f,
          lens: lens.key,
          severity: corrected,
          status: (verdict && verdict.status) || 'UNVERIFIED',
          why: verdict && verdict.reason,
          fix_correction: (verdict && verdict.fix_correction) || null,
        };
      });
      return {
        lens: lens.key,
        findings: scored.filter(f => f.status !== 'REFUTED'),
        refuted: scored
          .filter(f => f.status === 'REFUTED')
          .map(f => ({
            lens: lens.key,
            title: f.title,
            file: f.file,
            why: f.why,
          })),
        missed: ((v && v.missed) || []).map(m => ({ lens: lens.key, note: m })),
      };
    });
  },
);

const clean = results.filter(Boolean);
const RANK = { blocker: 0, high: 1, medium: 2, low: 3 };
const surviving = clean
  .flatMap(r => r.findings)
  .sort((a, b) => RANK[a.severity] - RANK[b.severity]);
const refuted = clean.flatMap(r => r.refuted);
const missed = clean.flatMap(r => r.missed);
const quiet = clean
  .filter(r => !r.findings.length && !r.refuted.length)
  .map(r => r.lens);

log(
  `${surviving.length} findings survived, ${refuted.length} refuted` +
    (missed.length ? `, ${missed.length} caught by verifiers` : ''),
);

return {
  scope: { command: scope, target: label },
  blockers: surviving.filter(f => f.severity === 'blocker'),
  findings: surviving,
  refuted,
  missed,
  lenses_with_nothing: quiet,
  totals: {
    surviving: surviving.length,
    refuted: refuted.length,
    blocker: surviving.filter(f => f.severity === 'blocker').length,
    high: surviving.filter(f => f.severity === 'high').length,
  },
};
