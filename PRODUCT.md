# Product

## Register

product

## Users

Nick (and other developers who install the ideation plugin) reviewing a generated planning artifact in the browser mid-workflow. They've just finished a planning interview in Claude Code; the contract HTML is where they slow down, read the full plan, weigh risks, and approve or push back before any code is written. Context: a developer's desktop browser, often alongside a terminal, in light or dark ambient setups (the system already ships both themes). Sessions are read-heavy — minutes of careful review, not glanceable dashboards.

## Product Purpose

The design surface of this repo is the ideation plugin's generated HTML artifacts: `contract.html` (the plan-of-record a user signs off on) and implementation notes. Source of truth lives in `plugins/ideation/skills/ideation/references/contract-template.html` and `plugins/ideation/scripts/contract-gen.css`; generated copies land in `docs/ideation/*/` and the user's ideation output directory. Success: a reviewer can absorb scope, phases, risks, and open questions quickly, trust what they're reading, and feel the weight of approving it — a contract, not a printout.

## Brand Personality

Calm, authoritative, technically precise. The document body stays quiet and readable; energy concentrates in deliberate bold moments — the hero/header, status indicators, and decision points (risk callouts, approval state). Mono-spaced accents and dense metadata signal serious developer tooling without costuming. Opinionated where it counts, neutral everywhere else.

## Anti-references

- **Generic SaaS dashboard**: card grids, hero-metric blocks, gradient accents — the AI-generated SaaS template look.
- **Corporate report / consulting deck**: sterile cover-page formality, watermark energy, decoration standing in for substance.
- **Notion / docs-tool default**: flat gray everything-is-a-block sameness with no hierarchy commitment.

## Design Principles

1. **Calm body, bold moments.** Reading surfaces are quiet; visual energy is rationed to the hero, statuses, and decision points where attention genuinely belongs.
2. **A contract, not a printout.** The artifact should feel signed and settled — precise metadata, clear versioning/supersedes lineage, unambiguous status.
3. **Built for the long read.** Hierarchy, line length, and contrast tuned for minutes of careful review, not seconds of scanning.
4. **Tooling honesty.** Mono accents and dense data where data lives; no fake terminal chrome, no decoration pretending to be information.
5. **Both rooms lit.** Light and dark themes are co-equal; every choice must hold up in each.

## Accessibility & Inclusion

WCAG AA: ≥4.5:1 body-text contrast (3:1 for large text) in both light and dark themes, `prefers-reduced-motion` alternatives for any animation, keyboard-reachable interactive elements (collapsibles, approval controls). Artifacts are single self-contained HTML files, so all of this must hold without external dependencies.
