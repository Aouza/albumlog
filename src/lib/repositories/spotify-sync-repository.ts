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
