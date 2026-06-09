"use client";

import { Calendar, ExternalLink, Tag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlbumCover } from "@/components/album/album-cover";
import { RecommendAlbumPanel } from "@/components/album/recommend-album-panel";
import { ReviewEditor } from "@/components/review/review-editor";
import { useAlbumDetail } from "@/lib/queries/albums";
import { formatDate, formatRating } from "@/lib/utils";

export default function AlbumDetailPage() {
  const params = useParams<{ id: string }>();
  const detail = useAlbumDetail(params.id);

  if (detail.isLoading) {
    return <div className="rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-6 text-white">Carregando album...</div>;
  }

  if (!detail.data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-6">
        <h1 className="text-xl font-semibold text-white">Album nao encontrado</h1>
        <Link href="/discover" className="mt-3 inline-block text-sm font-semibold text-[#8f97ff] hover:underline">
          Voltar para descobrir
        </Link>
      </div>
    );
  }

  const { album, userAlbum } = detail.data;

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="space-y-4">
        <AlbumCover album={album} className="shadow-[0_24px_90px_rgba(0,0,0,0.45)]" priority />
        <div className="rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <h1 className="text-3xl font-semibold text-white">{album.title}</h1>
          <p className="mt-2 text-lg text-white/55">{album.artist}</p>

          <div className="mt-4 space-y-3 text-sm text-white/52">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {formatDate(album.releaseDate)}
            </div>
            <div className="flex items-center gap-2">
              <Tag size={16} />
              {album.genres.join(", ")}
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink size={16} />
              <a href={album.externalUrl} className="font-semibold text-[#8f97ff] hover:underline">
                Abrir fonte externa
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Resumo</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs font-semibold uppercase text-white/38">Nota</p>
              <p className="mt-1 text-2xl font-semibold text-white">{formatRating(userAlbum?.rating ?? null)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs font-semibold uppercase text-white/38">Review</p>
              <p className="mt-1 text-2xl font-semibold text-white">{userAlbum?.review ? "Sim" : "Nao"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs font-semibold uppercase text-white/38">Ouvido em</p>
              <p className="mt-1 text-sm font-semibold text-white">{formatDate(userAlbum?.listenedAt ?? null)}</p>
            </div>
          </div>
        </section>

        <ReviewEditor albumId={album.id} userAlbum={userAlbum} />

        <RecommendAlbumPanel album={album} />
      </div>
    </div>
  );
}
