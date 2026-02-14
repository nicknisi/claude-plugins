# PRD: Bookmark Feature - Phase 1

**Contract**: ./contract-example.md
**Phase**: 1 of 2
**Focus**: Core bookmarking with tag support and offline storage

## Phase Overview

Phase 1 delivers the foundational bookmarking experience: users can save articles, organize them with tags, and access saved content offline. This is sequenced first because all Phase 2 features (search, cross-device sync) depend on the bookmark data model and persistence layer.

After this phase, users can bookmark articles with one click, manage tags, and read saved articles without network connectivity. This covers the most-requested feature (saving articles) and the highest pain point (losing previously read content).

## User Stories

1. As a reader, I want to bookmark an article with one click so that I can find it later without copy-pasting URLs
2. As a power user, I want to tag my bookmarks so that I can organize saved articles by topic
3. As a commuter, I want to read bookmarked articles offline so that I can access content on the subway

## Functional Requirements

### Bookmarking

- **FR-1.1**: Users can toggle bookmark on/off from the article header with a single click
- **FR-1.2**: Bookmark button shows filled state when article is bookmarked, unfilled when not
- **FR-1.3**: Bookmarking an article caches the full article content for offline access

### Tag Management

- **FR-1.4**: Users can create new tags with a name up to 50 characters
- **FR-1.5**: Users can assign multiple tags to any bookmark
- **FR-1.6**: Users can rename and delete existing tags
- **FR-1.7**: Deleting a tag removes it from all bookmarks (does not delete the bookmarks)

### Bookmark List

- **FR-1.8**: Users can view all bookmarks in a list sorted by creation date (newest first)
- **FR-1.9**: Users can filter the bookmark list by tag
- **FR-1.10**: Bookmark list shows article title, tags, and date saved

## Non-Functional Requirements

- **NFR-1.1**: Bookmark toggle responds within 100ms (perceived instant)
- **NFR-1.2**: Bookmark list renders within 200ms for up to 500 bookmarks
- **NFR-1.3**: Offline cached content available immediately on app load (no network required)
- **NFR-1.4**: IndexedDB storage usage stays under 50MB for typical usage (100 bookmarked articles)

## Dependencies

### Prerequisites

- None — this is Phase 1

### Outputs for Next Phase

- Bookmark data model with IndexedDB persistence
- Tag system with CRUD operations
- Offline content cache infrastructure

## Acceptance Criteria

- [ ] Bookmark button visible on all article views
- [ ] Toggling bookmark updates icon state immediately
- [ ] Bookmarked articles load fully when device is offline
- [ ] Tags can be created, renamed, deleted, and assigned to bookmarks
- [ ] Bookmark list filters correctly by tag
- [ ] All unit tests passing
- [ ] No critical bugs open

---

_Review this PRD and provide feedback before spec generation._
