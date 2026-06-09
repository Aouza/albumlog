import type { AlbumDetail } from "@/types/album";
import { prisma } from "@/lib/db/prisma";
import {
  mapPersistedAlbumToAlbum,
  mapPersistedUserAlbumToUserAlbum,
} from "@/lib/repositories/library-mapper";

export async function getAlbumDetailForUser(
  currentUserId: string,
  spotifyAlbumId: string,
): Promise<AlbumDetail | null> {
  const album = await prisma.album.findUnique({
    where: { spotifyAlbumId },
    include: {
      userAlbums: {
        where: { userId: currentUserId, removedFromSpotify: false },
        take: 1,
      },
    },
  });

  if (!album) {
    return null;
  }

  const userAlbum = album.userAlbums[0] ?? null;

  return {
    album: mapPersistedAlbumToAlbum(album),
    userAlbum: userAlbum
      ? mapPersistedUserAlbumToUserAlbum(currentUserId, {
          ...userAlbum,
          albumId: album.spotifyAlbumId,
        })
      : null,
  };
}
