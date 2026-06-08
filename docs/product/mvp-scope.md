# MVP Scope

## Build Now

The first AlbumLog version is a frontend MVP with mocked data.

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
- Mock data and mock API client functions.

## Screens

- Dashboard.
- Search.
- Library.
- Album detail.
- Basic profile.

## Data

Use local mock data for:

- Current user.
- Album catalog.
- User library entries.
- Reviews.
- Dashboard stats.

## Not Included Yet

- Real auth.
- Google login.
- Database.
- Spotify API.
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

- A user can search for an album by title or artist.
- A user can add or update an album status.
- A user can assign ratings from `0.5` to `5.0`.
- A user can write and view a review.
- The library can be filtered by status.
- The dashboard reflects mocked library state.
- Documentation exists in `docs`.
