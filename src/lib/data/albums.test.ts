import { afterEach, describe, expect, it, vi } from "vitest";
import { getAlbumDetail, getDashboardStats, getLibrary, searchAlbums } from "./albums";

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

  it("returns null for album detail until Spotify library contains the album", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        albums: [],
      }),
    );

    await expect(getAlbumDetail("missing-album")).resolves.toBeNull();
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
});
