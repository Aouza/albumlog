import type { AlbumStatus } from "@/types/album";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | null) {
  if (!date) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRating(rating: number | null) {
  return rating ? rating.toFixed(1) : "Sem nota";
}

export function statusTone(status: AlbumStatus) {
  const tones: Record<AlbumStatus, string> = {
    want_to_listen: "bg-[#eef33f]/10 text-[#eef33f] ring-[#eef33f]/22",
    listening: "bg-[#4f5bff]/14 text-[#a8afff] ring-[#4f5bff]/25",
    listened: "bg-[#11d3b0]/12 text-[#7ee7d6] ring-[#11d3b0]/24",
    favorite: "bg-[#ff5d8f]/12 text-[#ff9fbd] ring-[#ff5d8f]/24",
    abandoned: "bg-white/8 text-white/50 ring-white/12",
    relisten: "bg-[#b49cff]/12 text-[#cfc1ff] ring-[#b49cff]/24",
  };

  return tones[status];
}
