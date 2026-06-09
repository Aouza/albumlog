import { describe, expect, it, vi } from "vitest";
import { syncSpotifyLibrary } from "./spotify-library-sync";

describe("syncSpotifyLibrary", () => {
  it("imports every fetched saved album for the user", async () => {
    const persistEntries = vi
      .fn()
      .mockResolvedValue({ totalImported: 1, totalUpdated: 0 });

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
      persistEntries,
      markRemovedEntries: async () => 0,
      createSyncRecord: async () => "sync-id",
      finishSyncRecord: async () => undefined,
      failSyncRecord: async () => undefined,
    });

    expect(result).toEqual({ totalImported: 1, totalUpdated: 0, totalMarkedRemoved: 0 });
    expect(persistEntries).toHaveBeenCalledTimes(1);
    expect(persistEntries).toHaveBeenCalledWith(
      "user-id",
      expect.arrayContaining([
        expect.objectContaining({
          album: expect.objectContaining({ spotifyId: "spotify-album" }),
        }),
      ]),
    );
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
      persistEntries: async () => ({ totalImported: 1, totalUpdated: 0 }),
      markRemovedEntries,
      createSyncRecord: async () => "sync-id",
      finishSyncRecord: async () => undefined,
      failSyncRecord: async () => undefined,
    });

    expect(markRemovedEntries).toHaveBeenCalledWith("user-id", new Set(["kept-album"]));
    expect(result.totalMarkedRemoved).toBe(2);
  });

  it("runs incremental sync without marking removed albums", async () => {
    const markRemovedEntries = vi.fn().mockResolvedValue(0);
    const fetchSavedAlbumsSince = vi.fn().mockResolvedValue([]);

    const result = await syncSpotifyLibrary({
      userId: "user-id",
      accessToken: "access-token",
      syncType: "incremental",
      since: new Date("2026-06-09T10:00:00Z"),
      fetchSavedAlbumsSince,
      persistEntries: async () => ({ totalImported: 0, totalUpdated: 0 }),
      markRemovedEntries,
      createSyncRecord: async () => "sync-id",
      finishSyncRecord: async () => undefined,
      failSyncRecord: async () => undefined,
    });

    expect(fetchSavedAlbumsSince).toHaveBeenCalledWith(
      "access-token",
      new Date("2026-06-09T10:00:00Z"),
    );
    expect(markRemovedEntries).not.toHaveBeenCalled();
    expect(result).toEqual({ totalImported: 0, totalUpdated: 0, totalMarkedRemoved: 0 });
  });

  it("falls back to a full fetch when incremental sync has no known saved date", async () => {
    const fetchSavedAlbums = vi.fn().mockResolvedValue([]);
    const fetchSavedAlbumsSince = vi.fn().mockResolvedValue([]);

    await syncSpotifyLibrary({
      userId: "user-id",
      accessToken: "access-token",
      syncType: "incremental",
      fetchSavedAlbums,
      fetchSavedAlbumsSince,
      persistEntries: async () => ({ totalImported: 0, totalUpdated: 0 }),
      markRemovedEntries: async () => 0,
      createSyncRecord: async () => "sync-id",
      finishSyncRecord: async () => undefined,
      failSyncRecord: async () => undefined,
    });

    expect(fetchSavedAlbums).toHaveBeenCalledWith("access-token");
    expect(fetchSavedAlbumsSince).not.toHaveBeenCalled();
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
