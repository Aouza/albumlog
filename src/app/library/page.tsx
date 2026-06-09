"use client";

import { Library } from "lucide-react";
import { useState } from "react";
import { AlbumCard } from "@/components/album/album-card";
import { LibraryFilters } from "@/components/library/library-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { useLibrary, useSyncSpotifyLibrary } from "@/lib/queries/albums";
import { getLibraryEmptyStateCopy } from "@/lib/ui/album-empty-states";
import type { LibraryFilters as LibraryFiltersType } from "@/types/album";

export default function LibraryPage() {
  const [filters, setFilters] = useState<LibraryFiltersType>({ status: "all", query: "" });
  const library = useLibrary(filters);
  const fullLibrary = useLibrary({ status: "all", query: "" });
  const syncSpotifyLibrary = useSyncSpotifyLibrary();
  const hasActiveFilters = filters.status !== "all" || Boolean(filters.query.trim());
  const emptyStateCopy = getLibraryEmptyStateCopy({
    hasAnySavedAlbums: Boolean(fullLibrary.data?.length),
    hasActiveFilters,
  });

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/10 bg-[#0b0b16]/86 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#eef33f]">Colecao pessoal</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">Biblioteca</h1>
            <p className="mt-2 max-w-2xl text-white/52">
              Seus albuns salvos no Spotify aparecem aqui como ponto de partida da biblioteca.
            </p>
          </div>
          <button
            type="button"
            onClick={() => syncSpotifyLibrary.mutate()}
            disabled={syncSpotifyLibrary.isPending}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white/72 transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
          >
            {syncSpotifyLibrary.isPending ? "Atualizando..." : "Atualizar Spotify"}
          </button>
        </div>
        {syncSpotifyLibrary.isError && (
          <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100">
            Nao foi possivel atualizar sua biblioteca Spotify agora.
          </p>
        )}
      </section>

      <LibraryFilters filters={filters} onChange={setFilters} />

      <div className="grid gap-3 lg:grid-cols-2">
        {library.data?.map((entry, index) => (
          <AlbumCard
            key={entry.userAlbum.id}
            album={entry.album}
            userAlbum={entry.userAlbum}
            priorityCover={index === 0}
          />
        ))}
      </div>

      {library.data?.length === 0 && (
        <EmptyState
          icon={Library}
          title={emptyStateCopy.title}
          description={emptyStateCopy.description}
          action={emptyStateCopy.action}
        />
      )}
    </div>
  );
}
