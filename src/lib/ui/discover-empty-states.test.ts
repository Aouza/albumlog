import { describe, expect, it } from "vitest";
import { getFriendRecommendationsEmptyStateCopy } from "./discover-empty-states";

describe("discover empty states", () => {
  it("explains friend recommendations without asking for Spotify reconnection", () => {
    expect(getFriendRecommendationsEmptyStateCopy()).toEqual({
      title: "Recomendacoes de amigos vao aparecer aqui",
      description:
        "Quando adicionarmos amigos, albuns recomendados por pessoas que voce segue ficarao nesta lista.",
    });
  });
});
