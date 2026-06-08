import { describe, expect, it } from "vitest";
import { getAlbumDetail, getDashboardStats, getLibrary, searchAlbums } from "./albums";

describe("empty album data layer", () => {
  it("starts with no catalog results", async () => {
    await expect(searchAlbums("anything")).resolves.toEqual([]);
  });

  it("starts with an empty user library", async () => {
    await expect(getLibrary({ status: "all", query: "" })).resolves.toEqual([]);
  });

  it("returns null for album detail until a real catalog exists", async () => {
    await expect(getAlbumDetail("missing-album")).resolves.toBeNull();
  });

  it("returns zeroed dashboard stats", async () => {
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
