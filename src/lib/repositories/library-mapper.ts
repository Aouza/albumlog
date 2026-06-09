import type { LibraryEntry } from "@/types/album";

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

export function mapPersistedUserAlbumToLibraryEntry(
  userId: string,
  userAlbum: PersistedUserAlbum,
): LibraryEntry {
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
