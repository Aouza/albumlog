"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LibraryFilters, UpdateUserAlbumInput } from "@/types/album";
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
    mutationFn: async () => {
      const response = await fetch("/api/spotify/sync", { method: "POST" });

      if (!response.ok) {
        throw new Error("Unable to sync Spotify library");
      }

      return (await response.json()) as {
        summary: { totalImported: number; totalUpdated: number; totalMarkedRemoved: number };
      };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
}
