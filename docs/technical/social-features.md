# Social Features

## Current Scope

AlbumLog social features start with bilateral connections.

Product language:

```text
Conexoes
```

A user can send a connection request to another user. The receiver must accept before both users are considered connected.

Users have a unique public handle for discovery and future profile URLs, displayed as:

```text
@lucasdemo
```

## Implemented: Connections

Data model:

```text
connections
id
requester_id
receiver_id
user_a_id
user_b_id
status: pending | accepted | declined | blocked
responded_at
created_at
updated_at
```

Search supports display name and handle.

Rules:

- A user cannot request a connection with themselves.
- A pair of users can only have one connection record.
- `user_a_id` and `user_b_id` store the normalized pair, so A to B and B to A are treated as the same relationship.
- Only the receiver can accept or decline a pending connection.
- Accepted connections are bilateral.
- Albums in common and recommendations must only use `accepted` connections.

Endpoints:

```text
GET /api/connections
POST /api/connections
GET /api/connections/users?q=
POST /api/connections/:id/accept
POST /api/connections/:id/decline
DELETE /api/connections/:id
```

UI:

```text
/connections
```

The page supports:

- searching users by name;
- sending a connection request;
- seeing incoming requests;
- accepting or declining incoming requests;
- seeing accepted connections;
- seeing and canceling outgoing requests.

## Implemented: Connected User Profile And Albums In Common

User profiles are available by handle:

```text
/users/:handle
```

Behavior:

- Any visitor can see basic public user information: name, avatar, and handle.
- The current user's own profile is marked as `self`.
- Accepted connections are marked as `connected`.
- Non-connected users do not expose social library details.

Albums in common compare `user_albums` for two connected users.

Rules:

- Only accepted connections can compare libraries.
- Removed Spotify albums should be excluded by default.
- The feature should return album metadata and basic ownership context for both users.

Endpoint:

```text
GET /api/users/:handle
```

The endpoint returns `albumsInCommon` only when the relationship is `connected`.

## Implemented: Album Social Context In Cards

Album cards can show accepted connections who also have that album in their AlbumLog library.

Endpoint:

```text
POST /api/albums/social-context
```

Request:

```json
{
  "albumIds": ["spotify_album_id"]
}
```

Response:

```json
{
  "albums": {
    "spotify_album_id": {
      "connections": [
        { "id": "user_id", "name": "Alison", "handle": "alison", "avatarUrl": "https://..." }
      ],
      "total": 1
    }
  }
}
```

Rules:

- Only accepted connections are included.
- Removed Spotify albums are excluded.
- Cards render a limited avatar stack and a total count.
- The client fetches context in batches per visible album list, never per card.
- The current request limit is 300 album ids.

## Implemented: Friend Recommendations

Recommendations let a connected user send an album to another connected user.

Data model:

```text
album_recommendations / AlbumRecommendation
id
sender_id
receiver_id
album_id
message
status: pending | accepted | dismissed | cancelled
responded_at
created_at
updated_at
```

Rules:

- Sender and receiver must have an accepted connection.
- A user cannot recommend an album to themselves.
- Receiver does not need to already have the album in their library.
- A sender can cancel a recommendation only while it is pending.
- A receiver can accept or dismiss a recommendation only while it is pending.
- A partial unique database index prevents duplicate pending recommendations for the same sender, receiver, and album.

Endpoints:

```text
GET /api/recommendations
POST /api/recommendations
GET /api/recommendations/albums/:spotifyAlbumId
POST /api/recommendations/:id/accept
POST /api/recommendations/:id/dismiss
POST /api/recommendations/:id/cancel
```

UI:

```text
/albums/:spotifyAlbumId
/discover
```

Album pages include a recommendation action. The sender can select accepted connections, send an optional message, and see avatars for users who already received the album. Pending recommendations show a cancel action.

Discover shows pending recommendations received from connections and lets the receiver accept or dismiss them.

## Next Social Iterations

- Add album to library when accepting a recommendation.
- Add notification badges/counts for pending recommendations.
- Add recommendation history in user profiles.
- Add feed activity after accepted recommendations.
