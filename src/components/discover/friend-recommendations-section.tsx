"use client";

import { Check, Loader2, UsersRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AlbumCover } from "@/components/album/album-cover";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useIncomingRecommendations,
  useRecommendationAction,
} from "@/lib/queries/recommendations";
import { getFriendRecommendationsEmptyStateCopy } from "@/lib/ui/discover-empty-states";
import { getDiscoverStaticSections } from "@/lib/ui/discover-sections";

function SenderAvatar({ src, name }: { src: string; name: string }) {
  if (!src) {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold text-white">
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={32}
      height={32}
      className="size-8 shrink-0 rounded-full border border-white/10 object-cover"
    />
  );
}

export function FriendRecommendationsSection() {
  const incoming = useIncomingRecommendations();
  const recommendationAction = useRecommendationAction();
  const friendEmptyState = getFriendRecommendationsEmptyStateCopy();
  const friendSection = getDiscoverStaticSections()[0];
  const recommendations = incoming.data?.recommendations ?? [];

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eef33f]">
          {friendSection.eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">{friendSection.title}</h2>
        <p className="mt-1 text-sm text-white/45">{friendSection.description}</p>
      </div>

      {incoming.isLoading ? (
        <div className="flex items-center gap-2 rounded-[28px] border border-white/10 bg-[#0b0b16]/72 p-6 text-sm text-white/52">
          <Loader2 className="animate-spin" size={16} />
          Carregando recomendacoes...
        </div>
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={friendEmptyState.title}
          description={friendEmptyState.description}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {recommendations.map((recommendation) => (
            <article
              key={recommendation.id}
              className="grid grid-cols-[88px_1fr] gap-4 rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-3 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-xl"
            >
              <Link href={`/albums/${recommendation.album.id}`} className="block">
                <AlbumCover album={recommendation.album} className="rounded-xl" />
              </Link>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <SenderAvatar src={recommendation.sender.avatarUrl} name={recommendation.sender.name} />
                  <p className="min-w-0 truncate text-xs text-white/48">
                    <span className="font-semibold text-white/75">{recommendation.sender.name}</span>{" "}
                    recomendou
                  </p>
                </div>
                <Link href={`/albums/${recommendation.album.id}`} className="mt-3 block">
                  <h3 className="truncate text-base font-semibold text-white">
                    {recommendation.album.title}
                  </h3>
                  <p className="mt-1 truncate text-sm text-white/45">{recommendation.album.artist}</p>
                </Link>
                {recommendation.message ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/54">
                    {recommendation.message}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      recommendationAction.mutate({
                        recommendationId: recommendation.id,
                        action: "accept",
                      })
                    }
                    disabled={recommendationAction.isPending}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#4f5bff] px-3 text-xs font-semibold text-white transition hover:bg-[#6570ff] disabled:opacity-45"
                  >
                    <Check size={14} />
                    Aceitar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      recommendationAction.mutate({
                        recommendationId: recommendation.id,
                        action: "dismiss",
                      })
                    }
                    disabled={recommendationAction.isPending}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white disabled:opacity-45"
                  >
                    <X size={14} />
                    Recusar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
