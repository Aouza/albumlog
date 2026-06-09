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

## Next: Albums In Common

Albums in common should compare `user_albums` for two connected users.

Rules:

- Only accepted connections can compare libraries.
- Removed Spotify albums should be excluded by default.
- The feature should return album metadata and basic ownership context for both users.

Suggested endpoint:

```text
GET /api/connections/:id/albums-in-common
```

## Next: Friend Recommendations

Recommendations should let a connected user send an album to another connected user.

Suggested data model:

```text
album_recommendations
id
sender_id
receiver_id
album_id
message
status: unread | seen | saved | dismissed
created_at
updated_at
```

Rules:

- Sender and receiver must be connected.
- Receiver does not need to already have the album in their library.
- Recommendations should appear in Discover.
