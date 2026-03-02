# Bookmark Feature Contract

**Created**: 2026-01-15
**Confidence Score**: 96/100
**Status**: Approved

## Problem Statement

Users of the Acme Reader app have no way to save articles for later. They resort to browser bookmarks or copy-pasting URLs into notes, losing context about why they saved an item. Power users report spending 5-10 minutes per session re-finding articles they read previously.

## Goals

1. **Enable saving articles** with one-click bookmarking from any article view
2. **Support organization via tags** — user-created tags with autocomplete from existing tags
3. **Add search within bookmarks** — full-text search across saved article titles and tags
4. **Maintain offline access** — bookmarked articles available without network connectivity

## Success Criteria

- [ ] Users can bookmark/unbookmark any article from the article view
- [ ] Users can create, rename, and delete tags
- [ ] Users can assign multiple tags to a bookmark
- [ ] Search returns results within 200ms for up to 1,000 bookmarks
- [ ] Bookmarked articles load fully when offline
- [ ] Bookmarks sync across devices within 30 seconds when online

## Scope Boundaries

### In Scope

- Bookmark CRUD operations
- Tag management (create, rename, delete, assign to bookmarks)
- Full-text search across bookmarks
- Offline storage of bookmarked article content
- Cross-device sync via existing user account system

### Out of Scope

- Sharing bookmarks with other users — deferred to future project
- Bookmark folders or hierarchical organization — tags are sufficient for v1
- Import/export of bookmarks — low priority, revisit after launch
- Analytics on bookmark usage — not needed for v1

### Future Considerations

- Social bookmarking (share collections with friends)
- Smart tags (auto-suggested based on article content)
- Bookmark digest emails (weekly summary of saved items)

## Execution Plan

### Dependency Graph

```
Phase 1: Core Bookmarking + Tags ┐
                                  ├─ Phase 2: Search & Filtering
                                  └─ Phase 3: Offline Support
```

### Strategy: Hybrid (Phase 1 sequential, then Phases 2-3 parallel)

1. **Phase 1 — Core Bookmarking** (sequential, blocks all others)
   ```
   /ideation:execute-spec docs/ideation/bookmarks/spec-phase-1.md
   ```

2. **Phases 2 & 3 — parallel after Phase 1**

   Start one Claude Code session, enter delegate mode (Shift+Tab), paste:

   ```
   Phase 1 (Core Bookmarking) is complete. Create an agent team to
   implement 2 remaining phases in parallel. Each phase is independent.

   Spawn 2 teammates with plan approval required. Each teammate should:
   1. Read their assigned spec file
   2. Explore the codebase for relevant patterns before planning
   3. Plan their implementation approach and wait for approval
   4. Implement following spec and codebase patterns
   5. Run validation commands from their spec after implementation

   Teammates:

   1. "Search & Filtering" — docs/ideation/bookmarks/spec-phase-2.md
      Full-text search across bookmarks with tag-based filtering

   2. "Offline Support" — docs/ideation/bookmarks/spec-phase-3.md
      Cache bookmarked article content for offline access
   ```
