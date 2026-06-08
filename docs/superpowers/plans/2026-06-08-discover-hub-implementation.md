# Discover Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the duplicated saved-library search page with a `Descobrir` hub that searches Spotify's global album catalog and shows a truthful empty state for friend recommendations.

**Architecture:** Keep saved-library data and Spotify catalog search as separate boundaries. Add a Spotify Search API adapter and route, keep library filters backed by saved albums, and build a new `/discover` UI.

**Tech Stack:** Next.js App Router, React 19, TypeScript, React Query, Vitest, Tailwind CSS 4, Spotify Web API.

---

## File Structure

- Create `src/lib/spotify/search.ts`
  - Maps Spotify Search API album payloads into the existing `Album` type.
  - Fetches `GET https://api.spotify.com/v1/search?q=...&type=album`.

- Create `src/lib/spotify/search.test.ts`
  - Covers mapper behavior and search request behavior.

- Create `src/app/api/spotify/search-albums/route.ts`
  - Reads the current signed session.
  - Requires Spotify access token.
  - Refreshes token with the same pattern as saved albums.
  - Returns `{ albums }` with sanitized AlbumLog album objects.

- Modify `src/lib/data/albums.ts`
  - Add `searchCatalogAlbums(query)`.
  - Keep `searchAlbums` only if legacy code still needs saved-library filtering.

- Modify `src/lib/queries/albums.ts`
  - Add `albumKeys.catalogSearch(query)`.
  - Add `useCatalogAlbumSearch(query)`.

- Create `src/lib/ui/discover-empty-states.ts`
  - Centralizes friend recommendations empty-state copy.

- Create `src/lib/ui/discover-empty-states.test.ts`
  - Ensures friend recommendations never asks for Spotify reconnection.

- Create `src/components/discover/horizontal-album-section.tsx`
  - Reusable horizontal album strip.

- Create `src/app/discover/page.tsx`
  - New discovery hub UI.

- Delete `src/app/search/page.tsx`
  - `/search` is removed instead of kept as a legacy alias.

- Modify `src/components/layout/app-shell.tsx`
  - Navigation label and href changes from `Busca` `/search` to `Descobrir` `/discover`.

- Modify `src/app/page.tsx`
  - CTA changes from `/search` and `Buscar albuns` to `/discover` and `Descobrir albuns`.

- Modify docs:
  - `docs/current-state.md`
  - `docs/product/mvp-scope.md`
  - `docs/technical/spotify-auth.md` if route behavior needs mention.

---

### Task 1: Spotify Catalog Search Adapter

**Files:**
- Create: `src/lib/spotify/search.ts`
- Create: `src/lib/spotify/search.test.ts`

- [ ] **Step 1: Write the failing mapper and fetch tests**

Create `src/lib/spotify/search.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCatalogAlbums, mapSpotifySearchAlbum } from "./search";

describe("Spotify catalog search", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps a Spotify search album into AlbumLog album shape", () => {
    const album = mapSpotifySearchAlbum({
      id: "spotify-album-id",
      name: "Heroine",
      artists: [{ name: "Thornhill" }],
      images: [{ url: "https://i.scdn.co/image/cover", height: 640, width: 640 }],
      release_date: "2022-06-03",
      external_urls: { spotify: "https://open.spotify.com/album/spotify-album-id" },
      genres: [],
    });

    expect(album).toEqual({
      id: "spotify-album-id",
      spotifyId: "spotify-album-id",
      title: "Heroine",
      artist: "Thornhill",
      coverUrl: "https://i.scdn.co/image/cover",
      releaseDate: "2022-06-03",
      genres: [],
      externalUrl: "https://open.spotify.com/album/spotify-album-id",
    });
  });

  it("does not call Spotify when the query is empty", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(fetchCatalogAlbums("access-token", "   ")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("searches Spotify albums with a trimmed query", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        albums: {
          items: [
            {
              id: "album-id",
              name: "The Dark Pool",
              artists: [{ name: "Thornhill" }],
              images: [],
              release_date: "2019-10-25",
              external_urls: {},
              genres: [],
            },
          ],
        },
      }),
    );

    await expect(fetchCatalogAlbums("access-token", " Thornhill ")).resolves.toMatchObject([
      { id: "album-id", title: "The Dark Pool" },
    ]);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("q=Thornhill");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("type=album");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("limit=24");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm.cmd run test -- src/lib/spotify/search.test.ts --reporter=verbose
```

Expected: FAIL because `src/lib/spotify/search.ts` does not exist.

- [ ] **Step 3: Implement the adapter**

Create `src/lib/spotify/search.ts`:

