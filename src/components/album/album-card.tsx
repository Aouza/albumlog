"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { AlbumCover } from "@/components/album/album-cover";
import { StatusSelect } from "@/components/album/status-select";
import { useUpdateUserAlbum } from "@/lib/queries/albums";
import { cn, formatDate, formatRating, statusTone } from "@/lib/utils";
import type { Album, AlbumStatus, UserAlbum } from "@/types/album";
import { albumStatusLabels } from "@/types/album";

export function AlbumCard({
  album,
  userAlbum,
  compact = false,
}: {
  album: Album;
  userAlbum?: UserAlbum | null;
  compact?: boolean;
}) {
  const updateAlbum = useUpdateUserAlbum();
  const currentStatus: AlbumStatus = userAlbum?.status ?? "want_to_listen";

  function handleStatusChange(status: AlbumStatus) {
    updateAlbum.mutate({
      albumId: album.id,
      status,
      rating: userAlbum?.rating ?? null,
      review: userAlbum?.review ?? "",
    });
  }

  return (
    <article className="group grid grid-cols-[104px_1fr] gap-4 rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-3 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-xl transition hover:border-[#4f5bff]/45 hover:shadow-[0_22px_70px_rgba(44,68,255,0.22)]">
      <Link href={`/albums/${album.id}`} aria-label={`Abrir ${album.title}`}>
        <AlbumCover album={album} />
      </Link>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/albums/${album.id}`} className="line-clamp-2 font-semibold leading-snug text-white hover:underline">
              {album.title}
            </Link>
            <p className="mt-1 truncate text-sm text-white/48">{album.artist}</p>
          </div>
          <Link
            href={`/albums/${album.id}`}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/52 transition hover:bg-[#4f5bff] hover:text-white"
            title="Abrir album"
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={cn(
              "rounded-full px-2 py-1 font-semibold ring-1",
              statusTone(currentStatus),
            )}
          >
            {albumStatusLabels[currentStatus]}
          </span>
          <span className="rounded-full border border-[#eef33f]/20 bg-[#eef33f]/10 px-2 py-1 font-semibold text-[#eef33f]">
            {formatRating(userAlbum?.rating ?? null)}
          </span>
          {!compact && <span className="text-white/38">{formatDate(album.releaseDate)}</span>}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {userAlbum ? (
            <StatusSelect
              value={currentStatus}
              onChange={handleStatusChange}
              disabled={updateAlbum.isPending}
            />
          ) : (
            <button
              type="button"
              onClick={() => handleStatusChange("want_to_listen")}
              disabled={updateAlbum.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#4f5bff] px-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(79,91,255,0.32)] transition hover:bg-[#6570ff] disabled:cursor-wait disabled:opacity-70"
            >
              <Plus size={16} />
              Adicionar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
