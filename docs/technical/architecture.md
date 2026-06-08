# Technical Architecture

## Stack

- Next.js with App Router.
- React.
- TypeScript.
- React Query.
- Spotify OAuth for authentication.
- Spotify saved albums and catalog search as current API-backed data sources.
- Future database persistence for AlbumLog-owned user library and social features.

## Architecture Principles

- Keep UI components independent from data source details.
- Treat data functions as an API boundary.
- Keep product entities typed.
- Make future backend replacement straightforward.

## Suggested Structure

```text
albumlog/
  docs/
  src/
    app/
      page.tsx
      discover/page.tsx
      library/page.tsx
      albums/[id]/page.tsx
      profile/page.tsx
    components/
      album/
      layout/
      library/
      review/
      stats/
      ui/
    lib/
      auth/
      data/
      queries/
      query-client.tsx
      utils.ts
    types/
      album.ts
      user.ts
```

## Data Flow

1. Page component renders the route.
2. Client component calls a React Query hook.
3. Hook calls the current data function.
4. The current album data functions call internal Spotify-backed API routes.
5. UI renders real Spotify data or truthful empty states instead of placeholder data.
6. Future persistence will move library reads from live Spotify calls into the AlbumLog database.

## Future Backend Path

The data layer can later be connected to:

- Next.js route handlers.
- Server actions.
- Supabase client calls.
- A standalone API service.

The React Query hooks should remain stable where possible.

See `docs/technical/spotify-library-sync.md` for the proposed database-backed Spotify library synchronization architecture.

## Spotify and MusicBrainz

Future album search should try Spotify first for:

- Name.
- Artist.
- Cover.
- Release date.
- Link.

MusicBrainz can be used as fallback for catalog completeness.

## Auth Path

The app uses Spotify OAuth for login. The current user is read from `/api/auth/me`
using a signed HTTP-only session cookie.

Future auth options:

- Supabase Auth.
- NextAuth/Auth.js.
- Custom auth only if product needs require it.
