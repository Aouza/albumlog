# AlbumLog MVP Design

## Context

AlbumLog is a music diary for people who listen to full albums. The first version should validate the core product loop without committing to a real backend yet.

The MVP will be a Next.js app with TypeScript and React Query. Data will be mocked locally, but exposed through query/mutation functions shaped like future API calls so the app can later connect to Spotify, MusicBrainz, Supabase, or custom API routes with limited UI changes.

## Product Goal

Help users build a personal album history by searching albums, adding them to a library, assigning listening status, rating them, and writing reviews.

Primary success for the MVP: a user can add or update a first album in less than one minute.

## Recommended Approach

Build an app-first frontend prototype:

- Next.js App Router.
- TypeScript.
- React Query for async data state.
- Mock data modules for albums, user albums, profile, and stats.
- Componentized screens that reflect the future product structure.

This approach gives the product a usable shape quickly while keeping the future backend boundary clear.

## Scope

### In Scope

- Dashboard with listening summary, recent activity, and quick access to search/library.
- Album search by title or artist using local mock data.
- Album result cards with cover, artist, release date, and action to add/update library status.
- Library view organized by status, rating, artist, and date.
- Album detail view with status, rating, review, and listened date.
- Mock user profile with favorite albums and review count.
- Project documentation in `docs`.

### Out of Scope

- Real authentication.
- Google login.
- Spotify API integration.
- MusicBrainz fallback.
- Persistent database.
- Public profiles, follows, feed, likes, clubs, challenges, compatibility, and intelligent recommendations.

These are documented as future milestones rather than implemented in the first frontend scaffold.

## User Flow

1. User opens Dashboard.
2. User searches for an album, for example `The Dark Pool`.
3. User opens a result or adds it directly.
4. User marks the album as `Quero Ouvir`.
5. Later, user changes status to `Ouvido`.
6. User rates the album, for example `4.5`.
7. User writes a review.
8. Album appears in Library and Dashboard history.

## Information Architecture

- `/`: Dashboard.
- `/search`: album search and result list.
- `/library`: personal library with filters and sorting.
- `/albums/[id]`: album detail and editable user entry.
- `/profile`: basic mock public-style profile.

## Data Model

The frontend model mirrors the planned backend entities:

- `User`: id, name, email, avatarUrl, createdAt.
- `Album`: id, spotifyId, title, artist, coverUrl, releaseDate, genres, externalUrl.
- `UserAlbum`: id, userId, albumId, status, rating, review, listenedAt, createdAt, updatedAt.
- `Follow`: id, followerId, followingId, createdAt.

Album status values:

- `want_to_listen`
- `listening`
- `listened`
- `favorite`
- `abandoned`
- `relisten`

## React Query Design

React Query will be used even with mocks:

- `useAlbumsSearch(query)` reads mock albums filtered by title/artist.
- `useLibrary(filters)` returns user library entries.
- `useAlbum(id)` returns album detail.
- `useUpdateUserAlbum()` updates mock state through a local client boundary.

The mock layer should feel like a small API client, not direct component imports of raw arrays.

## Component Design

Core components:

- `AppShell`: navigation and page frame.
- `AlbumCard`: compact album display for grids and result lists.
- `AlbumCover`: stable image wrapper with fallback.
- `StatusSelect`: album status control.
- `RatingInput`: 0.5 to 5.0 rating control.
- `ReviewEditor`: review textarea and save action.
- `LibraryFilters`: status, sort, and text filters.
- `StatsStrip`: dashboard metrics.

## Error and Empty States

- Search shows an empty state when no album matches.
- Library shows a first-use state with a link to search.
- Album cover falls back to a styled placeholder.
- Mock mutations should show optimistic UI where simple and invalidate related queries.

## Visual Direction

The interface should feel like a daily-use music journal rather than a marketing page. Album covers are the strongest visual element. Controls should be compact, direct, and scan-friendly.

Use restrained layout, clear typography, and enough visual personality to feel music-focused without turning the app into a decorative landing page.

## Testing and Verification

Initial verification:

- TypeScript check.
- Lint/build command available from `package.json`.
- Browser check of dashboard, search, library, detail, and profile once a dev server exists.

Future test additions:

- Unit tests for filters and mock client behavior.
- Component tests for rating/status interactions.
- Integration tests for the main flow once persistence exists.

## Documentation Deliverables

Create these docs inside `albumlog/docs`:

- `product/prd.md`
- `product/mvp-scope.md`
- `technical/architecture.md`
- `technical/data-model.md`
- `roadmap.md`

## Open Decisions

The MVP uses local mocks and no persistence. Persisting user edits across refresh can be added later with local storage or a backend.

The first visual implementation can use a simple custom CSS/Tailwind setup depending on the scaffold selected during implementation.
