"use client";

import { Search } from "lucide-react";
import type { AlbumStatus, LibraryFilters } from "@/types/album";
import { albumStatusLabels, albumStatuses } from "@/types/album";

export function LibraryFilters({
  filters,
  onChange,
}: {
  filters: LibraryFilters;
  onChange: (filters: LibraryFilters) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-3 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/38" size={17} />
        <input
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Filtrar por album, artista ou genero"
          className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/32 focus:border-[#4f5bff] focus:ring-2 focus:ring-[#4f5bff]/25"
        />
      </label>

      <select
        value={filters.status}
        onChange={(event) =>
          onChange({ ...filters, status: event.target.value as AlbumStatus | "all" })
        }
        className="h-10 rounded-xl border border-white/10 bg-[#11111d] px-3 text-sm font-medium text-white outline-none transition focus:border-[#4f5bff] focus:ring-2 focus:ring-[#4f5bff]/25"
      >
        <option value="all">Todos os status</option>
        {albumStatuses.map((status) => (
          <option key={status} value={status}>
            {albumStatusLabels[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
