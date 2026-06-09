import { describe, expect, it } from "vitest";
import { getFriendRecommendationsEmptyStateCopy } from "./discover-empty-states";

describe("discover empty states", () => {
  it("explains friend recommendations without asking for Spotify reconnection", () => {
    expect(getFriendRecommendationsEmptyStateCopy()).toEqual({
      title: "Nenhuma recomendacao por enquanto",
      description:
        "Quando uma conexao recomendar um album para voce, ele ficara aqui como pendente ou aceito.",
    });
  });
});
