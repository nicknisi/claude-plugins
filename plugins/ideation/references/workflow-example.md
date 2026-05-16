# Workflow Example

**User provides brain dump** (via dictation):

```
okay so i'm thinking about this feature where users can like save their
favorite items you know like bookmarking but also they should be able to
organize them into folders or something maybe tags actually tags might be
better because folders are too rigid and oh we should probably have a
search too because if they have a lot of bookmarks it'll be hard to find
anything and maybe some kind of sharing eventually but that's probably
phase 2 or something and it should work offline too because people might
be on planes or whatever and sync when they come back online
```

**Process**:

1. **Intake**: Accept without judgment. State position upfront:
   - "Strong: You have a clear core feature (bookmarking) with reasonable extensions. Weak: 'tags might be better because folders are too rigid' is a preference, not evidence. 'People might be on planes' is hypothetical. Let me interview you to nail this down."

2. **Interview loop** (one question at a time, interleaved with codebase exploration):

   **Q1**: "What type of items are users bookmarking? I'd recommend scoping this to articles — your app already has an `Article` model with content rendering, and that's the primary content type. Does that match your intent, or are you thinking broader?"
   - _User_: "Yeah, articles for now, maybe products later"

   **Q2**: _(explores codebase — finds existing tag system on articles)_ "Your codebase already has a `Tag` model with a many-to-many relation on `Article`. I'd recommend reusing that system for bookmark organization rather than building a new one. The existing tags are admin-created — should bookmark tags be user-created, or reuse the existing set?"
   - _User_: "User-created, separate from the content tags"

   **Q3**: "You said 'tags might be better because folders are too rigid' — that's a preference, not evidence. Have users complained about folder-based organization? My recommendation: start with tags since your codebase already has the pattern, but don't rule out folders until you have usage data."
   - _User_: "Fair, no complaints — it's just my gut. Tags first, revisit later."

   **Q4**: "Is offline support MVP or can it wait? I'd recommend deferring it — your app is currently fully server-rendered with no service worker infrastructure. Adding offline would mean introducing IndexedDB, a sync layer, and conflict resolution. That's a separate project."
   - _User_: "Yeah, defer it. Phase 2 at earliest."

   **Q5**: "When you say 'sharing eventually,' what does that look like? My recommendation: sharing a read-only link to a bookmark collection — simplest version, no auth required for viewers."
   - _User_: "Exactly, just a public link."

   _(Confidence now at 96% — all dimensions ≥ 18)_

3. **Contract generated** → Artifacts written to `./docs/ideation/bookmarks/contract.md` only now — no files created during the interview

4. **Contract approved** → Ask: "Straight to specs or PRDs first?"

5. **Determine phases**:
   - Phase 1: Core bookmarking with user-created tags
   - Phase 2: Search and filtering
   - Phase 3: Offline support
   - Phase 4: Sharing (future)

6. **Generate specs** (referencing codebase patterns found during interview)
   - Each spec includes a **Feedback Strategy** (inner-loop command, playground type)
   - Each iterative component gets a **Feedback Loop** (playground, experiment, check command)
   - Self-review feedback loop quality before presenting — Strong/Adequate/Weak (see `confidence-rubric.md`)

7. **Execution handoff**: Analyze dependencies, present orchestration strategy
   - Phases 2-4 are independent → recommend agent team
   - Generate team prompt with per-teammate assignments

8. **Implementation** (fresh sessions): For each phase:
   - Start fresh Claude session (or use agent team for parallel phases)
   - Run `/execute-spec spec-phase-{n}.md`
   - Agent sets up feedback environment first (test runner, dev server, etc.)
   - For each component: set up loop → build incrementally → check → iterate
   - Review, test, commit
   - Repeat for next phase
