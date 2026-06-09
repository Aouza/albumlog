import type { LibraryEntry } from "@/types/album";
import { prisma } from "@/lib/db/prisma";
import { mapPersistedUserAlbumToLibraryEntry } from "@/lib/repositories/library-mapper";

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
