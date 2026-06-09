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
      markRemovedEntries: async () => 0,
      createSyncRecord: async () => "sync-id",
      finishSyncRecord: async () => undefined,
      failSyncRecord: async () => undefined,
    });

    expect(result).toEqual({ totalImported: 1, totalUpdated: 0, totalMarkedRemoved: 0 });
    expect(upsertEntry).toHaveBeenCalledTimes(1);
  });

  it("marks persisted Spotify albums as removed when Spotify no longer returns them", async () => {
    const markRemovedEntries = vi.fn().mockResolvedValue(2);

    const result = await syncSpotifyLibrary({
      userId: "user-id",
      accessToken: "access-token",
      fetchSavedAlbums: async () => [
        {
          album: {
            id: "kept-album",
            spotifyId: "kept-album",
            title: "The Dark Pool",
            artist: "Thornhill",
            coverUrl: "",
            releaseDate: "2019",
            genres: [],
            externalUrl: "",
          },
          userAlbum: {
            id: "entry",
            userId: "spotify-current-user",
            albumId: "kept-album",
            status: "want_to_listen",
            rating: null,
            review: "",
            listenedAt: null,
            createdAt: "2026-06-08T00:00:00.000Z",
            updatedAt: "2026-06-08T00:00:00.000Z",
          },
        },
      ],
      upsertEntry: async () => undefined,
      markRemovedEntries,
      createSyncRecord: async () => "sync-id",
      finishSyncRecord: async () => undefined,
      failSyncRecord: async () => undefined,
    });

    expect(markRemovedEntries).toHaveBeenCalledWith("user-id", new Set(["kept-album"]));
    expect(result.totalMarkedRemoved).toBe(2);
  });

  it("records failed sync runs before rethrowing", async () => {
    const error = new Error("Spotify unavailable");
    const failSyncRecord = vi.fn().mockResolvedValue(undefined);

    await expect(
      syncSpotifyLibrary({
        userId: "user-id",
        accessToken: "access-token",
        fetchSavedAlbums: async () => {
          throw error;
        },
        createSyncRecord: async () => "sync-id",
        finishSyncRecord: async () => undefined,
        failSyncRecord,
      }),
    ).rejects.toThrow("Spotify unavailable");

    expect(failSyncRecord).toHaveBeenCalledWith("sync-id", error);
  });
});