```ts
import type { Album } from "@/types/album";

export type SpotifySearchAlbum = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  images: Array<{ url: string; height: number | null; width: number | null }>;
  release_date: string;
  external_urls: {
    spotify?: string;
  };
  genres?: string[];
};

type SpotifySearchResponse = {
  albums: {
    items: SpotifySearchAlbum[];
  };
};

export function mapSpotifySearchAlbum(album: SpotifySearchAlbum): Album {
  return {
    id: album.id,
    spotifyId: album.id,
    title: album.name,
    artist: album.artists.map((artist) => artist.name).join(", "),
    coverUrl: album.images[0]?.url ?? "",
    releaseDate: album.release_date,
    genres: album.genres ?? [],
    externalUrl: album.external_urls.spotify ?? "",
  };
}

export async function fetchCatalogAlbums(accessToken: string, query: string, limit = 24) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", normalizedQuery);
  url.searchParams.set("type", "album");
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Spotify album search request failed");
  }

  const payload = (await response.json()) as SpotifySearchResponse;

  return payload.albums.items.map(mapSpotifySearchAlbum);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm.cmd run test -- src/lib/spotify/search.test.ts --reporter=verbose
```

Expected: PASS.

---

### Task 2: Spotify Search API Route

**Files:**
- Create: `src/app/api/spotify/search-albums/route.ts`
- Test manually through route behavior after implementation.

- [ ] **Step 1: Implement route with the saved-albums auth pattern**

Create `src/app/api/spotify/search-albums/route.ts`:

```ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getRequiredEnv,
  readSessionToken,
  refreshSpotifyToken,
} from "@/lib/auth/spotify";
import { fetchCatalogAlbums } from "@/lib/spotify/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  if (!query.trim()) {
    return NextResponse.json({ albums: [] });
  }

  const cookieStore = await cookies();
  const sessionSecret = getRequiredEnv("AUTH_SESSION_SECRET");
  const sessionToken = cookieStore.get("albumlog_session")?.value;
  const session = await readSessionToken(sessionToken, sessionSecret);

  if (!session?.spotifyAccessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  let accessToken = session.spotifyAccessToken;
  let nextSession = session;

  if (session.spotifyRefreshToken && (session.spotifyTokenExpiresAt ?? 0) <= Date.now() + 60_000) {
    const refreshed = await refreshSpotifyToken({
      refreshToken: session.spotifyRefreshToken,
      clientId: getRequiredEnv("SPOTIFY_CLIENT_ID"),
      clientSecret: getRequiredEnv("SPOTIFY_CLIENT_SECRET"),
    });

    accessToken = refreshed.access_token;
    nextSession = {
      ...session,
      spotifyAccessToken: refreshed.access_token,
      spotifyRefreshToken: refreshed.refresh_token ?? session.spotifyRefreshToken,
      spotifyTokenExpiresAt: Date.now() + refreshed.expires_in * 1000,
      spotifyScope: refreshed.scope || session.spotifyScope,
    };
  }

  const albums = await fetchCatalogAlbums(accessToken, query);
  const response = NextResponse.json({ albums });

  if (nextSession !== session) {
    response.cookies.set("albumlog_session", await createSessionToken(nextSession, sessionSecret), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}
```

- [ ] **Step 2: Verify route compiles**

Run:

```bash
npm.cmd run build
```

Expected: PASS and route list includes `/api/spotify/search-albums`.

---

### Task 3: Data and Query Layer

**Files:**
- Modify: `src/lib/data/albums.ts`
- Modify: `src/lib/data/albums.test.ts`
- Modify: `src/lib/queries/albums.ts`

- [ ] **Step 1: Add failing data-layer test for catalog search**

Append to `src/lib/data/albums.test.ts`:

```ts
it("searches the Spotify catalog through the AlbumLog API", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json({
      albums: [
        {
          id: "catalog-album",
          spotifyId: "catalog-album",
          title: "Heroine",
          artist: "Thornhill",
          coverUrl: "",
          releaseDate: "2022-06-03",
          genres: [],
          externalUrl: "",
        },
      ],
    }),
  );

  await expect(searchCatalogAlbums("Heroine")).resolves.toMatchObject([
    { id: "catalog-album", title: "Heroine" },
  ]);
});
```

Update the import:

```ts
import { getAlbumDetail, getDashboardStats, getLibrary, searchAlbums, searchCatalogAlbums } from "./albums";
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm.cmd run test -- src/lib/data/albums.test.ts --reporter=verbose
```

Expected: FAIL because `searchCatalogAlbums` does not exist.

- [ ] **Step 3: Implement data-layer function**

Add to `src/lib/data/albums.ts`:

