# Current State

This document is the source of truth for what AlbumLog currently implements.

## Implemented

- Next.js App Router application.
- TypeScript.
- React Query.
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
- Discover page at `/discover` with Spotify catalog search and friend recommendations empty state.
- Library/dashboard data sourced from the user's saved Spotify albums.
- Token refresh for Spotify API calls when the session has a refresh token.
- Empty states for:
  - Dashboard activity.
  - Discover catalog search when there are no Spotify album matches.
  - Friend recommendations while social features are not implemented.
  - Library when Spotify has no saved albums or the user has not authorized library access.
  - Profile when logged out.
  - Favorites.
- Album data layer backed by `/api/spotify/saved-albums` and `/api/spotify/search-albums`.

## Not Implemented Yet

- MusicBrainz fallback.
- Database.
- Persistent AlbumLog user album library.
- Add album to library.
- Album status persistence.
- Rating persistence.
- Review persistence.
- Public profiles.
- Friends/follows.
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
- Saved albums come from Spotify's `/v1/me/albums` endpoint.
- Discover catalog search uses Spotify's `/v1/search` endpoint for album results.
- Library shows saved Spotify albums as AlbumLog entries with default status `Quero ouvir`.
- Dashboard stats are derived from the saved albums currently loaded.
- Ratings, reviews, and AlbumLog-specific status are not persisted yet.

The app should never show fake albums, fake reviews, fake ratings, or fake users.

## Documentation Notes

- `docs/product`, `docs/technical`, `docs/roadmap.md`, and this file describe the current product direction.
- `docs/superpowers/specs` and `docs/superpowers/plans` are historical planning artifacts. They may describe earlier implementation plans that used mock data and should not be treated as the current source of truth.
