# Spotify Auth Setup

AlbumLog uses Spotify OAuth Authorization Code Flow.

## Local Redirect URI

Configure this exact redirect URI in the Spotify Developer Dashboard:

```text
http://127.0.0.1:3000/api/auth/spotify/callback
```

Use `127.0.0.1`, not `localhost`, for local development.

## Environment Variables

Create `.env.local` from `.env.example`:

```text
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/spotify/callback
AUTH_SESSION_SECRET=
```

`AUTH_SESSION_SECRET` should be a long random string.

## Flow

1. `/login` sends the user to `/api/auth/spotify/login`.
2. The login route redirects to Spotify.
3. Spotify redirects back to `/api/auth/spotify/callback`.
4. The callback validates the signed OAuth `state`.
5. The callback exchanges the code for an access token.
6. AlbumLog fetches the current Spotify profile from `/v1/me`.
7. AlbumLog stores a compact signed session in an HTTP-only cookie.
