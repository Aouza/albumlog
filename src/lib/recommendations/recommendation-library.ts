export function getRecommendationLibraryDefaults() {
  return {
    source: "recommendation",
    status: "want_to_listen",
    rating: null,
    review: "",
    removedFromSpotify: false,
  } as const;
}
