# Spotify Library Sync Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the authenticated user's Spotify saved albums in AlbumLog's own database and make the Library read from AlbumLog-owned data instead of live Spotify responses.

**Architecture:** Use Prisma with Supabase Postgres for the MVP implementation. Store Spotify tokens in a `SpotifyAccount` table with encrypted token fields, persist album metadata separately from user ownership, and expose a manual sync endpoint that imports saved Spotify albums idempotently.

**Tech Stack:** Next.js App Router, TypeScript, React Query, Vitest, Prisma, Supabase Postgres, Spotify Web API.

---

## Scope

This plan implements the first persistence slice:

- Prisma + Supabase Postgres setup.
- Database models for users, Spotify account, albums, user albums, and sync runs.
- Token encryption helper.
- Persistence during Spotify OAuth callback.
- Full saved-albums sync service.
- Manual sync endpoint.
- Saved library endpoint backed by database, with live Spotify fallback only when the database is empty.
- Library page button to run `Atualizar Spotify`.

This plan does not implement:

- friends/follows;
- recommendations between friends;
- albums in common;
- background scheduled jobs;
- automatic six-hour sync;
- Supabase Auth migration.

## File Structure

- Create `prisma/schema.prisma`
  - Defines PostgreSQL datasource and AlbumLog persistence models.

- Modify `package.json`
  - Add Prisma scripts.

- Modify `.env.example`
  - Add `DATABASE_URL`, `DIRECT_URL`, and `TOKEN_ENCRYPTION_SECRET`.

- Create `src/lib/db/prisma.ts`
  - Prisma client singleton.

- Create `src/lib/security/token-crypto.ts`
  - AES-GCM encryption/decryption for Spotify tokens.

- Create `src/lib/repositories/spotify-account-repository.ts`
  - Upsert and read Spotify account records.

- Create `src/lib/repositories/library-repository.ts`
  - Upsert albums/user albums and read the user's persisted library.

- Create `src/lib/sync/spotify-library-sync.ts`
  - Runs full Spotify saved-albums import.

- Create `src/app/api/spotify/sync/route.ts`
  - Manual sync endpoint.

- Modify `src/app/api/auth/spotify/callback/route.ts`
  - Persists user/account after Spotify login.

- Modify `src/app/api/spotify/saved-albums/route.ts`
  - Reads from database first.

- Modify `src/app/library/page.tsx`
  - Adds `Atualizar Spotify` action.

- Modify `src/lib/queries/albums.ts`
  - Adds sync mutation and invalidation.

- Add focused tests for crypto, repository mapping, and sync summaries.

---

### Task 1: Install Prisma and Initialize Supabase Postgres

**Files:**
- Modify: `package.json`
- Create: `prisma/schema.prisma`
- Modify: `.env.example`

- [ ] **Step 1: Install dependencies**

Run:

```bash
npm.cmd install @prisma/client
npm.cmd install -D prisma
```

Expected: `package.json` and `package-lock.json` include Prisma packages.

- [ ] **Step 2: Add Prisma scripts**

Update `package.json` scripts:

```json
{
  "db:generate": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:studio": "prisma studio"
}
```

Keep existing scripts unchanged.

- [ ] **Step 3: Add environment examples**

Add to `.env.example`:

```text
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
TOKEN_ENCRYPTION_SECRET=base64-encoded-32-byte-secret
```

`TOKEN_ENCRYPTION_SECRET` must be a 32-byte base64 string. Generate locally with:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

- [ ] **Step 4: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id             String          @id @default(cuid())
  spotifyUserId  String          @unique
  displayName    String
  avatarUrl      String
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  spotifyAccount SpotifyAccount?
  userAlbums     UserAlbum[]
  syncs          SpotifyLibrarySync[]
}

