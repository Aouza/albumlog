import type { LibraryEntry } from "@/types/album";

export type SyncSummary = {
  totalImported: number;
  totalUpdated: number;
  totalMarkedRemoved: number;
};

type SyncDependencies = {
  userId: string;
  accessToken: string;
  fetchSavedAlbums?: (accessToken: string) => Promise<LibraryEntry[]>;
  upsertEntry?: (userId: string, entry: LibraryEntry) => Promise<void>;
  markRemovedEntries?: (userId: string, currentSpotifyAlbumIds: Set<string>) => Promise<number>;
  createSyncRecord?: () => Promise<string>;
  finishSyncRecord?: (syncId: string, summary: SyncSummary) => Promise<void>;
  failSyncRecord?: (syncId: string, error: Error) => Promise<void>;
};

export async function syncSpotifyLibrary({
  userId,
  accessToken,
  fetchSavedAlbums = async (token) => {
    const { fetchSavedAlbums } = await import("@/lib/spotify/albums");

    return fetchSavedAlbums(token);
  },
  upsertEntry = async (nextUserId, entry) => {
    const { upsertSyncedLibraryEntry } = await import("@/lib/repositories/library-repository");

    return upsertSyncedLibraryEntry(nextUserId, entry);
  },
  markRemovedEntries = async (nextUserId, currentSpotifyAlbumIds) => {
    const { markMissingSpotifyLibraryEntriesAsRemoved } = await import(
      "@/lib/repositories/library-repository"
    );

    return markMissingSpotifyLibraryEntriesAsRemoved(nextUserId, currentSpotifyAlbumIds);
  },
  createSyncRecord = async () => {
    const { prisma } = await import("@/lib/db/prisma");
    const sync = await prisma.spotifyLibrarySync.create({
      data: { userId, status: "syncing", syncType: "manual_full" },
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
        lastFullSyncedAt: new Date(),
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
    const albums = await fetchSavedAlbums(accessToken);

    for (const entry of albums) {
      await upsertEntry(userId, entry);
    }

    const currentSpotifyAlbumIds = new Set(albums.map((entry) => entry.album.spotifyId));
    const totalMarkedRemoved = await markRemovedEntries(userId, currentSpotifyAlbumIds);

    const summary = {
      totalImported: albums.length,
      totalUpdated: 0,
      totalMarkedRemoved,
    };

    await finishSyncRecord(syncId, summary);

    return summary;
  } catch (error) {
    await failSyncRecord(syncId, error as Error);
    throw error;
  }
}
