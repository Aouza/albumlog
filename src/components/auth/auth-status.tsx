"use client";

import { ChevronDown, LogIn, LogOut, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type AuthUser = {
  id: string;
  handle: string | null;
  name: string;
  email: string;
  avatarUrl: string;
  hasSpotifyLibraryScope?: boolean;
};

async function getMe() {
  const response = await fetch("/api/auth/me");

  if (!response.ok) {
    return { user: null as AuthUser | null };
  }

  return (await response.json()) as { user: AuthUser | null };
}

export function AuthStatus() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const me = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: false,
  });
  const user = me.data?.user;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }

  if (me.isLoading) {
    return (
      <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/48 sm:w-auto sm:px-3">
        <UserCircle size={16} className="sm:hidden" />
        <span className="hidden sm:inline">Verificando...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex size-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/72 transition hover:bg-white/10 hover:text-white sm:w-auto sm:px-3"
        aria-label="Entrar com Spotify"
        title="Entrar com Spotify"
      >
        <LogIn size={16} />
        <span className="hidden sm:inline">Spotify</span>
      </Link>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#1db954]/25 bg-[#1db954]/10 p-1.5 text-left shadow-[0_0_28px_rgba(29,185,84,0.14)] transition hover:bg-[#1db954]/15 sm:pr-2"
        aria-expanded={open}
        aria-label="Abrir menu da conta"
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            width={32}
            height={32}
            className="size-8 rounded-xl object-cover"
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-xl bg-[#1db954] text-black">
            <UserCircle size={18} />
          </div>
        )}
        <span className="hidden max-w-28 truncate text-sm font-semibold text-white/86 sm:block">{user.name}</span>
        <ChevronDown size={15} className="hidden text-white/45 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b16] shadow-[0_24px_90px_rgba(0,0,0,0.62)]">
          <div className="border-b border-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1db954]">
              Conectado via Spotify
            </p>
            <p className="mt-2 truncate text-sm font-semibold text-white">{user.name}</p>
            {user.handle && (
              <p className="mt-1 truncate text-xs font-semibold text-[#eef33f]">@{user.handle}</p>
            )}
            <p className="mt-1 truncate text-xs text-white/45">{user.email || "Email nao informado"}</p>
            {!user.hasSpotifyLibraryScope && (
              <p className="mt-3 rounded-xl border border-[#eef33f]/20 bg-[#eef33f]/10 p-2 text-xs leading-5 text-[#eef33f]">
                Reconecte para liberar seus albuns salvos.
              </p>
            )}
          </div>
          <div className="p-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white/72 transition hover:bg-white/8 hover:text-white"
            >
              <UserCircle size={16} />
              Ver perfil
            </Link>
            <button
              type="button"
              onClick={logout}
              className="mt-1 flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white/72 transition hover:bg-white/8 hover:text-white"
            >
              <LogOut size={16} />
              Sair do AlbumLog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
