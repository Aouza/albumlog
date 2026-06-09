"use client";

import { Heart, LogIn, MessageSquareText, Music } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AlbumCard } from "@/components/album/album-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useLibrary } from "@/lib/queries/albums";

type AuthUser = {
  id: string;
  spotifyUserId?: string;
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

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[28px] border border-white/10 bg-[#0b0b16]/86 p-5 text-white">
          Carregando perfil...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const library = useLibrary({ status: "all", query: "" });
  const me = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    refetchOnMount: "always",
    retry: false,
  });
  const spotifyUser = me.data?.user;
  const profile = spotifyUser;
  const favorites = library.data?.filter((entry) => entry.userAlbum.status === "favorite") ?? [];
  const reviews = library.data?.filter((entry) => entry.userAlbum.review.trim()).length ?? 0;

  return (
    <div className="space-y-6">
      {searchParams.get("login") === "spotify" && (
        <section className="rounded-2xl border border-[#1db954]/25 bg-[#1db954]/10 p-4 text-sm font-semibold text-[#93f5b8] shadow-[0_0_34px_rgba(29,185,84,0.12)]">
          Login com Spotify concluido. Seu perfil esta conectado ao AlbumLog.
        </section>
      )}

      {profile ? (
        <section className="rounded-[28px] border border-white/10 bg-[#0b0b16]/86 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.name}
              width={96}
              height={96}
              className="size-24 rounded-2xl object-cover ring-1 ring-white/15"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-2xl bg-[#1db954] text-3xl font-semibold text-black ring-1 ring-white/15">
              {profile.name.slice(0, 1)}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold text-white">{profile.name}</h1>
              {spotifyUser && (
                <span className="rounded-full border border-[#1db954]/25 bg-[#1db954]/10 px-2.5 py-1 text-xs font-semibold text-[#93f5b8]">
                  Spotify conectado
                </span>
              )}
            </div>
            <p className="mt-1 text-white/52">{profile.email || "Email nao informado pelo Spotify"}</p>
            {profile.handle && (
              <p className="mt-1 text-sm font-semibold text-[#eef33f]">@{profile.handle}</p>
            )}
            <p className="mt-2 text-sm text-white/42">Perfil autenticado pelo Spotify</p>
            {!profile.hasSpotifyLibraryScope && (
              <p className="mt-3 rounded-xl border border-[#eef33f]/20 bg-[#eef33f]/10 p-3 text-sm text-[#eef33f]">
                Reconecte com Spotify para autorizar a leitura dos seus albuns salvos.
              </p>
            )}
          </div>
        </div>
        </section>
      ) : (
        <EmptyState
          icon={LogIn}
          title="Entre para ver seu perfil"
          description="Conecte sua conta Spotify para exibir nome, avatar e email reais."
          action={{ href: "/login", label: "Entrar com Spotify" }}
        />
      )}

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.32)]">
          <Music className="text-[#8f97ff]" size={22} />
          <p className="mt-3 text-2xl font-semibold text-white">{library.data?.length ?? 0}</p>
          <p className="text-sm text-white/48">Albuns na biblioteca</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.32)]">
          <Heart className="text-[#eef33f]" size={22} />
          <p className="mt-3 text-2xl font-semibold text-white">{favorites.length}</p>
          <p className="text-sm text-white/48">Favoritos</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.32)]">
          <MessageSquareText className="text-[#11d3b0]" size={22} />
          <p className="mt-3 text-2xl font-semibold text-white">{reviews}</p>
          <p className="text-sm text-white/48">Reviews</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Favoritos</h2>
        {favorites.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {favorites.map((entry) => (
              <AlbumCard key={entry.userAlbum.id} album={entry.album} userAlbum={entry.userAlbum} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Nenhum favorito ainda"
            description="Seus favoritos do AlbumLog vao aparecer aqui quando a persistencia de status estiver conectada."
          />
        )}
      </section>
    </div>
  );
}
