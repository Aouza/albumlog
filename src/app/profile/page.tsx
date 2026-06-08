"use client";

import { Heart, MessageSquareText, Music } from "lucide-react";
import Image from "next/image";
import { AlbumCard } from "@/components/album/album-card";
import { currentUser } from "@/lib/mock-api/albums";
import { useLibrary } from "@/lib/queries/albums";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const library = useLibrary({ status: "all", query: "" });
  const favorites = library.data?.filter((entry) => entry.userAlbum.status === "favorite") ?? [];
  const reviews = library.data?.filter((entry) => entry.userAlbum.review.trim()).length ?? 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[#0b0b16]/86 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Image
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            width={96}
            height={96}
            className="size-24 rounded-2xl object-cover ring-1 ring-white/15"
          />
          <div>
            <h1 className="text-3xl font-semibold text-white">{currentUser.name}</h1>
            <p className="mt-1 text-white/52">{currentUser.email}</p>
            <p className="mt-2 text-sm text-white/42">No AlbumLog desde {formatDate(currentUser.createdAt)}</p>
          </div>
        </div>
      </section>

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
        <div className="grid gap-3 lg:grid-cols-2">
          {favorites.map((entry) => (
            <AlbumCard key={entry.userAlbum.id} album={entry.album} userAlbum={entry.userAlbum} />
          ))}
        </div>
      </section>
    </div>
  );
}
