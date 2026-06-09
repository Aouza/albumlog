"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AlbumRecommendationsPayload,
  IncomingRecommendationsPayload,
} from "@/types/recommendation";

export const recommendationKeys = {
  all: ["recommendations"] as const,
  incoming: () => [...recommendationKeys.all, "incoming"] as const,
  album: (spotifyAlbumId: string) => [...recommendationKeys.all, "album", spotifyAlbumId] as const,
};

async function parseRecommendationError(response: Response) {
  const body = (await response.json().catch(() => null)) as { message?: string } | null;

  return new Error(body?.message ?? "Nao foi possivel concluir a recomendacao.");
}

export function useAlbumRecommendations(spotifyAlbumId: string) {
  return useQuery({
    queryKey: recommendationKeys.album(spotifyAlbumId),
    queryFn: async () => {
      const response = await fetch(
        `/api/recommendations/albums/${encodeURIComponent(spotifyAlbumId)}`,
      );

      if (response.status === 401) {
        return { outgoing: [] } satisfies AlbumRecommendationsPayload;
      }

      if (!response.ok) {
        throw await parseRecommendationError(response);
      }

      return (await response.json()) as AlbumRecommendationsPayload;
    },
  });
}

export function useIncomingRecommendations() {
  return useQuery({
    queryKey: recommendationKeys.incoming(),
    queryFn: async () => {
      const response = await fetch("/api/recommendations");

      if (response.status === 401) {
        return { recommendations: [] } satisfies IncomingRecommendationsPayload;
      }

      if (!response.ok) {
        throw await parseRecommendationError(response);
      }

      return (await response.json()) as IncomingRecommendationsPayload;
    },
  });
}

export function useCreateRecommendations(spotifyAlbumId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { receiverIds: string[]; message?: string }) => {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyAlbumId, ...input }),
      });

      if (!response.ok) {
        throw await parseRecommendationError(response);
      }

      return (await response.json()) as AlbumRecommendationsPayload;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: recommendationKeys.album(spotifyAlbumId) }),
        queryClient.invalidateQueries({ queryKey: recommendationKeys.incoming() }),
      ]);
    },
  });
}

export function useRecommendationAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recommendationId,
      action,
    }: {
      recommendationId: string;
      action: "accept" | "dismiss" | "cancel";
    }) => {
      const response = await fetch(`/api/recommendations/${recommendationId}/${action}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw await parseRecommendationError(response);
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
    },
  });
}
