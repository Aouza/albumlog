"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import type { AlbumStatus, UserAlbum } from "@/types/album";
import { RatingInput } from "@/components/album/rating-input";
import { StatusSelect } from "@/components/album/status-select";
import { useUpdateUserAlbum } from "@/lib/queries/albums";

export function ReviewEditor({
  albumId,
  userAlbum,
}: {
  albumId: string;
  userAlbum: UserAlbum | null;
}) {
  const updateAlbum = useUpdateUserAlbum();
  const [status, setStatus] = useState<AlbumStatus>(userAlbum?.status ?? "want_to_listen");
  const [rating, setRating] = useState<number | null>(userAlbum?.rating ?? null);
  const [review, setReview] = useState(userAlbum?.review ?? "");

  function save() {
    updateAlbum.mutate({
      albumId,
      status,
      rating,
      review,
    });
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Sua entrada</h2>
        <StatusSelect value={status} onChange={setStatus} disabled={updateAlbum.isPending} />
      </div>

      <div className="mt-4">
        <RatingInput value={rating} onChange={setRating} disabled={updateAlbum.isPending} />
      </div>

      <textarea
        value={review}
        onChange={(event) => setReview(event.target.value)}
        placeholder="Escreva sua review..."
        className="mt-4 min-h-36 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none transition placeholder:text-white/32 focus:border-[#4f5bff] focus:ring-2 focus:ring-[#4f5bff]/25"
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-white/45">
          {updateAlbum.isSuccess
            ? "Entrada salva na sua biblioteca."
            : "Status, nota e review ficam salvos na sua biblioteca AlbumLog."}
        </p>
        <button
          type="button"
          onClick={save}
          disabled={updateAlbum.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#4f5bff] px-4 text-sm font-semibold text-white shadow-[0_0_28px_rgba(79,91,255,0.32)] transition hover:bg-[#6570ff] disabled:cursor-wait disabled:opacity-70"
        >
          <Save size={16} />
          Salvar
        </button>
      </div>
    </section>
  );
}
