import { describe, expect, it } from "vitest";
import { getRecommendationLibraryDefaults } from "./recommendation-library";

describe("recommendation library defaults", () => {
  it("adds accepted recommendations as AlbumLog library entries", () => {
    expect(getRecommendationLibraryDefaults()).toEqual({
      source: "recommendation",
      status: "want_to_listen",
      rating: null,
      review: "",
      removedFromSpotify: false,
    });
  });
});
