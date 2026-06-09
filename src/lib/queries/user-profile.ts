"use client";

import { useQuery } from "@tanstack/react-query";
import type { UserProfilePayload } from "@/types/user-profile";

export const userProfileKeys = {
  all: ["user-profile"] as const,
  byHandle: (handle: string) => [...userProfileKeys.all, handle] as const,
};

export function useUserProfile(handle: string) {
  return useQuery({
    queryKey: userProfileKeys.byHandle(handle),
    queryFn: async () => {
      const response = await fetch(`/api/users/${encodeURIComponent(handle)}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Nao foi possivel carregar o perfil.");
      }

      return (await response.json()) as UserProfilePayload;
    },
  });
}