```ts
export async function searchCatalogAlbums(query: string): Promise<Album[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const response = await fetch(`/api/spotify/search-albums?q=${encodeURIComponent(normalizedQuery)}`);

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Unable to search Spotify albums");
  }

  const payload = (await response.json()) as { albums: Album[] };

  return payload.albums;
}
```

- [ ] **Step 4: Add React Query hook**

Modify `src/lib/queries/albums.ts`:

```ts
import {
  getAlbumDetail,
  getDashboardStats,
  getLibrary,
  searchAlbums,
  searchCatalogAlbums,
  updateUserAlbum,
} from "@/lib/data/albums";
```

Add key:

```ts
catalogSearch: (query: string) => [...albumKeys.all, "catalog-search", query] as const,
```

Add hook:

```ts
export function useCatalogAlbumSearch(query: string) {
  return useQuery({
    queryKey: albumKeys.catalogSearch(query),
    queryFn: () => searchCatalogAlbums(query),
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
npm.cmd run test -- src/lib/data/albums.test.ts --reporter=verbose
```

Expected: PASS.

---

### Task 4: Discover UI Components and Empty Copy

**Files:**
- Create: `src/lib/ui/discover-empty-states.ts`
- Create: `src/lib/ui/discover-empty-states.test.ts`
- Create: `src/components/discover/horizontal-album-section.tsx`

- [ ] **Step 1: Write failing empty-state copy test**

Create `src/lib/ui/discover-empty-states.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getFriendRecommendationsEmptyStateCopy } from "./discover-empty-states";

describe("discover empty states", () => {
  it("explains friend recommendations without asking for Spotify reconnection", () => {
    expect(getFriendRecommendationsEmptyStateCopy()).toEqual({
      title: "Recomendacoes de amigos vao aparecer aqui",
      description:
        "Quando adicionarmos amigos, albuns recomendados por pessoas que voce segue ficarao nesta lista.",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm.cmd run test -- src/lib/ui/discover-empty-states.test.ts --reporter=verbose
```

Expected: FAIL because `discover-empty-states.ts` does not exist.

- [ ] **Step 3: Implement empty-state copy helper**

Create `src/lib/ui/discover-empty-states.ts`:

```ts
export function getFriendRecommendationsEmptyStateCopy() {
  return {
    title: "Recomendacoes de amigos vao aparecer aqui",
    description:
      "Quando adicionarmos amigos, albuns recomendados por pessoas que voce segue ficarao nesta lista.",
  };
}
```

- [ ] **Step 4: Create horizontal album section**

Create `src/components/discover/horizontal-album-section.tsx`:

```tsx
"use client";

import { AlbumCard } from "@/components/album/album-card";
import type { Album, UserAlbum } from "@/types/album";

export function HorizontalAlbumSection({
  title,
  eyebrow,
  description,
  albums,
  libraryByAlbum,
}: {
  title: string;
  eyebrow: string;
  description: string;
  albums: Album[];
  libraryByAlbum?: Map<string, UserAlbum>;
}) {
  if (albums.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eef33f]">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/45">{description}</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {albums.map((album, index) => (
          <div key={album.id} className="min-w-[320px] max-w-[360px] flex-1">
            <AlbumCard
              album={album}
              userAlbum={libraryByAlbum?.get(album.id)}
              compact
              priorityCover={index === 0}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run empty-state test**

Run:

```bash
npm.cmd run test -- src/lib/ui/discover-empty-states.test.ts --reporter=verbose
```

Expected: PASS.

---

### Task 5: Discover Page and Redirect

**Files:**
- Create: `src/app/discover/page.tsx`
- Delete: `src/app/search/page.tsx`

- [ ] **Step 1: Create the Discover page**

Create `src/app/discover/page.tsx`:

```tsx
"use client";

