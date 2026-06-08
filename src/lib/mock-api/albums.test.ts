import { beforeEach, describe, expect, it } from "vitest";
import {
  getAlbumDetail,
  getDashboardStats,
  getLibrary,
  resetMockLibrary,
  searchAlbums,
  updateUserAlbum,
} from "./albums";

describe("album mock api", () => {
  beforeEach(() => {
    resetMockLibrary();
  });

  it("searches albums by artist and title case-insensitively", async () => {
    const thornhillResults = await searchAlbums("thornhill");
    const darkPoolResults = await searchAlbums("dark pool");

    expect(thornhillResults.map((album) => album.title)).toContain("The Dark Pool");
    expect(thornhillResults.map((album) => album.title)).toContain("Heroine");
    expect(darkPoolResults).toHaveLength(1);
    expect(darkPoolResults[0]?.artist).toBe("Thornhill");
  });

  it("filters the library by status and text", async () => {
    const favorites = await getLibrary({ status: "favorite", query: "" });
    const thornhill = await getLibrary({ status: "all", query: "thornhill" });

    expect(favorites.every((entry) => entry.userAlbum.status === "favorite")).toBe(true);
    expect(thornhill.every((entry) => entry.album.artist === "Thornhill")).toBe(true);
  });

  it("updates status, rating, review, and exposes album detail", async () => {
    const updated = await updateUserAlbum({
      albumId: "the-dark-pool",
      status: "listened",
      rating: 4.5,
      review: "Excelente producao. Atmosfera pesada e emocional.",
    });
    const detail = await getAlbumDetail("the-dark-pool");

    expect(updated.status).toBe("listened");
    expect(updated.rating).toBe(4.5);
    expect(detail?.userAlbum?.review).toContain("Atmosfera pesada");
    expect(detail?.userAlbum?.listenedAt).toBeTruthy();
  });

  it("calculates dashboard stats from the current library", async () => {
    await updateUserAlbum({
      albumId: "bodies",
      status: "listened",
      rating: 4,
      review: "Direto e cheio de textura.",
    });

    const stats = await getDashboardStats();

    expect(stats.totalAlbums).toBeGreaterThanOrEqual(4);
    expect(stats.listenedAlbums).toBeGreaterThanOrEqual(2);
    expect(stats.totalReviews).toBeGreaterThanOrEqual(2);
    expect(stats.averageRating).toBeGreaterThan(0);
  });
});
