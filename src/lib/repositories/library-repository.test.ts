import { describe, expect, it } from "vitest";
import { mapPersistedUserAlbumToLibraryEntry } from "./library-mapper";

describe("library repository mapping", () => {
  it("maps a persisted user album to the AlbumLog LibraryEntry shape", () => {
    const now = new Date("2026-06-08T12:00:00.000Z");

    expect(
      mapPersistedUserAlbumToLibraryEntry("user-id", {
        id: "user-album-id",
        status: "favorite",
        rating: 4.5,
        review: "Great record",
        listenedAt: now,
        createdAt: now,
        updatedAt: now,
        album: {
          spotifyAlbumId: "spotify-album-id",
          title: "Heroine",
          artistName: "Thornhill",
          coverUrl: "https://i.scdn.co/image/cover",
          releaseDate: "2022-06-03",
          spotifyUrl: "https://open.spotify.com/album/spotify-album-id",
        },
      }),
    ).toEqual({
      album: {
        id: "spotify-album-id",
        spotifyId: "spotify-album-id",
        title: "Heroine",
        artist: "Thornhill",
        coverUrl: "https://i.scdn.co/image/cover",
        releaseDate: "2022-06-03",
        genres: [],
        externalUrl: "https://open.spotify.com/album/spotify-album-id",
      },
      userAlbum: {
        id: "user-album-id",
        userId: "user-id",
        albumId: "spotify-album-id",
        status: "favorite",
        rating: 4.5,
        review: "Great record",
        listenedAt: "2026-06-08T12:00:00.000Z",
        createdAt: "2026-06-08T12:00:00.000Z",
        updatedAt: "2026-06-08T12:00:00.000Z",
      },
    });
  });
});
