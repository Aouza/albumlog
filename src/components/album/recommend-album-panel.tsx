"use client";

import { Check, Loader2, Send, Share2, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Album } from "@/types/album";
import { useConnections } from "@/lib/queries/connections";
import {
  useAlbumRecommendations,
  useCreateRecommendations,
  useRecommendationAction,
} from "@/lib/queries/recommendations";

function Avatar({
  src,
  name,
  size = 34,
}: {
  src: string;
  name: string;
  size?: number;
}) {
  if (!src) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold text-white"
        style={{ width: size, height: size }}
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-white/10 object-cover"
    />
  );
}

export function RecommendAlbumPanel({ album }: { album: Album }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const connections = useConnections();
  const recommendations = useAlbumRecommendations(album.spotifyId);
  const createRecommendations = useCreateRecommendations(album.spotifyId);
  const recommendationAction = useRecommendationAction();

  const alreadyRecommendedIds = useMemo(
    () => new Set(recommendations.data?.outgoing.map((item) => item.receiver.id) ?? []),
    [recommendations.data],
  );
  const availableConnections =
    connections.data?.accepted.filter((connection) => !alreadyRecommendedIds.has(connection.user.id)) ??
    [];

  function toggleReceiver(receiverId: string) {
    setSelectedIds((current) =>
      current.includes(receiverId)
        ? current.filter((selectedId) => selectedId !== receiverId)
        : [...current, receiverId],
    );
  }

  async function submitRecommendation() {
    if (selectedIds.length === 0) {
      return;
    }

    await createRecommendations.mutateAsync({
      receiverIds: selectedIds,
      message,
    });
    setSelectedIds([]);
    setMessage("");
    setIsOpen(false);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Recomendar</h2>
          <p className="mt-1 text-sm text-white/45">Envie este album para uma conexao.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white transition hover:border-[#8f97ff]/60 hover:text-[#8f97ff]"
          aria-label="Recomendar album"
          title="Recomendar album"
        >
          <Share2 size={18} />
        </button>
      </div>

      {recommendations.data?.outgoing.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {recommendations.data.outgoing.map((recommendation) => (
            <div
              key={recommendation.id}
              className="group relative flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] py-1 pl-1 pr-3"
              title={`${recommendation.receiver.name} - ${
                recommendation.status === "pending" ? "pendente" : "aceita"
              }`}
            >
              <Avatar
                src={recommendation.receiver.avatarUrl}
                name={recommendation.receiver.name}
                size={30}
              />
              <span className="max-w-28 truncate text-xs font-semibold text-white/70">
                @{recommendation.receiver.handle}
              </span>
              {recommendation.status === "pending" ? (
                <button
                  type="button"
                  onClick={() =>
                    recommendationAction.mutate({
                      recommendationId: recommendation.id,
                      action: "cancel",
                    })
                  }
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#ff5f7a] text-white opacity-100 shadow-[0_8px_18px_rgba(255,95,122,0.35)] transition hover:bg-[#ff7890]"
                  aria-label={`Cancelar recomendacao para ${recommendation.receiver.name}`}
                  title="Cancelar recomendacao"
                >
                  <X size={12} />
                </button>
              ) : (
                <Check size={14} className="text-[#eef33f]" />
              )}
            </div>
          ))}
        </div>
      ) : null}

      {isOpen && (
        <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          {connections.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-white/52">
              <Loader2 className="animate-spin" size={16} />
              Carregando conexoes...
            </div>
          ) : availableConnections.length === 0 ? (
            <p className="text-sm text-white/48">
              Nenhuma conexao disponivel para recomendar este album agora.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {availableConnections.map((connection) => {
                const isSelected = selectedIds.includes(connection.user.id);

                return (
                  <button
                    key={connection.id}
                    type="button"
                    onClick={() => toggleReceiver(connection.user.id)}
                    className={`flex min-w-0 items-center gap-3 rounded-xl border p-2 text-left transition ${
                      isSelected
                        ? "border-[#8f97ff]/70 bg-[#4f5bff]/18"
                        : "border-white/10 bg-white/[0.04] hover:border-white/20"
                    }`}
                  >
                    <Avatar src={connection.user.avatarUrl} name={connection.user.name} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">
                        {connection.user.name}
                      </span>
                      <span className="block truncate text-xs text-white/42">
                        @{connection.user.handle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {availableConnections.length > 0 && (
            <>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Mensagem opcional"
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#05050c]/70 p-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#4f5bff] focus:ring-2 focus:ring-[#4f5bff]/20"
              />
              {createRecommendations.error && (
                <p className="text-sm text-[#ff8da0]">{createRecommendations.error.message}</p>
              )}
              <button
                type="button"
                onClick={submitRecommendation}
                disabled={selectedIds.length === 0 || createRecommendations.isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4f5bff] px-4 text-sm font-semibold text-white transition hover:bg-[#6570ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {createRecommendations.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Send size={16} />
                )}
                Enviar recomendacao
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
