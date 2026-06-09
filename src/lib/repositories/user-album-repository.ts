import type { AlbumStatus, UserAlbum } from "@/types/album";
import { prisma } from "@/lib/db/prisma";
import { mapPersistedUserAlbumToUserAlbum } from "@/lib/repositories/library-mapper";

export class UserAlbumCatalogEntryNotFoundError extends Error {
  constructor() {
    super("Album catalog entry not found");
    this.name = "UserAlbumCatalogEntryNotFoundError";
  }
}

export async function updateUserAlbumEntry({
  userId,
  spotifyAlbumId,
  status,
  rating,
  review,
}: {
  userId: string;
  spotifyAlbumId: string;
  status: AlbumStatus;
  rating?: number | null;
  review?: string;
}): Promise<UserAlbum> {
  const album = await prisma.album.findUnique({
    where: { spotifyAlbumId },
    select: { id: true, spotifyAlbumId: true },
  });

  if (!album) {
    throw new UserAlbumCatalogEntryNotFoundError();
  }

  const shouldSetListenedAt = status === "listened" || status === "favorite";
  const existingUserAlbum = await prisma.userAlbum.findUnique({
    where: {
      userId_albumId: {
        userId,
        albumId: album.id,
      },
    },
  });
  const userAlbum = await prisma.userAlbum.upsert({
    where: {
      userId_albumId: {
        userId,
        albumId: album.id,
      },
    },
    create: {
      userId,
      albumId: album.id,
      source: "albumlog",
      status,
      rating: rating ?? null,
      review: review ?? "",
      listenedAt: shouldSetListenedAt ? new Date() : null,
      removedFromSpotify: false,
    },
    update: {
      status,
      rating: rating ?? null,
      review: review ?? "",
      removedFromSpotify: false,
      listenedAt:
        shouldSetListenedAt && !existingUserAlbum?.listenedAt
          ? new Date()
          : existingUserAlbum?.listenedAt,
    },
  });

  return mapPersistedUserAlbumToUserAlbum(userId, {
    ...userAlbum,
    albumId: album.spotifyAlbumId,
  });
}
