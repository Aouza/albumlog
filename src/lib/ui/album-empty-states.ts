type EmptyStateCopy = {
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
};

export function getLibraryEmptyStateCopy({
  hasAnySavedAlbums,
  hasActiveFilters,
}: {
  hasAnySavedAlbums: boolean;
  hasActiveFilters: boolean;
}): EmptyStateCopy {
  if (hasAnySavedAlbums && hasActiveFilters) {
    return {
      title: "Nenhum album encontrado",
      description: "Ajuste os filtros ou busque por outro album, artista ou genero.",
    };
  }

  return {
    title: "Sua biblioteca ainda esta vazia",
    description: "Entre com Spotify ou reconecte sua conta para autorizar a leitura dos albuns salvos.",
    action: { href: "/login", label: "Entrar com Spotify" },
  };
}

export function getSearchEmptyStateCopy({
  query,
  hasAnySavedAlbums,
}: {
  query: string;
  hasAnySavedAlbums: boolean;
}): EmptyStateCopy {
  if (query.trim() && hasAnySavedAlbums) {
    return {
      title: "Nenhum album salvo encontrado",
      description: "Nada nos seus albuns salvos corresponde a essa busca.",
    };
  }

  if (query.trim()) {
    return {
      title: "Nenhum album salvo para pesquisar",
      description: "Entre com Spotify ou reconecte sua conta para carregar seus albuns salvos.",
      action: { href: "/login", label: "Entrar com Spotify" },
    };
  }

  return {
    title: "Pesquise seus albuns salvos",
    description: "Entre com Spotify e autorize a biblioteca para pesquisar seus albuns salvos.",
    action: { href: "/login", label: "Entrar com Spotify" },
  };
}
