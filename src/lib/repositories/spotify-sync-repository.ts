import { prisma } from "@/lib/db/prisma";
import { mapSpotifySyncStatus } from "@/lib/sync/spotify-sync-status";

export async function getLatestSpotifyLibrarySyncStatus(userId: string) {
  const sync = await prisma.spotifyLibrarySync.findFirst({
    where: { userId },
    orderBy: { startedAt: "desc" },
    select: {
      status: true,
      syncType: true,
      startedAt: true,
      finishedAt: true,
      lastSyncedAt: true,
      lastFullSyncedAt: true,
      totalImported: true,
      totalUpdated: true,
      totalMarkedRemoved: true,
      errorMessage: true,
    },
  });

  return mapSpotifySyncStatus(sync);
}

export async function hasSpotifyLibrarySync(userId: string) {
  const sync = await prisma.spotifyLibrarySync.findFirst({
    where: { userId },
    select: { id: true },
  });

  return Boolean(sync);
}

export async function getLatestSpotifySavedAlbumDate(userId: string) {
  const latestAlbum = await prisma.userAlbum.findFirst({
    where: {
      userId,
      source: "spotify",
      spotifySavedAt: { not: null },
    },
    orderBy: { spotifySavedAt: "desc" },
    select: { spotifySavedAt: true },
  });

  return latestAlbum?.spotifySavedAt ?? null;
}
