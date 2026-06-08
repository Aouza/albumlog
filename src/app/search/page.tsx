"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AlbumCard } from "@/components/album/album-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAlbumsSearch, useLibrary } from "@/lib/queries/albums";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const search = useAlbumsSearch(query);
  const library = useLibrary({ status: "all", query: "" });

  const libraryByAlbum = useMemo(() => {
    return new Map(library.data?.map((entry) => [entry.album.id, entry.userAlbum]) ?? []);
  }, [library.data]);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/10 bg-[#0b0b16]/86 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#eef33f]">Catalogo</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Busca de albuns</h1>
        <p className="mt-2 max-w-2xl text-white/52">
          Esta tela esta pronta para a busca real no catalogo. Enquanto a integracao nao entra,
          nenhum resultado fake sera exibido.
        </p>
      </section>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/38" size={19} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Digite um album, artista ou genero"
          className="h-14 w-full rounded-2xl border border-white/10 bg-[#0b0b16]/86 pl-12 pr-4 text-base text-white shadow-[0_18px_55px_rgba(0,0,0,0.32)] outline-none backdrop-blur-xl transition placeholder:text-white/32 focus:border-[#4f5bff] focus:ring-2 focus:ring-[#4f5bff]/25"
        />
      </label>

      <div className="grid gap-3 lg:grid-cols-2">
        {search.data?.map((album) => (
          <AlbumCard key={album.id} album={album} userAlbum={libraryByAlbum.get(album.id)} />
        ))}
      </div>

      {search.data?.length === 0 && (
        <EmptyState
          icon={Search}
          title={query ? "Nenhum resultado disponivel ainda" : "A busca real ainda nao esta conectada"}
          description={
            query
              ? "Removemos os dados de exemplo. Os resultados vao aparecer aqui quando a integracao com Spotify ou MusicBrainz estiver pronta."
              : "Digite uma busca para validar o fluxo visual; a origem de dados real entra na proxima etapa."
          }
        />
      )}
    </div>
  );
}
