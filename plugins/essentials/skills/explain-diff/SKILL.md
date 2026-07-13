---
name: explain-diff
description: >-
  Produce a rich, self-contained HTML explainer for a code change — deep
  background, core intuition with diagrams, a guided code walkthrough, and an
  interactive quiz. Use whenever the user asks to explain or deeply understand
  a diff, PR, branch, or commit — "explain this PR", "walk me through this
  change", "what does this diff actually do", "make an explainer for this
  branch" — or wants a shareable document that teaches someone else what
  changed and why. Output is an HTML file opened in the browser, not a chat
  reply.
---

# Explain Diff

Create a rich, interactive HTML explanation of a code change. The reader may be a teammate encountering the codebase for the first time or the author checking their own understanding — the document should serve both.

## Resolve the change

Pin down exactly what to explain before writing anything:

- **PR number or URL** — `gh pr diff <number>` for the diff, `gh pr view <number>` for the title, description, and discussion
- **Branch** — `git diff <base>...<branch>` against the repo's default branch
- **Commit** — `git show <sha>`
- **Nothing specified** — the working tree (`git diff HEAD`); if clean, the current branch against the default branch

Then explore beyond the diff: read the touched files in full, their callers, and the subsystem they belong to. The Background section lives or dies on your understanding of the surrounding system, not just the delta.

## Sections

The explanation has four sections, in this order:

1. **Background** — Explain the existing system this change slots into. The reader's familiarity is unknown, so layer it: a deep background for beginners (marked as skippable for readers who already know the system), then a narrower background directly relevant to the change.

2. **Intuition** — Explain the core idea of the change: what problem existed, what insight the change embodies, why this approach. Focus on the essence, not the full details. Use concrete examples with toy data, and use figures and diagrams liberally.

3. **Code** — A high-level walkthrough of the changes. Group and order them for understanding — by concept or data flow — not by file order in the diff.

4. **Quiz** — Five interactive multiple-choice questions testing whether the reader understood the substance. Medium difficulty: answerable only by someone who actually understood the change, but no gotchas. On click, reveal whether the answer was correct with a short explanation either way — the feedback is where the learning happens.

## Output format

Produce a single self-contained HTML file:

- All CSS and JavaScript inline, no external requests (CDNs, fonts, images) — the file is opened locally and must work offline.
- One long page with section headers and a table of contents. Don't use tabs for the top-level structure.
- Basic responsive styling so it reads well on a phone.
- Save it outside the repo so it stays out of version control, with the filename starting with today's date so the files stay time-sorted: `/tmp/YYYY-MM-DD-explanation-<slug>.html`.
- When done, open it in the browser (`open <path>` on macOS) and tell the user the path.

## Writing style

Write with the clarity and flow of Martin Kleppmann — engaging, classic style, with smooth transitions between sections. Use callouts for key concepts, definitions, and important edge cases.

## Diagrams

- Pick a small number of diagram families and reuse them throughout to explain different cases — a repeated visual form makes each new instance easier to parse. Useful families:
  - A simplified version of the UI the user sees in the app, for explaining UI changes.
  - A system diagram showing data flow or communication between components — always populated with example data.
- Build diagrams from simple HTML and CSS, and lists from HTML lists. Never use ASCII art — it breaks under responsive layouts and proportional fonts.
- Use `<pre>` tags for code blocks. If a custom-styled div is used instead, its CSS **must** include `white-space: pre` or `pre-wrap`, or the browser will collapse every newline into a single line. Before saving the file, scan each code block in the HTML source and confirm its whitespace handling.
