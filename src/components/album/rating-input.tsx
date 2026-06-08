"use client";

import { Star } from "lucide-react";
import { cn, formatRating } from "@/lib/utils";

const ratings = Array.from({ length: 10 }, (_, index) => (index + 1) / 2);

export function RatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  const hasRating = value !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1" aria-label="Nota do album">
        {ratings.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            disabled={disabled}
            className={cn(
              "flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/35 transition hover:border-[#eef33f]/50 hover:text-[#eef33f] disabled:cursor-wait",
              hasRating && rating <= value && "border-[#eef33f]/40 bg-[#eef33f]/12 text-[#eef33f]",
            )}
            title={`Nota ${rating.toFixed(1)}`}
          >
            <Star size={15} fill={hasRating && rating <= value ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
      <span className="min-w-16 text-sm font-semibold text-white/70">{formatRating(value)}</span>
    </div>
  );
}
