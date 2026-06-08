# MVP Scope

## Build Now

The current AlbumLog version is a frontend MVP with real Spotify login and saved
albums loaded from the user's Spotify library.

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
- Spotify saved albums as the first real album source.

## Screens

- Dashboard.
- Search.
- Library.
- Album detail.
- Basic profile.

## Data

Current behavior:

- Current user comes from Spotify login.
- Album catalog is limited to the user's saved Spotify albums.
- User library is derived from saved Spotify albums.
- Reviews start empty.
- Dashboard stats derive from saved Spotify albums.

## Not Included Yet

- Google login.
- Database.
- Global Spotify album catalog/search API beyond saved albums.
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
- A user can view saved Spotify albums after authorizing `user-library-read`.
- Empty states appear when saved albums, favorites, or activity are empty.
- The library can be filtered without fake records.
- The dashboard reflects saved Spotify album metrics.
- Documentation exists in `docs`.
