import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCatalogAlbums, mapSpotifySearchAlbum } from "./search";

describe("Spotify catalog search", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps a Spotify search album into AlbumLog album shape", () => {
    const album = mapSpotifySearchAlbum({
      id: "spotify-album-id",
      name: "Heroine",
      artists: [{ name: "Thornhill" }],
      images: [{ url: "https://i.scdn.co/image/cover", height: 640, width: 640 }],
      release_date: "2022-06-03",
      external_urls: { spotify: "https://open.spotify.com/album/spotify-album-id" },
      genres: [],
    });

    expect(album).toEqual({
      id: "spotify-album-id",
      spotifyId: "spotify-album-id",
      title: "Heroine",
      artist: "Thornhill",
      coverUrl: "https://i.scdn.co/image/cover",
      releaseDate: "2022-06-03",
      genres: [],
      externalUrl: "https://open.spotify.com/album/spotify-album-id",
    });
  });

  it("does not call Spotify when the query is empty", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(fetchCatalogAlbums("access-token", "   ")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("searches Spotify albums with a trimmed query", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        albums: {
          items: [
            {
              id: "album-id",
              name: "The Dark Pool",
              artists: [{ name: "Thornhill" }],
              images: [],
              release_date: "2019-10-25",
              external_urls: {},
              genres: [],
            },
          ],
        },
      }),
    );

    await expect(fetchCatalogAlbums("access-token", " Thornhill ")).resolves.toMatchObject([
      { id: "album-id", title: "The Dark Pool" },
    ]);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("q=Thornhill");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("type=album");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("limit=10");
  });
});
