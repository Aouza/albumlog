import { describe, expect, it } from "vitest";
import { getDiscoverStaticSections } from "./discover-sections";

describe("discover sections", () => {
  it("keeps Discover focused on platform catalog search and friend recommendations", () => {
    expect(getDiscoverStaticSections()).toEqual([
      {
        eyebrow: "Amigos",
        title: "Recomendacoes de amigos",
        description: "Albuns enviados por conexoes ficam aqui para voce aceitar e revisitar depois.",
      },
    ]);
  });
});
