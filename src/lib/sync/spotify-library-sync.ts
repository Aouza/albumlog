import type { LibraryEntry } from "@/types/album";
import { SyncAlreadyRunningError, isUniqueConstraintError } from "./spotify-sync-errors";

export type SyncSummary = {
  totalImported: number;
  totalUpdated: number;
  totalMarkedRemoved: number;
};

export type SpotifyLibrarySyncType = "initial_full" | "manual_full" | "incremental";

type PersistenceSummary = Pick<SyncSummary, "totalImported" | "totalUpdated">;

type SyncDependencies = {
  userId: string;
  accessToken: string;
  syncType?: SpotifyLibrarySyncType;
  since?: Date | null;
  fetchSavedAlbums?: (accessToken: string) => Promise<LibraryEntry[]>;
  fetchSavedAlbumsSince?: (accessToken: string, since: Date) => Promise<LibraryEntry[]>;
  persistEntries?: (userId: string, entries: LibraryEntry[]) => Promise<PersistenceSummary>;
  markRemovedEntries?: (userId: string, currentSpotifyAlbumIds: Set<string>) => Promise<number>;
  createSyncRecord?: () => Promise<string>;
  finishSyncRecord?: (syncId: string, summary: SyncSummary) => Promise<void>;
  failSyncRecord?: (syncId: string, error: Error) => Promise<void>;
};

export async function syncSpotifyLibrary({
  userId,
  accessToken,
  syncType = "manual_full",
  since = null,
  fetchSavedAlbums = async (token) => {
    const { fetchSavedAlbums } = await import("@/lib/spotify/albums");

    return fetchSavedAlbums(token);
  },
  fetchSavedAlbumsSince = async (token, savedAfter) => {
    const { fetchSavedAlbumsSince } = await import("@/lib/spotify/albums");

    return fetchSavedAlbumsSince(token, savedAfter);
  },
  persistEntries = async (nextUserId, entries) => {
    const { persistSyncedLibraryEntries } = await import("@/lib/repositories/library-repository");

    return persistSyncedLibraryEntries(nextUserId, entries);
  },
  markRemovedEntries = async (nextUserId, currentSpotifyAlbumIds) => {
    const { markMissingSpotifyLibraryEntriesAsRemoved } = await import(
      "@/lib/repositories/library-repository"
    );

    return markMissingSpotifyLibraryEntriesAsRemoved(nextUserId, currentSpotifyAlbumIds);
  },
  createSyncRecord = async () => {
    const { prisma } = await import("@/lib/db/prisma");
    const activeSync = await prisma.spotifyLibrarySync.findFirst({
      where: { userId, status: "syncing" },
      select: { id: true },
    });

    if (activeSync) {
      throw new SyncAlreadyRunningError();
    }

    const sync = await prisma.spotifyLibrarySync
      .create({
        data: { userId, status: "syncing", syncType },
      })
      .catch((error) => {
        if (isUniqueConstraintError(error)) {
          throw new SyncAlreadyRunningError();
        }

        throw error;
      });

    return sync.id;
  },
  finishSyncRecord = async (syncId, summary) => {
    const { prisma } = await import("@/lib/db/prisma");

    await prisma.spotifyLibrarySync.update({
      where: { id: syncId },
      data: {
        status: "idle",
        finishedAt: new Date(),
        lastSyncedAt: new Date(),
        lastFullSyncedAt: syncType === "incremental" ? undefined : new Date(),
        totalImported: summary.totalImported,
        totalUpdated: summary.totalUpdated,
        totalMarkedRemoved: summary.totalMarkedRemoved,
      },
    });
  },
  failSyncRecord = async (syncId, error) => {
    const { prisma } = await import("@/lib/db/prisma");

    await prisma.spotifyLibrarySync.update({
      where: { id: syncId },
      data: { status: "failed", finishedAt: new Date(), errorMessage: error.message },
    });
  },
}: SyncDependencies): Promise<SyncSummary> {
  const syncId = await createSyncRecord();

  try {
    const albums =
      syncType === "incremental" && since
        ? await fetchSavedAlbumsSince(accessToken, since)
        : await fetchSavedAlbums(accessToken);
    const persistenceSummary = await persistEntries(userId, albums);

    const totalMarkedRemoved =
      syncType === "incremental"
        ? 0
        : await markRemovedEntries(userId, new Set(albums.map((entry) => entry.album.spotifyId)));

    const summary = {
      totalImported: persistenceSummary.totalImported,
      totalUpdated: persistenceSummary.totalUpdated,
      totalMarkedRemoved,
    };

    await finishSyncRecord(syncId, summary);

    return summary;
  } catch (error) {
    await failSyncRecord(syncId, error as Error);
    throw error;
  }
}
