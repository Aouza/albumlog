"use client";

import { Activity, Headphones, Library, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { AlbumCard } from "@/components/album/album-card";
import { StatsStrip } from "@/components/stats/stats-strip";
import { EmptyState } from "@/components/ui/empty-state";
import { useDashboardStats, useLibrary } from "@/lib/queries/albums";

export default function DashboardPage() {
  const stats = useDashboardStats();
  const library = useLibrary({ status: "all", query: "" });
  const recentEntries = library.data?.slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b16]/88 p-7 text-white shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7c86ff] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#4f5bff]/16 to-transparent" />
          <p className="relative text-sm font-semibold uppercase tracking-[0.18em] text-[#eef33f]">
            Diario musical
          </p>
          <h1 className="relative mt-3 max-w-2xl text-4xl font-semibold tracking-normal md:text-6xl">
            Construa sua memoria de albuns.
          </h1>
          <p className="relative mt-4 max-w-2xl text-base leading-7 text-white/62">
            Busque, salve, avalie e revise discos completos em uma biblioteca feita para quem
            realmente acompanha a propria jornada musical.
          </p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#4f5bff] px-4 text-sm font-semibold text-white shadow-[0_0_34px_rgba(79,91,255,0.44)] transition hover:bg-[#6570ff]"
            >
              <Search size={17} />
              Buscar albuns
            </Link>
            <Link
              href="/library"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Library size={17} />
              Ver biblioteca
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#0b0b16]/88 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#4f5bff]/16 text-[#7c86ff]">
              <Headphones size={21} />
            </span>
            <div>
              <h2 className="font-semibold text-white">Agora no radar</h2>
              <p className="text-sm text-white/48">Seu proximo album esta a uma busca.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-white/52">
              <span>Primeiro album em menos de</span>
              <strong className="text-white">1 min</strong>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-white/52">
              <span>Status principais</span>
              <strong className="text-white">6</strong>
            </div>
            <div className="flex items-center justify-between text-white/52">
              <span>Fonte atual</span>
              <strong className="text-white">Spotify</strong>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-[#4f5bff]/20 bg-[#4f5bff]/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#eef33f]">
              <Sparkles size={16} />
              Proximo passo
            </div>
            <p className="mt-3 text-sm leading-6 text-white/68">
              A biblioteca agora le seus albuns salvos no Spotify. Reconecte se voce autorizou antes
              da permissao de biblioteca ser adicionada.
            </p>
          </div>
        </div>
      </section>

      {stats.data && <StatsStrip stats={stats.data} />}

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#eef33f]">
              <Activity size={18} />
              <h2 className="text-xl font-semibold text-white">Atividade recente</h2>
            </div>
            <p className="text-sm text-white/45">Os ultimos movimentos da sua biblioteca.</p>
          </div>
          <Link href="/library" className="text-sm font-semibold text-[#8f97ff] hover:underline">
            Abrir biblioteca
          </Link>
        </div>
        {recentEntries.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-3">
            {recentEntries.map((entry) => (
              <AlbumCard key={entry.userAlbum.id} album={entry.album} userAlbum={entry.userAlbum} compact />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Library}
            title="Sua atividade ainda esta vazia"
            description="Seus albuns salvos no Spotify vao aparecer aqui depois do login com a permissao de biblioteca."
            action={{ href: "/search", label: "Ir para busca" }}
          />
        )}
      </section>
    </div>
  );
}
