"use client";

import { AlertCircle, CheckCircle2, Clock3, Library } from "lucide-react";
import { useState } from "react";
import { AlbumCard } from "@/components/album/album-card";
import { LibraryFilters } from "@/components/library/library-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { useLibrary, useSpotifySyncStatus, useSyncSpotifyLibrary } from "@/lib/queries/albums";
import { getLibraryEmptyStateCopy } from "@/lib/ui/album-empty-states";
import type { LibraryFilters as LibraryFiltersType } from "@/types/album";

export default function LibraryPage() {
  const [filters, setFilters] = useState<LibraryFiltersType>({ status: "all", query: "" });
  const library = useLibrary(filters);
  const fullLibrary = useLibrary({ status: "all", query: "" });
  const syncSpotifyLibrary = useSyncSpotifyLibrary();
  const spotifySyncStatus = useSpotifySyncStatus();
  const latestSync = spotifySyncStatus.data?.sync;
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
            {syncSpotifyLibrary.error.message}
          </p>
        )}
        <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/[0.04] text-white/62">
              {latestSync?.status === "failed" ? (
                <AlertCircle className="size-4 text-red-200" />
              ) : latestSync ? (
                <CheckCircle2 className="size-4 text-[#eef33f]" />
              ) : (
                <Clock3 className="size-4" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-white/35">Ultimo sync</p>
              <p className="text-sm font-semibold text-white/76">
                {latestSync?.finishedAt
                  ? new Date(latestSync.finishedAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "Ainda nao sincronizado"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-white/35">Importados</p>
            <p className="text-sm font-semibold text-white/76">
              {latestSync ? latestSync.totalImported : "-"} albuns
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-white/35">Removidos do Spotify</p>
            <p className="text-sm font-semibold text-white/76">
              {latestSync ? latestSync.totalMarkedRemoved : "-"} mantidos no historico
            </p>
          </div>
        </div>
        {latestSync?.status === "failed" && latestSync.errorMessage && (
          <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100">
            O ultimo sync falhou. Tente atualizar novamente.
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
