# Implementation Spec: Bookmark Feature - Phase 1

**Contract**: ./contract-example.md
**Estimated Effort**: M

*Note: This example omits template sections not applicable to a frontend-only phase: Data Model, API Design, Error Handling, Rollout Considerations, and Open Items. Include those sections when they apply to your spec — Error Handling in particular is almost always applicable for non-trivial features.*

## Technical Approach

Phase 1 implements core bookmarking with tag support. The app uses React with a Zustand store and IndexedDB for persistence. We'll add a `bookmarks` slice to the store, a `BookmarkButton` component, and a tag management UI. IndexedDB handles offline storage naturally — bookmarked article content is cached locally.

Pattern to follow: the existing "reading history" feature in `src/features/history/` uses the same store + IndexedDB + component pattern.

## Feedback Strategy

**Inner-loop command**: `pnpm test -- --filter bookmarks`

**Playground**: Test suite — most changes are to the Zustand store and IndexedDB integration. Tests run in milliseconds and catch logic errors immediately.

**Why this approach**: The bookmark feature is data-layer heavy with a thin UI layer. A fast scoped test runner is the tightest feedback loop.

## File Changes

### New Files

| File Path | Purpose |
|-----------|---------|
| `src/features/bookmarks/bookmark-store.ts` | Zustand store slice for bookmark state |
| `src/features/bookmarks/bookmark-db.ts` | IndexedDB operations for bookmark persistence |
| `src/features/bookmarks/BookmarkButton.tsx` | Toggle bookmark on/off for an article |
| `src/features/bookmarks/BookmarkList.tsx` | List view of all bookmarks with tag filters |
| `src/features/bookmarks/TagManager.tsx` | Create, rename, delete tags |
| `src/features/bookmarks/bookmark-store.spec.ts` | Unit tests for store logic |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `src/features/article/ArticleView.tsx` | Add `BookmarkButton` to article header |
| `src/app/navigation.tsx` | Add "Bookmarks" link to sidebar |
| `src/store/index.ts` | Register bookmark store slice |

## Implementation Details

### Bookmark Store

**Pattern to follow**: `src/features/history/history-store.ts`

```typescript
interface Bookmark {
  id: string;
  articleId: string;
  title: string;
  url: string;
  tags: string[];
  createdAt: Date;
  content: string; // Cached for offline
}

interface BookmarkStore {
  bookmarks: Map<string, Bookmark>;
  tags: Set<string>;
  addBookmark(article: Article): Promise<void>;
  removeBookmark(articleId: string): Promise<void>;
  toggleTag(bookmarkId: string, tag: string): void;
  createTag(name: string): void;
  deleteTag(name: string): void;
}
```

**Implementation steps**:
1. Create store with Zustand `create()` following history-store pattern
2. Wire IndexedDB persistence via `bookmark-db.ts`
3. Sync to IndexedDB on every mutation (same pattern as history-store)

**Feedback loop**:

- **Playground**: Create `bookmark-store.spec.ts` with a describe block and one smoke test (`it('initializes with empty bookmarks')`) before writing the store
- **Experiment**: Test add/remove with 0, 1, and 100 bookmarks. Test tag operations: add, remove, rename, delete tag assigned to bookmarks. Test IndexedDB persistence: add bookmark, rehydrate store, verify state.
- **Check command**: `pnpm test -- --filter bookmark-store`

### BookmarkButton Component

**Pattern to follow**: `src/features/history/HistoryIndicator.tsx`

**Implementation steps**:
1. Create component that reads bookmark state for current article
2. Toggle bookmark on click
3. Show filled/unfilled icon based on state
4. Add to `ArticleView.tsx` header section

**Feedback loop**:

- **Playground**: Start dev server (`pnpm dev`), navigate to any article view
- **Experiment**: Toggle bookmark on unbookmarked article (filled icon), toggle again (unfilled), refresh page (state persists via store). Verify store tests still pass after wiring the component.
- **Check command**: `pnpm test -- --filter bookmarks`

## Testing Requirements

### Unit Tests

| Test File | Coverage |
|-----------|----------|
| `src/features/bookmarks/bookmark-store.spec.ts` | Add, remove, toggle tag, create/delete tag |

**Key test cases**:
- Adding a bookmark caches article content
- Removing a bookmark clears cached content
- Tags persist across store rehydration
- Duplicate bookmarks are prevented

## Validation Commands

```bash
pnpm typecheck
pnpm test -- --filter bookmarks
pnpm build
```
