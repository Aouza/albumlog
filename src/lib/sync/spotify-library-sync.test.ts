import { describe, expect, it, vi } from "vitest";
import { syncSpotifyLibrary } from "./spotify-library-sync";

describe("syncSpotifyLibrary", () => {
  it("imports every fetched saved album for the user", async () => {
    const upsertEntry = vi.fn().mockResolvedValue(undefined);

    const result = await syncSpotifyLibrary({
      userId: "user-id",
      accessToken: "access-token",
      fetchSavedAlbums: async () => [
        {
          album: {
            id: "spotify-album",
            spotifyId: "spotify-album",
            title: "Heroine",
            artist: "Thornhill",
            coverUrl: "",
            releaseDate: "2022",
            genres: [],
            externalUrl: "",
          },
          userAlbum: {
            id: "entry",
            userId: "spotify-current-user",
            albumId: "spotify-album",
            status: "want_to_listen",
            rating: null,
            review: "",
            listenedAt: null,
            createdAt: "2026-06-08T00:00:00.000Z",
            updatedAt: "2026-06-08T00:00:00.000Z",
          },
        },
      ],
      upsertEntry,
      createSyncRecord: async () => "sync-id",
      finishSyncRecord: async () => undefined,
      failSyncRecord: async () => undefined,
    });

    expect(result).toEqual({ totalImported: 1, totalUpdated: 0, totalMarkedRemoved: 0 });
    expect(upsertEntry).toHaveBeenCalledTimes(1);
  });
});
