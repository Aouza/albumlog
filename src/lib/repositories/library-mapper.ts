import type { Album, LibraryEntry, UserAlbum } from "@/types/album";

export type PersistedUserAlbum = {
  id: string;
  status: string;
  rating: number | null;
  review: string;
  listenedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  album: {
    spotifyAlbumId: string;
    title: string;
    artistName: string;
    coverUrl: string;
    releaseDate: string;
    spotifyUrl: string;
  };
};

export type PersistedAlbum = PersistedUserAlbum["album"];

export function mapPersistedAlbumToAlbum(album: PersistedAlbum): Album {
  return {
    id: album.spotifyAlbumId,
    spotifyId: album.spotifyAlbumId,
    title: album.title,
    artist: album.artistName,
    coverUrl: album.coverUrl,
    releaseDate: album.releaseDate,
    genres: [],
    externalUrl: album.spotifyUrl,
  };
}

export function mapPersistedUserAlbumToUserAlbum(
  userId: string,
  userAlbum: Omit<PersistedUserAlbum, "album"> & { albumId?: string },
): UserAlbum {
  return {
    id: userAlbum.id,
    userId,
    albumId: userAlbum.albumId ?? "",
    status: userAlbum.status as UserAlbum["status"],
    rating: userAlbum.rating,
    review: userAlbum.review,
    listenedAt: userAlbum.listenedAt?.toISOString() ?? null,
    createdAt: userAlbum.createdAt.toISOString(),
    updatedAt: userAlbum.updatedAt.toISOString(),
  };
}

export function mapPersistedUserAlbumToLibraryEntry(
  userId: string,
  userAlbum: PersistedUserAlbum,
): LibraryEntry {
  return {
    album: mapPersistedAlbumToAlbum(userAlbum.album),
    userAlbum: mapPersistedUserAlbumToUserAlbum(userId, {
      ...userAlbum,
      albumId: userAlbum.album.spotifyAlbumId,
    }),
  };
}
