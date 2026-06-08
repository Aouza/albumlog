# MVP Scope

## Build Now

The current AlbumLog version is a frontend MVP with real Spotify login, Spotify
catalog discovery, and saved albums loaded from the user's Spotify library.

It should prove the main product loop:

1. Discover albums through Spotify catalog search.
2. View saved Spotify albums in the library.
3. Filter the personal library.
4. Prepare for future add/status/rating/review persistence.

## Technology

- Next.js.
- TypeScript.
- React Query.
- Spotify OAuth.
- Spotify saved albums as the first real album source.
- Spotify Search API for discovery.

## Screens

- Dashboard.
- Discover.
- Library.
- Album detail.
- Basic profile.

## Data

Current behavior:

- Current user comes from Spotify login.
- Discover catalog search uses Spotify album results and does not list the user's saved library.
- User library is derived from saved Spotify albums.
- Reviews start empty.
- Dashboard stats derive from saved Spotify albums.

## Not Included Yet

- Google login.
- Database.
- MusicBrainz API.
- Friends.
- Feed.
- Likes.
- Annual ranking.
- Listening clubs.
- Challenges.
- Music compatibility.
- Smart recommendations.

## Acceptance Criteria

- A user can log in with Spotify.
- A user can search Spotify album catalog from Discover.
- A user can view saved Spotify albums after authorizing `user-library-read`.
- Empty states appear when saved albums, favorites, or activity are empty.
- Friend recommendations show a truthful empty state until social features exist.
- The library can be filtered without fake records.
- The dashboard reflects saved Spotify album metrics.
- Documentation exists in `docs`.
