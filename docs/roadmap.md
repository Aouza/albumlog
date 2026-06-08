# Roadmap

## MVP

- Spotify login.
- Empty states for dashboard, search, library, profile, and favorites.
- Album data layer with no fake records.
- Documentation for current architecture and Spotify auth.

## Next MVP Milestone

- Database-backed user model.
- Spotify saved-album import into AlbumLog-owned tables.
- Manual Spotify library sync.
- Library backed by persisted user data.
- Persist album status.
- Persist rating.
- Persist review.
- Add album to library from Discover.

## v1.1

- Public profile.
- Follow users.
- Albums in common with friends.
- Friend-to-friend album recommendations.
- Activity feed.
- Review likes.

## v1.2

- Wishlist separated from the main library.
- Annual ranking.
- Statistics:
  - Total albums heard.
  - Total artists.
  - Total reviews.
  - Estimated music hours.

## v2.0

- Listening clubs.
- Listening challenges.
- Musical compatibility between users.
- Intelligent recommendations.

## Data Integrations

### Spotify

Primary source for:

- Album name.
- Artist.
- Cover.
- Release date.
- External link.

### MusicBrainz

Fallback catalog source.
