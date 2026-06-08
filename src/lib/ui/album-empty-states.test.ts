import { describe, expect, it } from "vitest";
import { getLibraryEmptyStateCopy, getSearchEmptyStateCopy } from "./album-empty-states";

describe("album empty state copy", () => {
  it("uses a filter-specific empty state when the full library has albums", () => {
    expect(
      getLibraryEmptyStateCopy({
        hasAnySavedAlbums: true,
        hasActiveFilters: true,
      }),
    ).toEqual({
      title: "Nenhum album encontrado",
      description: "Ajuste os filtros ou busque por outro album, artista ou genero.",
      action: undefined,
    });
  });

  it("uses the Spotify connection empty state when there are no saved albums at all", () => {
    expect(
      getLibraryEmptyStateCopy({
        hasAnySavedAlbums: false,
        hasActiveFilters: false,
      }),
    ).toEqual({
      title: "Sua biblioteca ainda esta vazia",
      description: "Entre com Spotify ou reconecte sua conta para autorizar a leitura dos albuns salvos.",
      action: { href: "/login", label: "Entrar com Spotify" },
    });
  });

  it("does not ask the user to connect Spotify when a search inside a populated library has no match", () => {
    expect(getSearchEmptyStateCopy({ query: "unknown", hasAnySavedAlbums: true })).toEqual({
      title: "Nenhum album salvo encontrado",
      description: "Nada nos seus albuns salvos corresponde a essa busca.",
    });
  });
}
);
