# Spotify Library Sync

## Verdict

This is viable and strategically important for AlbumLog.

Spotify should be treated as the initial source for a user's album library, while AlbumLog stores its own normalized copy to power product features Spotify does not provide well:

- personal music history;
- social library comparison;
- albums in common with friends;
- friend-to-friend recommendations;
- wishlist;
- public profile sections;
- future compatibility scoring.

The important product decision is that AlbumLog does not let one user read another user's Spotify account directly. Each user authorizes AlbumLog separately, AlbumLog syncs that user's data into its own database, and social features read from AlbumLog-owned records according to privacy rules.

## Spotify Capability

The Spotify endpoint for saved albums is:

```text
GET https://api.spotify.com/v1/me/albums
```

It requires the `user-library-read` scope and returns the authenticated user's saved albums. The response includes:

- album data;
- `added_at`, the timestamp for when the album was saved;
- pagination fields such as `next`, `offset`, `limit`, and `total`.

Spotify's saved-albums endpoint supports pagination with a maximum `limit` of 50 items per request.

Spotify does not provide a webhook for saved-album changes, so AlbumLog needs explicit or scheduled synchronization.

## Current MVP Status

AlbumLog has the first persistence slice implemented with Prisma and Supabase Postgres.

Implemented:

- Prisma schema and initial migration.
- `users`, `spotify_accounts`, `albums`, `user_albums`, and `spotify_library_syncs`.
- encrypted Spotify token storage.
- Spotify account persistence after OAuth callback.
- manual `/api/spotify/sync` endpoint.
- `/api/spotify/sync/status` endpoint for the latest sync run.
- Library button for `Atualizar Spotify`.
- Library sync status summary with latest run time, imported count, and removed count.
- `/api/spotify/saved-albums` reads persisted library rows first and falls back to live Spotify data for unsynced users.
- manual full sync reconciliation for Spotify-sourced albums removed from the user's saved Spotify albums.
- safe sync error responses for the client, with server-side logging for investigation.
- Prisma config loads `.env.local` for local development and prefers `DIRECT_URL` for CLI database operations.
- concurrent manual sync protection per user, backed by a Postgres partial unique index for `status = 'syncing'`.
- batch persistence for manual sync imports to reduce per-album database round trips.

Not implemented yet:

- automatic six-hour sync;
- scheduled background sync;
- live progress updates while a foreground sync is running;
- queue/worker retries and backoff;
- friends and recommendations.

## Recommended Data Model

### users

```text
id
display_name
avatar_url
created_at
updated_at
```

### spotify_accounts

Keep Spotify auth separate from the public user profile.

```text
id
user_id
spotify_user_id
display_name
avatar_url
access_token_encrypted
refresh_token_encrypted
scope
token_expires_at
connected_at
last_profile_synced_at
created_at
updated_at
```

Security notes:

- Do not store raw Spotify tokens in `users`.
- Store tokens encrypted at rest.
- Never expose access tokens or refresh tokens to the client.
- If token encryption is not ready, keep the current signed HTTP-only session approach for MVP and postpone background sync.

### albums

Album metadata should be canonicalized separately from user ownership.

```text
id
spotify_album_id
title
artist_name
cover_url
spotify_url
release_date
created_at
updated_at
```

### user_albums

This is AlbumLog's user-owned album relationship.

```text
id
user_id
album_id
source: spotify | manual | recommendation
status: want_to_listen | listening | listened | favorite | abandoned | relisten
rating
review
listened_at
spotify_saved_at
removed_from_spotify
created_at
updated_at
```

Notes:

- `spotify_saved_at` maps from Spotify's `added_at`.
- `removed_from_spotify` should not delete AlbumLog history. It only means the album no longer appears in Spotify's saved library.
- `status`, `rating`, and `review` belong to AlbumLog, not Spotify.

### spotify_library_syncs

```text
id
user_id
status: idle | syncing | failed
started_at
finished_at
sync_type: initial_full | incremental | manual_full | scheduled_full
last_synced_at
last_full_synced_at
total_imported
total_updated
total_marked_removed
error_message
created_at
updated_at
```

### album_recommendations

```text
id
sender_id
receiver_id
album_id
message
status: unread | seen | saved | dismissed
created_at
updated_at
```

## Initial Full Sync

When the user connects Spotify for the first time:

1. User authorizes Spotify with `user-library-read`.
2. AlbumLog fetches all pages from `/v1/me/albums` with `limit=50`.
3. AlbumLog upserts album metadata into `albums`.
4. AlbumLog upserts the user relationship into `user_albums`.
5. AlbumLog records sync metadata in `spotify_library_syncs`.

The operation must be idempotent:

- rerunning the same sync should not duplicate albums;
- unique keys should protect `albums.spotify_album_id`;
- unique keys should protect `user_albums(user_id, album_id)`.