import { Compass, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { HorizontalAlbumSection } from "@/components/discover/horizontal-album-section";
import { EmptyState } from "@/components/ui/empty-state";
import { useCatalogAlbumSearch, useLibrary } from "@/lib/queries/albums";
import { getFriendRecommendationsEmptyStateCopy } from "@/lib/ui/discover-empty-states";

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const catalogSearch = useCatalogAlbumSearch(query);
  const library = useLibrary({ status: "all", query: "" });
  const savedAlbums = library.data?.map((entry) => entry.album).slice(0, 12) ?? [];
  const friendEmptyState = getFriendRecommendationsEmptyStateCopy();

  const libraryByAlbum = useMemo(() => {
    return new Map(library.data?.map((entry) => [entry.album.id, entry.userAlbum]) ?? []);
  }, [library.data]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[#0b0b16]/86 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#eef33f]">Descoberta</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Descobrir albuns</h1>
        <p className="mt-2 max-w-2xl text-white/52">
          Encontre albuns fora da sua biblioteca e acompanhe sinais que podem virar sua proxima escuta.
        </p>
      </section>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/38" size={19} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busque no catalogo Spotify por album ou artista"
          className="h-14 w-full rounded-2xl border border-white/10 bg-[#0b0b16]/86 pl-12 pr-4 text-base text-white shadow-[0_18px_55px_rgba(0,0,0,0.32)] outline-none backdrop-blur-xl transition placeholder:text-white/32 focus:border-[#4f5bff] focus:ring-2 focus:ring-[#4f5bff]/25"
        />
      </label>

      {catalogSearch.data && catalogSearch.data.length > 0 && (
        <HorizontalAlbumSection
          eyebrow="Catalogo Spotify"
          title="Resultados da busca"
          description="Albuns encontrados fora e dentro da sua biblioteca atual."
          albums={catalogSearch.data}
          libraryByAlbum={libraryByAlbum}
        />
      )}

      {query.trim() && catalogSearch.data?.length === 0 && (
        <EmptyState
          icon={Compass}
          title="Nenhum album encontrado"
          description="Tente buscar por outro album ou artista no catalogo Spotify."
        />
      )}

      <HorizontalAlbumSection
        eyebrow="Spotify signals"
        title="Da sua biblioteca Spotify"
        description="Albuns salvos que podem servir de ponto de partida para novas descobertas."
        albums={savedAlbums}
        libraryByAlbum={libraryByAlbum}
      />

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eef33f]">Amigos</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Recomendacoes de amigos</h2>
          <p className="mt-1 text-sm text-white/45">
            Um espaco preparado para recomendacoes sociais quando a camada de amigos existir.
          </p>
        </div>
        <EmptyState
          icon={UsersRound}
          title={friendEmptyState.title}
          description={friendEmptyState.description}
        />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Remove old search route**

Delete `src/app/search/page.tsx` so `/search` no longer exists as an alias.

- [ ] **Step 3: Verify build sees both routes**

Run:

```bash
npm.cmd run build
```

Expected: PASS and route list includes `/discover` and `/api/spotify/search-albums`, without `/search`.

---

### Task 6: Navigation, Dashboard CTA, and Docs

**Files:**
- Modify: `src/components/layout/app-shell.tsx`
- Modify: `src/app/page.tsx`
- Modify: `docs/current-state.md`
- Modify: `docs/product/mvp-scope.md`
- Modify: `docs/technical/spotify-auth.md`

- [ ] **Step 1: Update navigation**

In `src/components/layout/app-shell.tsx`, change:

```ts
{ href: "/search", label: "Busca", icon: Search },
```

to:

```ts
{ href: "/discover", label: "Descobrir", icon: Search },
```

- [ ] **Step 2: Update dashboard CTA**

In `src/app/page.tsx`, change:

```tsx
href="/search"
Buscar albuns
```

to:

```tsx
href="/discover"
Descobrir albuns
```

Also change the empty activity action:

```tsx
action={{ href: "/discover", label: "Ir para descobrir" }}
```

- [ ] **Step 3: Update docs**

Update `docs/current-state.md` implemented list with:

```md
- Discover page at `/discover` with Spotify catalog search and friend recommendations empty state.
- Old `/search` route removed so `Descobrir` has a single canonical URL.
```

Update `docs/current-state.md` current data behavior with:

```md
- Discover catalog search uses Spotify's `/v1/search` endpoint for album results.
```

Update `docs/product/mvp-scope.md` to say album search now uses Spotify catalog search, while library remains sourced from saved albums.

Update `docs/technical/spotify-auth.md` to mention `/api/spotify/search-albums`.

- [ ] **Step 4: Run final verification**

Run:

```bash
npm.cmd run test -- --reporter=verbose
npm.cmd run lint
npm.cmd run build
```

Expected: all pass.

---

## Self-Review

- Spec coverage:
  - Navigation rename: Task 6.
  - `/discover` route: Task 5.
  - Global Spotify search: Tasks 1, 2, 3, 5.
  - Horizontal sections: Tasks 4 and 5.
  - Friend recommendations empty state: Tasks 4 and 5.
  - No friends/follows/send/accept/database/fake data: encoded in Task 4 copy and Task 5 empty-state-only section.

- Placeholder scan:
  - No `TBD` or `TODO` placeholders.
  - Every code step contains exact code or exact edit instructions.

- Type consistency:
  - `Album`, `UserAlbum`, `AlbumCard`, and `priorityCover` match current project types and current uncommitted LCP fix.
  - `searchCatalogAlbums` is introduced before `useCatalogAlbumSearch`.
  - `/api/spotify/search-albums` is introduced before the data layer depends on it.
