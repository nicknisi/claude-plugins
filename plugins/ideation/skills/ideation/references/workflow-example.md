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

1. **Intake**: Accept without judgment

2. **Codebase Exploration**: Explore existing project structure, identify relevant patterns, understand current architecture

3. **Analysis**:
   - Problem: Users need to save and organize content
   - Goals: Save items, organize with tags, search, offline support
   - Unclear: What items? Why tags > folders? Sharing scope? Offline priority?
   - Confidence: ~55/100 (low problem clarity, unclear scope)

4. **Questions** (round 1):
   - "What type of items are users bookmarking? Articles, products, posts?"
   - "You mentioned tags over folders. Should tags be user-created or predefined?"
   - "Is offline support MVP or can it wait for phase 2?"
   - "When you say 'sharing eventually,' what does that look like?"

5. **User responds** → Recalculate confidence → Repeat if needed

6. **Confidence reaches 96%** → Generate contract

7. **Contract approved** → Ask: "Straight to specs or PRDs first?"

8. **Determine phases**:
   - Phase 1: Core bookmarking with tags
   - Phase 2: Search and filtering
   - Phase 3: Offline support
   - Phase 4: Sharing (future)

9. **Generate specs** (referencing codebase patterns found in step 2)
   - Each spec includes a **Feedback Strategy** (inner-loop command, playground type)
   - Each iterative component gets a **Feedback Loop** (playground, experiment, check command)
   - Self-review feedback loop quality before presenting — Strong/Adequate/Weak (see `confidence-rubric.md`)

10. **Execution handoff**: Analyze dependencies, present orchestration strategy
    - Phases 2-4 are independent → recommend agent team
    - Generate team prompt with per-teammate assignments

11. **Implementation** (fresh sessions): For each phase:
    - Start fresh Claude session (or use agent team for parallel phases)
    - Run `/execute-spec spec-phase-{n}.md`
    - Agent sets up feedback environment first (test runner, dev server, etc.)
    - For each component: set up loop → build incrementally → check → iterate
    - Review, test, commit
    - Repeat for next phase
