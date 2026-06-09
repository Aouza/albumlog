"use client";

import { Compass, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FriendRecommendationsSection } from "@/components/discover/friend-recommendations-section";
import { HorizontalAlbumSection } from "@/components/discover/horizontal-album-section";
import { EmptyState } from "@/components/ui/empty-state";
import { useCatalogAlbumSearch, useLibrary } from "@/lib/queries/albums";

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const catalogSearch = useCatalogAlbumSearch(query);
  const library = useLibrary({ status: "all", query: "" });

  const libraryByAlbum = useMemo(() => {
    return new Map(library.data?.map((entry) => [entry.album.id, entry.userAlbum]) ?? []);
  }, [library.data]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[#0b0b16]/86 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#eef33f]">Descoberta</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Descobrir albuns</h1>
        <p className="mt-2 max-w-2xl text-white/52">
          Encontre novos albuns no catalogo Spotify e prepare recomendacoes vindas dos seus amigos.
        </p>
      </section>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/38" size={19} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busque no catalogo Spotify por album ou artista"
          className="h-14 w-full rounded-2xl border border-white/10 bg-[#0b0b16]/86 pl-12 pr-4 text-base text-white shadow-[0_18px_55px_rgba(0,0,0,0.32)] outline-none backdrop-blur-xl transition placeholder:text-white/32 focus:border-[#4f5bff] focus:ring-2 focus:ring-[#4f5bff]/25"
        />
      </label>

      {catalogSearch.data && catalogSearch.data.length > 0 && (
        <HorizontalAlbumSection
          eyebrow="Catalogo Spotify"
          title="Resultados da busca"
          description="Albuns encontrados na plataforma Spotify."
          albums={catalogSearch.data}
          libraryByAlbum={libraryByAlbum}
        />
      )}

      {query.trim() && catalogSearch.data?.length === 0 && (
        <EmptyState
          icon={Compass}
          title="Nenhum album encontrado"
          description="Tente buscar por outro album ou artista no catalogo Spotify."
        />
      )}

      <FriendRecommendationsSection />
    </div>
  );
}
