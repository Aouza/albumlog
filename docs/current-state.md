# Current State

This document is the source of truth for what AlbumLog currently implements.

## Implemented

- Next.js App Router application.
- TypeScript.
- React Query.
- Prisma.
- Supabase Postgres.
- Dark dashboard UI based on the references in `docs/ui-refs`.
- Spotify OAuth login.
- Signed HTTP-only session cookie.
- Current user endpoint at `/api/auth/me`.
- Logout endpoint at `/api/auth/logout`.
- Login page at `/login`.
- Account menu in the app shell with profile and logout actions.
- Profile page that shows the Spotify user when logged in.
- Spotify saved albums endpoint at `/api/spotify/saved-albums`.
- Spotify catalog search endpoint at `/api/spotify/search-albums`.
- Manual Spotify library sync endpoint at `/api/spotify/sync`.
- Spotify library sync status endpoint at `/api/spotify/sync/status`.
- Discover page at `/discover` with Spotify catalog search and pending friend recommendations.
- Connections page at `/connections`.
- Connection request flow with pending, accepted, and declined states.
- Connection endpoints for user search, request creation, listing, acceptance, decline, and removal.
- Unique public user handles for connection search and future public profile URLs.
- User profile page at `/users/[handle]`.
- Basic public profile visibility for non-connected users.
- Albums in common section for accepted connections.
- Friend album recommendations between accepted connections.
- Recommendation endpoints for creation, listing, acceptance, dismissal, and sender cancellation.
- Album detail endpoint at `/api/albums/[spotifyAlbumId]` backed by the AlbumLog catalog.
- Album pages can show catalog albums even when the current user has not saved them yet.
- Library/dashboard data sourced from AlbumLog persisted Spotify imports.
- Prisma schema and initial Supabase migration for users, Spotify accounts, albums, user albums, and sync runs.
- Spotify account persistence with encrypted token storage.
- Manual Spotify sync marks Spotify-sourced albums as removed when they no longer appear in the user's saved Spotify albums.
- Library page shows the latest Spotify sync status, imported count, removed count, and safe sync errors.
- Manual Spotify sync blocks concurrent syncs for the same user.
- Manual Spotify sync persists album snapshots in batches to reduce database round trips.
- First Spotify connection redirects to Library and starts an initial full sync.
- Later Spotify reconnections redirect to Library and start an incremental sync based on the latest `spotifySavedAt` stored in AlbumLog.
- Library/dashboard reads are database-backed; Spotify is used as an import/sync source, not as the live library source.
- Token refresh for Spotify API calls when the session has a refresh token.
- Empty states for:
  - Dashboard activity.
  - Discover catalog search when there are no Spotify album matches.
  - Friend recommendations when there are no pending recommendations.
  - Library when Spotify has no saved albums or the user has not authorized library access.
  - Profile when logged out.
  - Favorites.
- Album data layer backed by `/api/spotify/saved-albums`, `/api/spotify/search-albums`, and `/api/albums/[spotifyAlbumId]`.

## Not Implemented Yet

- MusicBrainz fallback.
- Add album to library.
- Album status persistence.
- Rating persistence.
- Review persistence.
- Feed.
- Likes.
- Annual ranking.
- Stats based on real listening data.
- Listening clubs.
- Challenges.
- Music compatibility.
- Smart recommendations.

## Current Data Behavior

- Authentication data comes from Spotify after login.
- Spotify account records are persisted in Supabase Postgres after login.
- Saved albums are imported from Spotify's `/v1/me/albums` endpoint during sync.
- Manual sync imports saved Spotify albums into AlbumLog tables and marks missing Spotify-sourced rows as `removedFromSpotify`.
- Manual sync cannot run twice at the same time for the same user.
- Incremental sync imports only albums with Spotify `added_at` newer than the latest `UserAlbum.spotifySavedAt` already stored for the user.
- Discover catalog search uses Spotify's `/v1/search` endpoint for album results.
- Library reads persisted AlbumLog entries only.
- Album detail reads the persisted AlbumLog catalog and joins the current user's library entry when one exists.
- Friend recommendations are persisted in AlbumLog and only allowed between accepted connections.
- Dashboard stats are derived from the saved albums currently loaded.
- Ratings, reviews, and AlbumLog-specific status are not persisted yet.

The app should never show fake albums, fake reviews, fake ratings, or fake users.

## Documentation Notes

- `docs/product`, `docs/technical`, `docs/roadmap.md`, and this file describe the current product direction.
- `docs/superpowers/specs` and `docs/superpowers/plans` are historical planning artifacts. They may describe earlier implementation plans that used mock data and should not be treated as the current source of truth.
