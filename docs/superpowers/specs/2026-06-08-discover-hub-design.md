# Discover Hub Design

## Decision

Replace the current `Busca` area with `Descobrir`.

The current search page only filters the user's saved Spotify albums, which duplicates the role of `Biblioteca`. `Biblioteca` remains the user's personal collection. `Descobrir` becomes the entry point for finding albums outside the current library and preparing future recommendation flows.

## Phase 1 Scope

Phase 1 implements:

- Navigation label change from `Busca` to `Descobrir`.
- Route direction centered on `/discover`.
- A global Spotify album search area.
- A friend recommendations section with an empty state, not a fake social feed.

Phase 1 does not implement:

- Friends/follows.
- Sending recommendations.
- Accepting recommendations.
- Database persistence.
- Fake friend recommendations.

## Product Behavior

### Global Spotify Search

The top of the page lets the user search for albums by album title or artist.

Search uses Spotify's Search API with `type=album`. Results are not limited to the user's saved albums.

Each result should show:

- Cover.
- Album title.
- Artist.
- Release date when available.
- Whether the album is already present in the user's saved-library-derived AlbumLog list.

For now, adding to AlbumLog is not implemented because we do not have database persistence yet. The UI can expose a disabled or future-facing action only if it is clearly not pretending to work.

### Horizontal Sections

The page uses horizontal album sections because this makes discovery feel different from `Biblioteca`, which is a filterable collection grid.

Initial sections:

- `Resultados da busca`, visible when a query has results.
- `Recomendacoes de amigos`, showing a truthful empty state until social features exist.

### Friend Recommendations Empty State

The friend recommendations section should say that recommendations from friends will appear there after friends are implemented.

It must not ask the user to reconnect Spotify.
It must not show mock friends, mock albums, or fake activity.

## Spotify API Notes

Use official Spotify endpoints that are available for the current MVP:

- Search albums: `GET /v1/search?q=...&type=album`.
- Saved albums: `GET /v1/me/albums`.

Avoid depending on Spotify's dedicated Recommendations endpoint for Phase 1 because developer access to recommendation-related features has changed over time. The product language should use `Spotify signals` or concrete labels such as `Da sua biblioteca Spotify`, not promise proprietary Spotify recommendations that may not be available to the app.

## Architecture

Add a Spotify catalog-search boundary separate from the saved-library boundary:

- `src/lib/spotify/search.ts`
  - Maps Spotify album search results into the existing `Album` shape.
  - Handles empty or failed Spotify results.

- `src/app/api/spotify/search-albums/route.ts`
  - Reads the current session token.
  - Refreshes the Spotify token when needed, following the same pattern as saved albums.
  - Calls the Spotify Search API.
  - Returns sanitized AlbumLog album objects.

- `src/lib/data/albums.ts`
  - Adds `searchCatalogAlbums(query)` or replaces search-page usage with a discovery-specific function.
  - Keeps `getLibrary` scoped to the user's saved/library data.

- `src/app/discover/page.tsx`
  - Replaces the search experience with discovery sections.

The old `/search` route is removed so `Descobrir` has a single canonical URL at `/discover`.

## UI Direction

The page should match the current dark AlbumLog UI and reference image direction:

- No marketing hero.
- Dense, app-like layout.
- Search input at the top.
- Horizontal scroll sections for discovery cards.
- Clear source labels per section.
- Empty states should explain the real missing capability.

## Testing

Add focused tests for:

- Spotify album-search mapper.
- Search API behavior for empty query and unauthenticated session.
- Empty-state copy for friend recommendations.

Run:

- `npm.cmd run test -- --reporter=verbose`
- `npm.cmd run lint`
- `npm.cmd run build`
