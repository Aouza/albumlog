import type { LibraryEntry } from "@/types/album";
import { prisma } from "@/lib/db/prisma";
import { mapPersistedUserAlbumToLibraryEntry } from "@/lib/repositories/library-mapper";

export async function persistSyncedLibraryEntries(userId: string, entries: LibraryEntry[]) {
  if (entries.length === 0) {
    return { totalImported: 0, totalUpdated: 0 };
  }

  const entriesBySpotifyId = new Map(entries.map((entry) => [entry.album.spotifyId, entry]));
  const uniqueEntries = Array.from(entriesBySpotifyId.values());
  const spotifyAlbumIds = uniqueEntries.map((entry) => entry.album.spotifyId);

  await prisma.album.createMany({
    data: uniqueEntries.map((entry) => ({
      spotifyAlbumId: entry.album.spotifyId,
      title: entry.album.title,
      artistName: entry.album.artist,
      coverUrl: entry.album.coverUrl,
      spotifyUrl: entry.album.externalUrl,
      releaseDate: entry.album.releaseDate,
    })),
    skipDuplicates: true,
  });

  const albums = await prisma.album.findMany({
    where: { spotifyAlbumId: { in: spotifyAlbumIds } },
    select: { id: true, spotifyAlbumId: true },
  });
  const albumBySpotifyId = new Map(albums.map((album) => [album.spotifyAlbumId, album]));
  const albumIds = albums.map((album) => album.id);

  const existingUserAlbums = await prisma.userAlbum.findMany({
    where: { userId, albumId: { in: albumIds } },
    select: { albumId: true },
  });
  const existingAlbumIds = new Set(existingUserAlbums.map((userAlbum) => userAlbum.albumId));

  const created = await prisma.userAlbum.createMany({
    data: uniqueEntries.flatMap((entry) => {
      const album = albumBySpotifyId.get(entry.album.spotifyId);

      if (!album) {
        return [];
      }

      return [
        {
          userId,
          albumId: album.id,
          source: "spotify",
          status: "want_to_listen",
          rating: null,
          review: "",
          spotifySavedAt: entry.userAlbum.createdAt ? new Date(entry.userAlbum.createdAt) : null,
          removedFromSpotify: false,
        },
      ];
    }),
    skipDuplicates: true,
  });

  await prisma.userAlbum.updateMany({
    where: {
      userId,
      albumId: { in: albumIds },
      removedFromSpotify: true,
    },
    data: { removedFromSpotify: false },
  });

  return {
    totalImported: created.count,
    totalUpdated: existingAlbumIds.size,
  };
}

export async function upsertSyncedLibraryEntry(userId: string, entry: LibraryEntry) {
  await persistSyncedLibraryEntries(userId, [entry]);
}

export async function getPersistedLibraryForSpotifyUser(
  spotifyUserId: string,
): Promise<LibraryEntry[]> {
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

  return user.userAlbums.map((userAlbum) =>
    mapPersistedUserAlbumToLibraryEntry(user.id, userAlbum),
  );
}

export async function markMissingSpotifyLibraryEntriesAsRemoved(
  userId: string,
  currentSpotifyAlbumIds: Set<string>,
) {
  const result = await prisma.userAlbum.updateMany({
    where: {
      userId,
      source: "spotify",
      removedFromSpotify: false,
      album: {
        spotifyAlbumId: {
          notIn: Array.from(currentSpotifyAlbumIds),
        },
      },
    },
    data: { removedFromSpotify: true },
  });

  return result.count;
}
