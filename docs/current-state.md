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
- Empty states for:
  - Dashboard activity.
  - Album search.
  - Library.
  - Profile when logged out.
  - Favorites.
- Album data layer that intentionally returns empty catalog/library states.

## Not Implemented Yet

- Spotify album search/catalog integration.
- MusicBrainz fallback.
- Database.
- Persistent user album library.
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
- Album catalog returns an empty list.
- User library returns an empty list.
- Dashboard stats return zero values.
- Album detail returns `null` until a real catalog exists.

The app should never show fake albums, fake reviews, fake ratings, or fake users.

## Documentation Notes

- `docs/product`, `docs/technical`, `docs/roadmap.md`, and this file describe the current product direction.
- `docs/superpowers/specs` and `docs/superpowers/plans` are historical planning artifacts. They may describe earlier implementation plans that used mock data and should not be treated as the current source of truth.
