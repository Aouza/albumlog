# AlbumLog MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first AlbumLog frontend MVP with Next.js, TypeScript, React Query, mock album data, and documentation-backed product structure.

**Architecture:** The app uses Next.js App Router with a small client-side mock API boundary. React Query owns data fetching and mutation state, while UI components stay focused on rendering album cards, filters, stats, ratings, and reviews.

**Tech Stack:** Next.js, React, TypeScript, React Query, Tailwind CSS, lucide-react.

---

## File Structure

- `package.json`: project scripts and dependencies.
- `src/app/layout.tsx`: app shell root, metadata, global providers.
- `src/app/page.tsx`: dashboard route.
- `src/app/search/page.tsx`: album search route.
- `src/app/library/page.tsx`: user library route.
- `src/app/albums/[id]/page.tsx`: album detail route.
- `src/app/profile/page.tsx`: mock profile route.
- `src/app/globals.css`: base theme and Tailwind imports.
- `src/components/layout/app-shell.tsx`: navigation and app frame.
- `src/components/providers/query-provider.tsx`: React Query provider.
- `src/components/album/album-card.tsx`: reusable album card.
- `src/components/album/album-cover.tsx`: stable cover image/fallback.
- `src/components/album/status-select.tsx`: status selector.
- `src/components/album/rating-input.tsx`: half-step rating input.
- `src/components/review/review-editor.tsx`: review editor.
- `src/components/library/library-filters.tsx`: library filters.
- `src/components/stats/stats-strip.tsx`: dashboard metrics.
- `src/lib/mock-api/albums.ts`: mock catalog, user library, and query/mutation functions.
- `src/lib/queries/albums.ts`: React Query hooks.
- `src/lib/utils.ts`: formatting and class helpers.
- `src/types/album.ts`: album, user album, and status types.
- `src/types/user.ts`: user and follow types.

## Task 1: Scaffold Project

**Files:**
- Create: Next.js scaffold files under `albumlog/`

- [ ] **Step 1: Create Next.js app in existing folder**

Run:

```powershell
npx create-next-app@latest albumlog --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Next.js project files are created while keeping the existing `docs` directory.

- [ ] **Step 2: Install React Query and icons**

Run:

```powershell
npm install @tanstack/react-query lucide-react
```

Expected: dependencies are added to `package.json`.

- [ ] **Step 3: Run baseline build**

Run:

```powershell
npm run build
```

Expected: build succeeds before custom implementation.

## Task 2: Types and Mock API

**Files:**
- Create: `src/types/album.ts`
- Create: `src/types/user.ts`
- Create: `src/lib/mock-api/albums.ts`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Define product types**

Create album/user types matching the design spec:

```ts
export type AlbumStatus =
  | "want_to_listen"
  | "listening"
  | "listened"
  | "favorite"
  | "abandoned"
  | "relisten";

export type Album = {
  id: string;
  spotifyId: string;
  title: string;
  artist: string;
  coverUrl: string;
  releaseDate: string;
  genres: string[];
  externalUrl: string;
};

export type UserAlbum = {
  id: string;
  userId: string;
  albumId: string;
  status: AlbumStatus;
  rating: number | null;
  review: string;
  listenedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

- [ ] **Step 2: Add mock API functions**

Create mock catalog and functions:

```ts
searchAlbums(query: string): Promise<Album[]>
getLibrary(filters?: LibraryFilters): Promise<LibraryEntry[]>
getAlbumDetail(id: string): Promise<AlbumDetail | null>
updateUserAlbum(input: UpdateUserAlbumInput): Promise<UserAlbum>
getDashboardStats(): Promise<DashboardStats>
```

- [ ] **Step 3: Verify types**

Run:

```powershell
npm run build
```

Expected: build succeeds.

## Task 3: React Query Provider and Hooks

**Files:**
- Create: `src/components/providers/query-provider.tsx`
- Create: `src/lib/queries/albums.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add QueryProvider**

Use a client component that creates one `QueryClient` via `useState`.

- [ ] **Step 2: Wrap root layout**

Wrap `children` with `QueryProvider` in `src/app/layout.tsx`.

- [ ] **Step 3: Add hooks**

Create:

```ts
useAlbumsSearch(query: string)
useLibrary(filters: LibraryFilters)
useAlbumDetail(id: string)
useDashboardStats()
useUpdateUserAlbum()
```

- [ ] **Step 4: Verify build**

Run:

```powershell
npm run build
```

Expected: build succeeds.

## Task 4: UI Components

**Files:**
- Create: `src/components/layout/app-shell.tsx`
- Create: `src/components/album/album-card.tsx`
- Create: `src/components/album/album-cover.tsx`
- Create: `src/components/album/status-select.tsx`
- Create: `src/components/album/rating-input.tsx`
- Create: `src/components/review/review-editor.tsx`
- Create: `src/components/library/library-filters.tsx`
- Create: `src/components/stats/stats-strip.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Build app shell**

Add a compact navigation shell with routes for Dashboard, Search, Library, and Profile.

- [ ] **Step 2: Build album display components**

Album cards must show cover, title, artist, status, rating, and primary actions.

- [ ] **Step 3: Build editing controls**

Status select, rating input, and review editor update through `useUpdateUserAlbum`.

- [ ] **Step 4: Verify build**

Run:

```powershell
npm run build
```

Expected: build succeeds.

## Task 5: Pages

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/search/page.tsx`
- Create: `src/app/library/page.tsx`
- Create: `src/app/albums/[id]/page.tsx`
- Create: `src/app/profile/page.tsx`

- [ ] **Step 1: Dashboard**

Show stats, recent albums, and shortcuts.

- [ ] **Step 2: Search**

Provide album/artist search and result cards.

- [ ] **Step 3: Library**

Show filterable library entries by status and text.

- [ ] **Step 4: Album detail**

Show album metadata, status, rating, and review editing.

- [ ] **Step 5: Profile**

Show mock user, favorites, and review count.

- [ ] **Step 6: Verify build**

Run:

```powershell
npm run build
```

Expected: build succeeds.

## Task 6: Final Verification

**Files:**
- Modify only if verification finds issues.

- [ ] **Step 1: Run lint**

Run:

```powershell
npm run lint
```

Expected: lint succeeds or framework reports no lint script if scaffold changed defaults.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected: production build succeeds.

- [ ] **Step 3: Start dev server**

Run:

```powershell
npm run dev
```

Expected: local Next.js server starts.

- [ ] **Step 4: Browser smoke test**

Open the local URL and check:

- Dashboard loads.
- Search returns Thornhill albums.
- Library filters work.
- Album detail can update status, rating, and review.
- Profile loads.

## Self-Review

Spec coverage:

- Search, library, status, rating, review, dashboard, profile, mock data, and docs are represented in the tasks.

Placeholder scan:

- No `TBD`, `TODO`, or undefined future placeholders remain in this plan.

Type consistency:

- Type names and hook names are consistent across tasks.