## Incremental Sync

Incremental sync is useful for recently added albums.

Suggested strategy:

1. When the user opens the app, check `last_synced_at`.
2. If the last sync is older than a configured threshold, run a lightweight sync.
3. Fetch saved albums ordered by Spotify's default saved-library order.
4. Continue page by page until finding albums already known for that user.
5. Upsert new albums and update `last_synced_at`.

Recommended MVP threshold:

```text
6 hours
```

This keeps app startup reasonably fresh without calling Spotify on every page load.

## Manual Sync

The Library page should eventually expose:

```text
Atualizar Spotify
```

Behavior:

- user clicks button;
- backend starts a manual sync;
- UI shows last sync time and progress state;
- if sync fails, show an actionable error state.

For MVP, the button can trigger a foreground sync for the current user. Later, this should move to a background job.

Current implementation:

- `POST /api/spotify/sync` runs a foreground manual full sync for the logged-in user.
- `GET /api/spotify/sync/status` returns the latest sync run for the logged-in user.
- The Library page displays the latest finished sync time, imported count, removed count, and a safe failure message.
- A user cannot start two Spotify library syncs at the same time.
- Album and user-album persistence is batched for the sync snapshot instead of upserting each album independently.

Deferred performance work:

- move long-running syncs to a background job before opening the product to many users;
- expose progress updates instead of waiting for the request to finish;
- add retry/backoff handling for Spotify rate limits and transient database failures;
- periodically refresh metadata for already-known albums if Spotify changes title, cover, release data, or links.

## Full Sync and Removals

Incremental sync is good at detecting additions. It is not enough for removals.

To detect removals:

1. Fetch the full current saved-album set from Spotify.
2. Compare it with AlbumLog's `user_albums` where `source = spotify`.
3. If a Spotify-sourced album exists in AlbumLog but no longer appears in Spotify, mark:

```text
removed_from_spotify = true
```

Do not delete immediately. AlbumLog is a diary, so removing something from Spotify should not erase ratings, reviews, listening history, or recommendations.

Current MVP behavior:

- user can run manual full sync from the Library page;
- manual full sync marks missing Spotify-sourced albums as `removed_from_spotify = true`;
- removed albums are hidden from the default Library view but retained in AlbumLog history;

Recommended later behavior:

- run initial full sync on first connection;
- run manual full sync from the Library page;
- run scheduled full sync weekly for active users only after background jobs exist.

## Privacy Rules

Suggested privacy model:

```text
private
friends
public_summary
```

Rules:

- `private`: no one can see the imported library.
- `friends`: accepted friends can compare libraries and see shared albums.
- `public_summary`: public profile can show selected favorites, wishlist, counts, and reviews marked public.

Albums in common should only compare records that both users are allowed to expose to each other.

## Albums in Common

Once both users have synced libraries, common albums are computed inside AlbumLog:

```sql
SELECT a.album_id
FROM user_albums a
INNER JOIN user_albums b
  ON a.album_id = b.album_id
WHERE a.user_id = :currentUserId
  AND b.user_id = :friendUserId
  AND a.removed_from_spotify = false
  AND b.removed_from_spotify = false;
```

This powers:

- profile overlap;
- compatibility;
- friend recommendation context;
- "you both saved this" UI.

## Friend Recommendations

Recommendation flow:

1. User opens an album.
2. User chooses a friend.
3. User optionally adds a short message.
4. AlbumLog creates an `album_recommendations` record.
5. Receiver sees it in Discover under friend recommendations.
6. Receiver can mark it as saved, dismissed, or later add it to wishlist/library.

Do not require the receiver to have the album saved on Spotify.

## MVP Sequence

Recommended order:

1. Add database and persistent AlbumLog user model.
2. Move Spotify account/token storage into `spotify_accounts`.
3. Add `albums` and `user_albums`.
4. Implement initial full sync on Spotify connection.
5. Replace live saved-album reads with database-backed library reads.
6. Add manual `Atualizar Spotify` sync.
7. Add friends/follows.
8. Add albums in common.
9. Add friend recommendations.

## Deferred

Postpone:

- automatic daily sync;
- background job infrastructure;
- advanced removal reconciliation;
- playlist import;
- algorithmic recommendations;
- musical compatibility scoring.

## Risks and Constraints

- Spotify rate limits require conservative sync frequency.
- Long-running syncs should eventually move out of request/response.
- Token storage must be encrypted before any unattended background sync.
- Spotify data should seed AlbumLog, not replace AlbumLog-owned user state.
- Social visibility must be controlled by AlbumLog privacy settings, not by Spotify account relationships.

## Product Principle

Spotify helps the user save and play music.

AlbumLog should use Spotify as an import source, then create its own social memory layer around albums.