model SpotifyAccount {
  id                    String   @id @default(cuid())
  userId                String   @unique
  spotifyUserId          String   @unique
  displayName            String
  avatarUrl              String
  accessTokenEncrypted   String
  refreshTokenEncrypted  String?
  scope                  String
  tokenExpiresAt         DateTime
  connectedAt            DateTime @default(now())
  lastProfileSyncedAt    DateTime @default(now())
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Album {
  id             String      @id @default(cuid())
  spotifyAlbumId String      @unique
  title          String
  artistName     String
  coverUrl       String
  spotifyUrl     String
  releaseDate    String
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  userAlbums     UserAlbum[]
}

model UserAlbum {
  id                 String   @id @default(cuid())
  userId             String
  albumId            String
  source             String
  status             String
  rating             Float?
  review             String   @default("")
  listenedAt          DateTime?
  spotifySavedAt      DateTime?
  removedFromSpotify  Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  album               Album    @relation(fields: [albumId], references: [id], onDelete: Cascade)

  @@unique([userId, albumId])
}

model SpotifyLibrarySync {
  id                  String    @id @default(cuid())
  userId              String
  status              String
  syncType            String
  startedAt           DateTime  @default(now())
  finishedAt          DateTime?
  lastSyncedAt         DateTime?
  lastFullSyncedAt     DateTime?
  totalImported        Int       @default(0)
  totalUpdated         Int       @default(0)
  totalMarkedRemoved   Int       @default(0)
  errorMessage         String?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 5: Generate and migrate**

Run after `.env.local` has real Supabase connection strings:

```bash
npm.cmd run db:generate
npm.cmd run db:migrate -- --name init
```

Expected: Prisma client generated and the initial migration applied to Supabase Postgres.

---

### Task 2: Token Encryption

**Files:**
- Create: `src/lib/security/token-crypto.ts`
- Create: `src/lib/security/token-crypto.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/security/token-crypto.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { decryptToken, encryptToken } from "./token-crypto";

describe("token crypto", () => {
  const secret = Buffer.alloc(32, 7).toString("base64");

  it("roundtrips a token without storing the raw value", () => {
    const encrypted = encryptToken("spotify-token", secret);

    expect(encrypted).not.toContain("spotify-token");
    expect(decryptToken(encrypted, secret)).toBe("spotify-token");
  });

  it("rejects malformed encrypted values", () => {
    expect(() => decryptToken("broken", secret)).toThrow("Invalid encrypted token");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm.cmd run test -- src/lib/security/token-crypto.test.ts --reporter=verbose
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement encryption helper**

Create `src/lib/security/token-crypto.ts`:

```ts
import crypto from "node:crypto";

function getKey(secret: string) {
  const key = Buffer.from(secret, "base64");

  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_SECRET must decode to 32 bytes");
  }

  return key;
}

export function encryptToken(value: string, secret: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptToken(value: string, secret: string) {
  const [ivValue, authTagValue, encryptedValue] = value.split(".");

  if (!ivValue || !authTagValue || !encryptedValue) {
    throw new Error("Invalid encrypted token");
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(secret), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm.cmd run test -- src/lib/security/token-crypto.test.ts --reporter=verbose
```

Expected: PASS.

---

### Task 3: Prisma Client and Repositories

**Files:**
- Create: `src/lib/db/prisma.ts`
- Create: `src/lib/repositories/spotify-account-repository.ts`
- Create: `src/lib/repositories/library-repository.ts`
- Create: `src/lib/repositories/library-repository.test.ts`

- [ ] **Step 1: Create Prisma singleton**

Create `src/lib/db/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 2: Create account repository**

Create `src/lib/repositories/spotify-account-repository.ts`:

```ts
import type { SpotifySession, SpotifyTokenResponse } from "@/lib/auth/spotify";
import { prisma } from "@/lib/db/prisma";
import { encryptToken } from "@/lib/security/token-crypto";

export async function upsertSpotifyAccount({
  profile,
  token,
  tokenEncryptionSecret,
}: {
  profile: SpotifySession;
  token: SpotifyTokenResponse;
  tokenEncryptionSecret: string;
}) {
  const user = await prisma.user.upsert({
    where: { spotifyUserId: profile.id },
    update: {
      displayName: profile.name,
      avatarUrl: profile.avatarUrl,
    },
    create: {
      spotifyUserId: profile.id,
      displayName: profile.name,
      avatarUrl: profile.avatarUrl,
    },
  });

  await prisma.spotifyAccount.upsert({
    where: { userId: user.id },
    update: {
      spotifyUserId: profile.id,
      displayName: profile.name,
      avatarUrl: profile.avatarUrl,
      accessTokenEncrypted: encryptToken(token.access_token, tokenEncryptionSecret),
      refreshTokenEncrypted: token.refresh_token
        ? encryptToken(token.refresh_token, tokenEncryptionSecret)
        : undefined,
      scope: token.scope,
      tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
      lastProfileSyncedAt: new Date(),
    },
    create: {
      userId: user.id,
      spotifyUserId: profile.id,
      displayName: profile.name,
      avatarUrl: profile.avatarUrl,
      accessTokenEncrypted: encryptToken(token.access_token, tokenEncryptionSecret),
      refreshTokenEncrypted: token.refresh_token
        ? encryptToken(token.refresh_token, tokenEncryptionSecret)
        : null,
      scope: token.scope,
      tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
    },
  });

  return user;
}
```

- [ ] **Step 3: Create library repository**

Create `src/lib/repositories/library-repository.ts`:

```ts
import type { LibraryEntry } from "@/types/album";
import { prisma } from "@/lib/db/prisma";

export async function upsertSyncedLibraryEntry(userId: string, entry: LibraryEntry) {
  const album = await prisma.album.upsert({
    where: { spotifyAlbumId: entry.album.spotifyId },
    update: {
      title: entry.album.title,
      artistName: entry.album.artist,
      coverUrl: entry.album.coverUrl,
      spotifyUrl: entry.album.externalUrl,
      releaseDate: entry.album.releaseDate,
    },
    create: {
      spotifyAlbumId: entry.album.spotifyId,
      title: entry.album.title,
      artistName: entry.album.artist,
      coverUrl: entry.album.coverUrl,
      spotifyUrl: entry.album.externalUrl,
      releaseDate: entry.album.releaseDate,
    },
  });

  const existing = await prisma.userAlbum.findUnique({
    where: { userId_albumId: { userId, albumId: album.id } },
  });

  await prisma.userAlbum.upsert({
    where: { userId_albumId: { userId, albumId: album.id } },
    update: {
      source: existing?.source ?? "spotify",
      spotifySavedAt: entry.userAlbum.createdAt ? new Date(entry.userAlbum.createdAt) : null,
      removedFromSpotify: false,
    },
    create: {
      userId,
      albumId: album.id,
      source: "spotify",
      status: "want_to_listen",
      rating: null,
      review: "",
      spotifySavedAt: entry.userAlbum.createdAt ? new Date(entry.userAlbum.createdAt) : null,
      removedFromSpotify: false,
    },
  });
}

export async function getPersistedLibraryForSpotifyUser(spotifyUserId: string): Promise<LibraryEntry[]> {
  const user = await prisma.user.findUnique({
    where: { spotifyUserId },
    include: {
      userAlbums: {
        where: { removedFromSpotify: false },
        include: { album: true },
        orderBy: { spotifySavedAt: "desc" },
      },
    },
  });

  if (!user) {
    return [];
  }

  return user.userAlbums.map((userAlbum) => ({
    album: {
      id: userAlbum.album.spotifyAlbumId,
      spotifyId: userAlbum.album.spotifyAlbumId,
      title: userAlbum.album.title,
      artist: userAlbum.album.artistName,
      coverUrl: userAlbum.album.coverUrl,
      releaseDate: userAlbum.album.releaseDate,
      genres: [],
      externalUrl: userAlbum.album.spotifyUrl,
    },
    userAlbum: {
      id: userAlbum.id,
      userId: user.id,
      albumId: userAlbum.album.spotifyAlbumId,
      status: userAlbum.status as LibraryEntry["userAlbum"]["status"],
      rating: userAlbum.rating,
      review: userAlbum.review,
      listenedAt: userAlbum.listenedAt?.toISOString() ?? null,
      createdAt: userAlbum.createdAt.toISOString(),
      updatedAt: userAlbum.updatedAt.toISOString(),
    },
  }));
}
```

- [ ] **Step 4: Add repository mapping tests**

Extract a pure mapper from `src/lib/repositories/library-repository.ts`:

```ts
export function mapPersistedUserAlbumToLibraryEntry(userId: string, userAlbum: PersistedUserAlbum): LibraryEntry {
  return {
    album: {
      id: userAlbum.album.spotifyAlbumId,
      spotifyId: userAlbum.album.spotifyAlbumId,
      title: userAlbum.album.title,
      artist: userAlbum.album.artistName,
      coverUrl: userAlbum.album.coverUrl,
      releaseDate: userAlbum.album.releaseDate,
      genres: [],
      externalUrl: userAlbum.album.spotifyUrl,
    },
    userAlbum: {
      id: userAlbum.id,
      userId,
      albumId: userAlbum.album.spotifyAlbumId,
      status: userAlbum.status as LibraryEntry["userAlbum"]["status"],
      rating: userAlbum.rating,
      review: userAlbum.review,
      listenedAt: userAlbum.listenedAt?.toISOString() ?? null,
      createdAt: userAlbum.createdAt.toISOString(),
      updatedAt: userAlbum.updatedAt.toISOString(),
    },
  };
}
```

Create `src/lib/repositories/library-repository.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mapPersistedUserAlbumToLibraryEntry } from "./library-repository";

describe("library repository mapping", () => {
  it("maps a persisted user album to the AlbumLog LibraryEntry shape", () => {
    const now = new Date("2026-06-08T12:00:00.000Z");

    expect(
      mapPersistedUserAlbumToLibraryEntry("user-id", {
        id: "user-album-id",
        status: "favorite",
        rating: 4.5,
        review: "Great record",
        listenedAt: now,
        createdAt: now,
        updatedAt: now,
        album: {
          spotifyAlbumId: "spotify-album-id",
          title: "Heroine",
          artistName: "Thornhill",
          coverUrl: "https://i.scdn.co/image/cover",
          releaseDate: "2022-06-03",
          spotifyUrl: "https://open.spotify.com/album/spotify-album-id",
        },
      }),
    ).toEqual({
      album: {
        id: "spotify-album-id",
        spotifyId: "spotify-album-id",
        title: "Heroine",
        artist: "Thornhill",
        coverUrl: "https://i.scdn.co/image/cover",
        releaseDate: "2022-06-03",
        genres: [],
        externalUrl: "https://open.spotify.com/album/spotify-album-id",
      },
      userAlbum: {
        id: "user-album-id",
        userId: "user-id",
        albumId: "spotify-album-id",
        status: "favorite",
        rating: 4.5,
        review: "Great record",
        listenedAt: "2026-06-08T12:00:00.000Z",
        createdAt: "2026-06-08T12:00:00.000Z",
        updatedAt: "2026-06-08T12:00:00.000Z",
      },
    });
  });
});
```

---

### Task 4: Full Sync Service

**Files:**
- Create: `src/lib/sync/spotify-library-sync.ts`
- Create: `src/lib/sync/spotify-library-sync.test.ts`

- [ ] **Step 1: Write sync summary test**

Create `src/lib/sync/spotify-library-sync.test.ts` using dependency injection:

```ts
import { describe, expect, it, vi } from "vitest";
import { syncSpotifyLibrary } from "./spotify-library-sync";

describe("syncSpotifyLibrary", () => {
  it("imports every fetched saved album for the user", async () => {
    const upsertEntry = vi.fn().mockResolvedValue(undefined);

    const result = await syncSpotifyLibrary({
      userId: "user-id",
      accessToken: "access-token",
      fetchSavedAlbums: async () => [
        {
          album: {
            id: "spotify-album",
            spotifyId: "spotify-album",
            title: "Heroine",
            artist: "Thornhill",
            coverUrl: "",
            releaseDate: "2022",
            genres: [],
            externalUrl: "",
          },
          userAlbum: {
            id: "entry",
            userId: "spotify-current-user",
            albumId: "spotify-album",
            status: "want_to_listen",
            rating: null,
            review: "",
            listenedAt: null,
            createdAt: "2026-06-08T00:00:00.000Z",
            updatedAt: "2026-06-08T00:00:00.000Z",
          },
        },
      ],
      upsertEntry,
      createSyncRecord: async () => "sync-id",
      finishSyncRecord: async () => undefined,
      failSyncRecord: async () => undefined,
    });

    expect(result).toEqual({ totalImported: 1, totalUpdated: 0, totalMarkedRemoved: 0 });
    expect(upsertEntry).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Implement service**

Create `src/lib/sync/spotify-library-sync.ts`:

```ts
import type { LibraryEntry } from "@/types/album";
import { fetchSavedAlbums as defaultFetchSavedAlbums } from "@/lib/spotify/albums";
import { upsertSyncedLibraryEntry } from "@/lib/repositories/library-repository";
import { prisma } from "@/lib/db/prisma";

type SyncDependencies = {
  userId: string;
  accessToken: string;
  fetchSavedAlbums?: (accessToken: string) => Promise<LibraryEntry[]>;
  upsertEntry?: (userId: string, entry: LibraryEntry) => Promise<void>;
  createSyncRecord?: () => Promise<string>;
  finishSyncRecord?: (syncId: string, summary: SyncSummary) => Promise<void>;
  failSyncRecord?: (syncId: string, error: Error) => Promise<void>;
};

type SyncSummary = {
  totalImported: number;
  totalUpdated: number;
  totalMarkedRemoved: number;
};

export async function syncSpotifyLibrary({
  userId,
  accessToken,
  fetchSavedAlbums = defaultFetchSavedAlbums,
  upsertEntry = upsertSyncedLibraryEntry,
  createSyncRecord = async () => {
    const sync = await prisma.spotifyLibrarySync.create({
      data: { userId, status: "syncing", syncType: "manual_full" },
    });

    return sync.id;
  },
  finishSyncRecord = async (syncId, summary) => {
    await prisma.spotifyLibrarySync.update({
      where: { id: syncId },
      data: {
        status: "idle",
        finishedAt: new Date(),
        lastSyncedAt: new Date(),
        lastFullSyncedAt: new Date(),
        totalImported: summary.totalImported,
        totalUpdated: summary.totalUpdated,
        totalMarkedRemoved: summary.totalMarkedRemoved,
      },
    });
  },
  failSyncRecord = async (syncId, error) => {
    await prisma.spotifyLibrarySync.update({
      where: { id: syncId },
      data: { status: "failed", finishedAt: new Date(), errorMessage: error.message },
    });
  },
}: SyncDependencies): Promise<SyncSummary> {
  const syncId = await createSyncRecord();

  try {
    const albums = await fetchSavedAlbums(accessToken);

    for (const entry of albums) {
      await upsertEntry(userId, entry);
    }

    const summary = {
      totalImported: albums.length,
      totalUpdated: 0,
      totalMarkedRemoved: 0,
    };

    await finishSyncRecord(syncId, summary);

    return summary;
  } catch (error) {
    await failSyncRecord(syncId, error as Error);
    throw error;
  }
}
```

---

### Task 5: Persist Spotify Login and Add Sync API

**Files:**
- Modify: `src/app/api/auth/spotify/callback/route.ts`
- Create: `src/app/api/spotify/sync/route.ts`
- Modify: `src/app/api/spotify/saved-albums/route.ts`

- [ ] **Step 1: Persist user/account on OAuth callback**

In `src/app/api/auth/spotify/callback/route.ts`, after `fetchSpotifyProfile`, call:

```ts
await upsertSpotifyAccount({
  profile,
  token,
  tokenEncryptionSecret: getRequiredEnv("TOKEN_ENCRYPTION_SECRET"),
});
```

Import:

```ts
import { upsertSpotifyAccount } from "@/lib/repositories/spotify-account-repository";
```

- [ ] **Step 2: Add manual sync endpoint**

Create `src/app/api/spotify/sync/route.ts`:

```ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRequiredEnv, readSessionToken } from "@/lib/auth/spotify";
import { prisma } from "@/lib/db/prisma";
import { syncSpotifyLibrary } from "@/lib/sync/spotify-library-sync";

export async function POST() {
  const cookieStore = await cookies();
  const sessionSecret = getRequiredEnv("AUTH_SESSION_SECRET");
  const session = await readSessionToken(cookieStore.get("albumlog_session")?.value, sessionSecret);

  if (!session?.spotifyAccessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { spotifyUserId: session.id } });

  if (!user) {
    return NextResponse.json({ error: "user_not_persisted" }, { status: 409 });
  }

  const summary = await syncSpotifyLibrary({
    userId: user.id,
    accessToken: session.spotifyAccessToken,
  });

  return NextResponse.json({ summary });
}
```

- [ ] **Step 3: Read persisted library first**

In `src/app/api/spotify/saved-albums/route.ts`, after session validation:

```ts
const persistedAlbums = await getPersistedLibraryForSpotifyUser(session.id);

if (persistedAlbums.length > 0) {
  return NextResponse.json({ albums: persistedAlbums, source: "database" });
}
```

Import:

```ts
import { getPersistedLibraryForSpotifyUser } from "@/lib/repositories/library-repository";
```

Keep the current live Spotify fetch as fallback while the user has no persisted sync yet.

---

### Task 6: Library Manual Sync UI

**Files:**
- Modify: `src/lib/queries/albums.ts`
- Modify: `src/app/library/page.tsx`

- [ ] **Step 1: Add sync mutation**

Add to `src/lib/queries/albums.ts`:

```ts
export function useSyncSpotifyLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/spotify/sync", { method: "POST" });

      if (!response.ok) {
        throw new Error("Unable to sync Spotify library");
      }

      return (await response.json()) as {
        summary: { totalImported: number; totalUpdated: number; totalMarkedRemoved: number };
      };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
}
```

- [ ] **Step 2: Add button to Library page**

In `src/app/library/page.tsx`, import and use `useSyncSpotifyLibrary`.

Add a button in the hero section:

```tsx
<button
  type="button"
  onClick={() => syncSpotifyLibrary.mutate()}
  disabled={syncSpotifyLibrary.isPending}
  className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white/72 transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
>
  {syncSpotifyLibrary.isPending ? "Atualizando..." : "Atualizar Spotify"}
</button>
```

Show an error note when `syncSpotifyLibrary.isError`.

---

### Task 7: Verification and Documentation

**Files:**
- Modify: `docs/current-state.md`
- Modify: `docs/technical/spotify-library-sync.md`

- [ ] **Step 1: Update docs**

Update `docs/current-state.md`:

```md
- Database-backed Spotify library sync using Prisma and Supabase Postgres.
- Manual `Atualizar Spotify` sync endpoint and Library button.
```

Update `docs/technical/spotify-library-sync.md` Current MVP Status section to say the first persistence slice has been implemented.

- [ ] **Step 2: Run final checks**

Run:

```bash
npm.cmd run test -- --reporter=verbose
npm.cmd run lint
npm.cmd run build
```

Expected: all pass.

- [ ] **Step 3: Commit**

Run:

```bash
git add package.json package-lock.json prisma .env.example src docs
git commit -m "feat: persist Spotify library sync"
```

---

## Self-Review

- The plan implements only the first persistence slice, not the full social feature set.
- The database choice is Prisma + Supabase Postgres for the MVP.
- Tokens are not stored in `users`; token storage is isolated in `SpotifyAccount`.
- The existing signed HTTP-only session remains the current request auth mechanism.
- The saved library endpoint keeps a live Spotify fallback, reducing migration risk while persistence is introduced.
- Background jobs and friend recommendations are deliberately excluded from this first implementation.
