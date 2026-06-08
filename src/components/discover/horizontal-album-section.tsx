"use client";

import { AlbumCard } from "@/components/album/album-card";
import type { Album, UserAlbum } from "@/types/album";

export function HorizontalAlbumSection({
  title,
  eyebrow,
  description,
  albums,
  libraryByAlbum,
  libraryAction = "preview",
}: {
  title: string;
  eyebrow: string;
  description: string;
  albums: Album[];
  libraryByAlbum?: Map<string, UserAlbum>;
  libraryAction?: "enabled" | "preview";
}) {
  if (albums.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eef33f]">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/45">{description}</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {albums.map((album, index) => (
          <div key={album.id} className="min-w-[320px] max-w-[360px] flex-1">
            <AlbumCard
              album={album}
              userAlbum={libraryByAlbum?.get(album.id)}
              compact
              libraryAction={libraryAction}
              priorityCover={index === 0}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
