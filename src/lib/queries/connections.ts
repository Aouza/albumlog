"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ConnectionSearchResult, ConnectionsPayload } from "@/types/connection";

export const connectionKeys = {
  all: ["connections"] as const,
  list: () => [...connectionKeys.all, "list"] as const,
  search: (query: string) => [...connectionKeys.all, "search", query] as const,
};

async function parseConnectionError(response: Response) {
  const body = (await response.json().catch(() => null)) as { message?: string } | null;

  return new Error(body?.message ?? "Nao foi possivel concluir a acao.");
}

export function useConnections() {
  return useQuery({
    queryKey: connectionKeys.list(),
    queryFn: async () => {
      const response = await fetch("/api/connections");

      if (response.status === 401) {
        return { accepted: [], incoming: [], outgoing: [] } satisfies ConnectionsPayload;
      }

      if (!response.ok) {
        throw await parseConnectionError(response);
      }

      return (await response.json()) as ConnectionsPayload;
    },
  });
}

export function useConnectionUserSearch(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: connectionKeys.search(normalizedQuery),
    enabled: normalizedQuery.length >= 2,
    queryFn: async () => {
      const response = await fetch(
        `/api/connections/users?q=${encodeURIComponent(normalizedQuery)}`,
      );

      if (response.status === 401) {
        return [];
      }

      if (!response.ok) {
        throw await parseConnectionError(response);
      }

      const payload = (await response.json()) as { users: ConnectionSearchResult[] };

      return payload.users;
    },
  });
}

export function useSendConnectionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receiverId: string) => {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });

      if (!response.ok) {
        throw await parseConnectionError(response);
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: connectionKeys.all });
    },
  });
}

export function useConnectionAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      connectionId,
      action,
    }: {
      connectionId: string;
      action: "accept" | "decline" | "remove";
    }) => {
      const response = await fetch(
        action === "remove"
          ? `/api/connections/${connectionId}`
          : `/api/connections/${connectionId}/${action}`,
        { method: action === "remove" ? "DELETE" : "POST" },
      );

      if (!response.ok) {
        throw await parseConnectionError(response);
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: connectionKeys.all });
    },
  });
}
