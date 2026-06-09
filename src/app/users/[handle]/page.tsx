"use client";

import { Library, Lock, UserCircle, UsersRound } from "lucide-react";
import Image from "next/image";
import { use } from "react";
import { AlbumCover } from "@/components/album/album-cover";
import { EmptyState } from "@/components/ui/empty-state";
import { useUserProfile } from "@/lib/queries/user-profile";
import type { AlbumInCommon } from "@/types/user-profile";

function AlbumInCommonRow({ item }: { item: AlbumInCommon }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <AlbumCover album={item.album} priority={false} className="size-16 shrink-0" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{item.album.title}</p>
        <p className="truncate text-xs text-white/42">{item.album.artist}</p>
      </div>
    </div>
  );
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const profileQuery = useUserProfile(handle);
  const profile = profileQuery.data;

  if (profileQuery.isLoading) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#0b0b16]/86 p-5 text-white">
        Carregando perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        icon={UserCircle}
        title="Perfil nao encontrado"
        description="Nao encontramos nenhum usuario com esse handle."
      />
    );
  }

  const canShowCommonAlbums = profile.relationship === "connected";

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[#0b0b16]/86 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {profile.user.avatarUrl ? (
            <Image
              src={profile.user.avatarUrl}
              alt={profile.user.name}
              width={96}
              height={96}
              className="size-24 rounded-2xl object-cover ring-1 ring-white/15"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-2xl bg-white/[0.06] text-3xl font-semibold text-white ring-1 ring-white/15">
              {profile.user.name.slice(0, 1)}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold text-white">{profile.user.name}</h1>
              {profile.relationship === "connected" && (
                <span className="rounded-full border border-[#eef33f]/25 bg-[#eef33f]/10 px-2.5 py-1 text-xs font-semibold text-[#eef33f]">
                  Conectado
                </span>
              )}
              {profile.relationship === "self" && (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white/62">
                  Voce
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-semibold text-[#eef33f]">@{profile.user.handle}</p>
            <p className="mt-2 text-sm text-white/42">
              {profile.relationship === "none"
                ? "Perfil publico basico"
                : "Perfil conectado no AlbumLog"}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eef33f]">Biblioteca</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Albuns em comum</h2>
          <p className="mt-1 text-sm text-white/45">
            {canShowCommonAlbums
              ? `${profile.albumsInCommonTotal} albuns aparecem nas duas bibliotecas.`
              : "Conecte-se com este usuario para comparar bibliotecas."}
          </p>
        </div>

        {canShowCommonAlbums && profile.albumsInCommon.length > 0 && (
          <div className="grid gap-3 lg:grid-cols-2">
            {profile.albumsInCommon.map((item) => (
              <AlbumInCommonRow key={item.album.id} item={item} />
            ))}
          </div>
        )}

        {canShowCommonAlbums && profile.albumsInCommon.length === 0 && (
          <EmptyState
            icon={Library}
            title="Nenhum album em comum ainda"
            description="Quando as bibliotecas tiverem albuns iguais, eles aparecem aqui."
          />
        )}

        {!canShowCommonAlbums && (
          <EmptyState
            icon={profile.relationship === "self" ? UsersRound : Lock}
            title={profile.relationship === "self" ? "Este e seu perfil" : "Conexao necessaria"}
            description={
              profile.relationship === "self"
                ? "Abra o perfil de uma conexao para ver albuns em comum."
                : "Informacoes sociais ficam disponiveis quando a conexao for aceita."
            }
          />
        )}
      </section>
    </div>
  );
}
