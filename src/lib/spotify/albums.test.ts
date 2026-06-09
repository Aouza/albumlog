import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchSavedAlbums, fetchSavedAlbumsSince, mapSpotifySavedAlbum } from "./albums";

describe("Spotify saved albums mapper", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps a saved Spotify album into AlbumLog library entry shape", () => {
    const entry = mapSpotifySavedAlbum({
      added_at: "2026-06-08T12:00:00Z",
      album: {
        id: "spotify-album-id",
        name: "Album Name",
        artists: [{ name: "Artist One" }, { name: "Artist Two" }],
        images: [{ url: "https://i.scdn.co/image/cover", height: 640, width: 640 }],
        release_date: "2026-01-01",
        external_urls: { spotify: "https://open.spotify.com/album/spotify-album-id" },
        genres: ["rock"],
      },
    });

    expect(entry.album).toEqual({
      id: "spotify-album-id",
      spotifyId: "spotify-album-id",
      title: "Album Name",
      artist: "Artist One, Artist Two",
      coverUrl: "https://i.scdn.co/image/cover",
      releaseDate: "2026-01-01",
      genres: ["rock"],
      externalUrl: "https://open.spotify.com/album/spotify-album-id",
    });
    expect(entry.userAlbum.status).toBe("want_to_listen");
    expect(entry.userAlbum.rating).toBeNull();
    expect(entry.userAlbum.review).toBe("");
    expect(entry.userAlbum.createdAt).toBe("2026-06-08T12:00:00Z");
  });

  it("loads every saved album page from Spotify", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json({
        items: [
          {
            added_at: "2026-06-08T12:00:00Z",
            album: {
              id: "first-page-album",
              name: "First Page",
              artists: [{ name: "Artist" }],
              images: [],
              release_date: "2026",
              external_urls: {},
              genres: [],
            },
          },
        ],
        next: "https://api.spotify.com/v1/me/albums?offset=50&limit=50",
        total: 2,
      }),
    );

    fetchMock.mockResolvedValueOnce(
      Response.json({
        items: [
          {
            added_at: "2026-06-09T12:00:00Z",
            album: {
              id: "second-page-album",
              name: "Second Page",
              artists: [{ name: "Artist" }],
              images: [],
              release_date: "2026",
              external_urls: {},
              genres: [],
            },
          },
        ],
        next: null,
        total: 2,
      }),
    );

    await expect(fetchSavedAlbums("access-token")).resolves.toMatchObject([
      { album: { id: "first-page-album" } },
      { album: { id: "second-page-album" } },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("limit=50");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("https://api.spotify.com/v1/me/albums?offset=50&limit=50");
  });

  it("loads only albums saved after the known Spotify saved date", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json({
        items: [
          {
            added_at: "2026-06-09T14:00:00Z",
            album: {
              id: "new-album",
              name: "New Album",
              artists: [{ name: "Artist" }],
              images: [],
              release_date: "2026",
              external_urls: {},
              genres: [],
            },
          },
          {
            added_at: "2026-06-09T09:00:00Z",
            album: {
              id: "known-album",
              name: "Known Album",
              artists: [{ name: "Artist" }],
              images: [],
              release_date: "2026",
              external_urls: {},
              genres: [],
            },
          },
        ],
        next: "https://api.spotify.com/v1/me/albums?offset=50&limit=50",
        total: 2,
      }),
    );

    await expect(
      fetchSavedAlbumsSince("access-token", new Date("2026-06-09T10:00:00Z")),
    ).resolves.toMatchObject([{ album: { id: "new-album" } }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
