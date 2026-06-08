# MVP Scope

## Build Now

The current AlbumLog version is a frontend MVP with real Spotify login and no
fake album/library records.

It should prove the main product loop:

1. Search albums.
2. Add an album to the library.
3. Set listening status.
4. Rate the album.
5. Write a review.
6. See the album in the personal library.

## Technology

- Next.js.
- TypeScript.
- React Query.
- Spotify OAuth.
- Empty data layer for albums until catalog and persistence are connected.

## Screens

- Dashboard.
- Search.
- Library.
- Album detail.
- Basic profile.

## Data

Current behavior:

- Current user comes from Spotify login.
- Album catalog starts empty.
- User library starts empty.
- Reviews start empty.
- Dashboard stats start at zero.

## Not Included Yet

- Google login.
- Database.
- Spotify album catalog/search API.
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
- Empty states appear when catalog, library, favorites, or activity are empty.
- The library can be filtered by status without fake records.
- The dashboard reflects zero-state metrics.
- Documentation exists in `docs`.
