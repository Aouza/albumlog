# Technical Architecture

## Stack

- Next.js with App Router.
- React.
- TypeScript.
- React Query.
- Local mock data for the first scaffold.

## Architecture Principles

- Keep UI components independent from raw mock arrays.
- Treat mock functions as an API boundary.
- Keep product entities typed.
- Make future backend replacement straightforward.

## Suggested Structure

```text
albumlog/
  docs/
  src/
    app/
      page.tsx
      search/page.tsx
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
      mock-api/
      query-client.tsx
      utils.ts
    types/
      album.ts
      user.ts
```

## Data Flow

1. Page component renders the route.
2. Client component calls a React Query hook.
3. Hook calls a mock API function.
4. Mock API reads or updates local mock state.
5. Mutation invalidates related queries.
6. UI rerenders with the updated result.

## Future Backend Path

The mock API layer can later be replaced with:

- Next.js route handlers.
- Server actions.
- Supabase client calls.
- A standalone API service.

The React Query hooks should remain stable where possible.

## Spotify and MusicBrainz

Future album search should try Spotify first for:

- Name.
- Artist.
- Cover.
- Release date.
- Link.

MusicBrainz can be used as fallback for catalog completeness.

## Auth Path

The frontend MVP uses a mocked current user.

Future auth options:

- Supabase Auth.
- NextAuth/Auth.js.
- Custom auth only if product needs require it.
