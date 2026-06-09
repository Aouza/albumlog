"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LibraryFilters, UpdateUserAlbumInput } from "@/types/album";
import type { SpotifySyncStatus } from "@/lib/sync/spotify-sync-status";
import type { SpotifyLibrarySyncType } from "@/lib/sync/spotify-library-sync";
import {
  getAlbumDetail,
  getDashboardStats,
  getLibrary,
  searchAlbums,
  searchCatalogAlbums,
  updateUserAlbum,
} from "@/lib/data/albums";

export const albumKeys = {
  all: ["albums"] as const,
  search: (query: string) => [...albumKeys.all, "search", query] as const,
  catalogSearch: (query: string) => [...albumKeys.all, "catalog-search", query] as const,
  library: (filters: LibraryFilters) => [...albumKeys.all, "library", filters] as const,
  detail: (id: string) => [...albumKeys.all, "detail", id] as const,
  stats: () => [...albumKeys.all, "stats"] as const,
  syncStatus: () => [...albumKeys.all, "sync-status"] as const,
};

export function useAlbumsSearch(query: string) {
  return useQuery({
    queryKey: albumKeys.search(query),
    queryFn: () => searchAlbums(query),
  });
}

export function useCatalogAlbumSearch(query: string) {
  return useQuery({
    queryKey: albumKeys.catalogSearch(query),
    queryFn: () => searchCatalogAlbums(query),
  });
}

export function useLibrary(filters: LibraryFilters) {
  return useQuery({
    queryKey: albumKeys.library(filters),
    queryFn: () => getLibrary(filters),
  });
}

export function useAlbumDetail(id: string) {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => getAlbumDetail(id),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: albumKeys.stats(),
    queryFn: getDashboardStats,
  });
}

export function useSpotifySyncStatus() {
  return useQuery({
    queryKey: albumKeys.syncStatus(),
    queryFn: async () => {
      const response = await fetch("/api/spotify/sync/status");

      if (!response.ok) {
        throw new Error("Unable to load Spotify sync status");
      }

      return (await response.json()) as { sync: SpotifySyncStatus | null };
    },
    refetchInterval: (query) => (query.state.data?.sync?.status === "syncing" ? 2_000 : false),
  });
}

export function useUpdateUserAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserAlbumInput) => updateUserAlbum(input),
    onSuccess: async (_result, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: albumKeys.all }),
        queryClient.invalidateQueries({ queryKey: albumKeys.detail(input.albumId) }),
      ]);
    },
  });
}

export function useSyncSpotifyLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input?: { syncType?: SpotifyLibrarySyncType }) => {
      const response = await fetch("/api/spotify/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input ?? {}),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;

        throw new Error(body?.message ?? "Nao foi possivel atualizar sua biblioteca Spotify agora.");
      }

      return (await response.json()) as {
        summary: { totalImported: number; totalUpdated: number; totalMarkedRemoved: number };
      };
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: albumKeys.all }),
        queryClient.invalidateQueries({ queryKey: albumKeys.syncStatus() }),
      ]);
    },
  });
}
