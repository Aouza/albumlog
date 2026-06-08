"use client";

import { Library } from "lucide-react";
import { useState } from "react";
import { AlbumCard } from "@/components/album/album-card";
import { LibraryFilters } from "@/components/library/library-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { useLibrary } from "@/lib/queries/albums";
import type { LibraryFilters as LibraryFiltersType } from "@/types/album";

export default function LibraryPage() {
  const [filters, setFilters] = useState<LibraryFiltersType>({ status: "all", query: "" });
  const library = useLibrary(filters);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/10 bg-[#0b0b16]/86 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#eef33f]">Colecao pessoal</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Biblioteca</h1>
        <p className="mt-2 max-w-2xl text-white/52">
          Seus albuns salvos no Spotify aparecem aqui como ponto de partida da biblioteca.
        </p>
      </section>

      <LibraryFilters filters={filters} onChange={setFilters} />

      <div className="grid gap-3 lg:grid-cols-2">
        {library.data?.map((entry) => (
          <AlbumCard key={entry.userAlbum.id} album={entry.album} userAlbum={entry.userAlbum} />
        ))}
      </div>

      {library.data?.length === 0 && (
        <EmptyState
          icon={Library}
          title="Sua biblioteca ainda esta vazia"
          description="Entre com Spotify ou reconecte sua conta para autorizar a leitura dos albuns salvos."
          action={{ href: "/login", label: "Entrar com Spotify" }}
        />
      )}
    </div>
  );
}
