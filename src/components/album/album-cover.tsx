import { Music2 } from "lucide-react";
import Image from "next/image";
import type { Album } from "@/types/album";

export function AlbumCover({
  album,
  className = "",
  priority = false,
}: {
  album: Album;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative aspect-square overflow-hidden rounded-md bg-[#211d1a] ${className}`}>
      {album.coverUrl ? (
        <Image
          src={album.coverUrl}
          alt={`${album.title} cover`}
          fill
          sizes="220px"
          loading={priority ? "eager" : "lazy"}
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-[#f6f3ed]">
          <Music2 size={32} />
        </div>
      )}
      <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
    </div>
  );
}
