"use client";

import { useQuery } from "@tanstack/react-query";
import type { AlbumSocialContextPayload } from "@/types/album-social-context";
import { getLimitedAlbumContextIds } from "@/lib/social/album-social-context";

export const albumSocialContextKeys = {
  all: ["album-social-context"] as const,
  batch: (albumIds: string[]) =>
    [...albumSocialContextKeys.all, getLimitedAlbumContextIds(albumIds).sort().join(",")] as const,
};

export function useAlbumSocialContext(albumIds: string[]) {
  const normalizedAlbumIds = getLimitedAlbumContextIds(albumIds);

  return useQuery({
    queryKey: albumSocialContextKeys.batch(normalizedAlbumIds),
    enabled: normalizedAlbumIds.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const response = await fetch("/api/albums/social-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumIds: normalizedAlbumIds }),
      });

      if (response.status === 401) {
        return { albums: {} } satisfies AlbumSocialContextPayload;
      }

      if (!response.ok) {
        throw new Error("Nao foi possivel carregar o contexto social dos albuns.");
      }

      return (await response.json()) as AlbumSocialContextPayload;
    },
  });
}
