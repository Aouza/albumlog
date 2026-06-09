import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAlbumDetail,
  getDashboardStats,
  getLibrary,
  searchAlbums,
  searchCatalogAlbums,
  updateUserAlbum,
} from "./albums";

describe("empty album data layer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with no catalog results when Spotify library is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 401 }));

    await expect(searchAlbums("anything")).resolves.toEqual([]);
  });

  it("starts with an empty user library when Spotify library is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 401 }));

    await expect(getLibrary({ status: "all", query: "" })).resolves.toEqual([]);
  });

  it("returns null for album detail until the catalog contains the album", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ error: "album_not_found" }, { status: 404 }));

    await expect(getAlbumDetail("missing-album")).resolves.toBeNull();
    expect(fetchSpy).toHaveBeenCalledWith("/api/albums/missing-album");
  });

  it("returns zeroed dashboard stats when Spotify library is empty", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        albums: [],
      }),
    );

    await expect(getDashboardStats()).resolves.toEqual({
      totalAlbums: 0,
      listenedAlbums: 0,
      totalArtists: 0,
      totalReviews: 0,
      estimatedHours: 0,
      averageRating: 0,
    });
  });

  it("searches the Spotify catalog through the AlbumLog API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        albums: [
          {
            id: "catalog-album",
            spotifyId: "catalog-album",
            title: "Heroine",
            artist: "Thornhill",
            coverUrl: "",
            releaseDate: "2022-06-03",
            genres: [],
            externalUrl: "",
          },
        ],
      }),
    );

    await expect(searchCatalogAlbums("Heroine")).resolves.toMatchObject([
      { id: "catalog-album", title: "Heroine" },
    ]);
  });

  it("persists user album status through the AlbumLog album API", async () => {
    const userAlbum = {
      id: "user-album-id",
      userId: "user-id",
      albumId: "spotify-album-id",
      status: "favorite",
      rating: 4.5,
      review: "Grande album.",
      listenedAt: null,
      createdAt: "2026-06-09T12:00:00.000Z",
      updatedAt: "2026-06-09T12:00:00.000Z",
    };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ userAlbum }));

    await expect(
      updateUserAlbum({
        albumId: "spotify-album-id",
        status: "favorite",
        rating: 4.5,
        review: "Grande album.",
      }),
    ).resolves.toEqual(userAlbum);
    expect(fetchSpy).toHaveBeenCalledWith("/api/albums/spotify-album-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "favorite",
        rating: 4.5,
        review: "Grande album.",
      }),
    });
  });
});
